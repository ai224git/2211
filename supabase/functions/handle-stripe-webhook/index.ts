import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";
import Stripe from "npm:stripe@14.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
};

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const stripe = new Stripe(STRIPE_SECRET || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Helper function to find user with retries
async function findUserWithRetry(supabase: any, email: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔍 Attempting to find user for email: ${email} (attempt ${i + 1}/${maxRetries})`);
    
    const { data: userData, error: userError } = await supabase
      .auth
      .admin
      .listUsers({
        filter: {
          email: email.toLowerCase()
        }
      });
    
    if (userError) {
      console.error(`❌ Error finding user on attempt ${i + 1}:`, userError);
      if (i === maxRetries - 1) throw userError;
      continue;
    }
    
    if (userData.users && userData.users.length > 0) {
      const userId = userData.users[0].id;
      console.log(`✅ Found user ID: ${userId}`);
      return userId;
    }
    
    if (i < maxRetries - 1) {
      const delay = 3000; // 3 seconds between retries
      console.log(`⏳ User not found, waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`User not found for email after ${maxRetries} attempts: ${email}`);
}

// Helper function to ensure user profile exists
async function ensureUserProfile(supabase: any, userId: string): Promise<void> {
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  
  if (profileError || !profile) {
    console.log(`⚠️ Creating missing profile for user ${userId}`);
    const { error: createError } = await supabase
      .from("user_profiles")
      .insert([{ user_id: userId, tokens: 0 }]);
    
    if (createError) {
      throw new Error(`Failed to create user profile: ${createError.message}`);
    }
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing signature or webhook secret");
    }

    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;

      if (!customerEmail) {
        throw new Error("Customer email missing from session");
      }

      console.log(`📧 Processing payment for email: ${customerEmail}`);

      // Find user with retries
      const userId = await findUserWithRetry(supabase, customerEmail);
      
      // Ensure user profile exists
      await ensureUserProfile(supabase, userId);

      // Add token to user's account
      const { data: updateData, error: updateError } = await supabase
        .from("user_profiles")
        .update({ tokens: supabase.rpc("increment", { amount: 1 }) })
        .eq("user_id", userId)
        .select();

      if (updateError) {
        console.error("❌ Failed to update tokens:", updateError);
        throw new Error(`Failed to update tokens: ${updateError.message}`);
      }

      console.log(`✅ Successfully added 1 token to user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});