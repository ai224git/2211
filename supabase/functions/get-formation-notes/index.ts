import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, Authorization, Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formation_id } = await req.json();

    if (!formation_id) {
      return new Response(
        JSON.stringify({ error: "formation_id is required" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Invalid Authorization header" }), 
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Verify the JWT token
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }), 
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check if user has viewed this formation
    const { data: formationView } = await supabase
      .from("formation_views")
      .select("*")
      .eq("user_id", user.id)
      .eq("formation_id", formation_id)
      .single();

    // If user hasn't viewed the formation, check their tokens
    if (!formationView) {
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("tokens")
        .eq("user_id", user.id)
        .single();

      if (!userProfile || userProfile.tokens < 1) {
        return new Response(
          JSON.stringify({ error: "Insufficient tokens" }), 
          { 
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // User has tokens, create formation view and deduct token
      const { error: transactionError } = await supabase.rpc("use_token_for_formation", {
        p_user_id: user.id,
        p_formation_id: formation_id
      });

      if (transactionError) {
        return new Response(
          JSON.stringify({ error: "Failed to process token" }), 
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    // Get formation notes
    const { data: formation, error: formationError } = await supabase
      .from("formations")
      .select("notes")
      .eq("id", formation_id)
      .single();

    if (formationError || !formation) {
      console.error("Error fetching formation:", formationError);
      return new Response(
        JSON.stringify({ error: "Formation not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ notes: formation.notes }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in get-formation-notes:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});