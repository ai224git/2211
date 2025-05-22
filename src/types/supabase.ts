export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      formations: {
        Row: {
          id: number
          etablissement: string
          filiere: string
          voie: string
          ville: string
          departement: string
          places: number
          notes: string
          created_at: string
        }
        Insert: {
          id?: number
          etablissement: string
          filiere: string
          voie: string
          ville: string
          departement: string
          places: number
          notes: string
          created_at?: string
        }
        Update: {
          id?: number
          etablissement?: string
          filiere?: string
          voie?: string
          ville?: string
          departement?: string
          places?: number
          notes?: string
          created_at?: string
        }
      }
      formation_list: {
        Row: {
          id: number
          etablissement: string
          filiere: string
          voie: string
          ville: string
          departement: string
          places: number
          created_at: string
        }
        Insert: {
          id?: number
          etablissement: string
          filiere: string
          voie: string
          ville: string
          departement: string
          places: number
          created_at?: string
        }
        Update: {
          id?: number
          etablissement?: string
          filiere?: string
          voie?: string
          ville?: string
          departement?: string
          places?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: number
          user_id: string
          tokens: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          tokens?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          tokens?: number
          created_at?: string
        }
      }
      formation_views: {
        Row: {
          id: number
          user_id: string
          formation_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          formation_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          formation_id?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      use_token_for_formation: {
        Args: {
          p_user_id: string
          p_formation_id: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}