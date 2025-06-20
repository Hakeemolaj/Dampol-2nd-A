import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a mock client for development if real credentials aren't provided
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (will be generated from Supabase CLI)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          middle_name?: string
          phone?: string
          date_of_birth?: string
          gender?: string
          civil_status?: string
          occupation?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          middle_name?: string
          phone?: string
          date_of_birth?: string
          gender?: string
          civil_status?: string
          occupation?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          middle_name?: string
          phone?: string
          date_of_birth?: string
          gender?: string
          civil_status?: string
          occupation?: string
          created_at?: string
          updated_at?: string
        }
      }
      residents: {
        Row: {
          id: string
          user_id: string
          resident_id: string
          household_id?: string
          relationship_to_head?: string
          is_registered_voter: boolean
          voter_id?: string
          is_pwd: boolean
          pwd_id?: string
          is_senior_citizen: boolean
          is_4ps_beneficiary: boolean
          emergency_contact_name?: string
          emergency_contact_phone?: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resident_id: string
          household_id?: string
          relationship_to_head?: string
          is_registered_voter?: boolean
          voter_id?: string
          is_pwd?: boolean
          pwd_id?: string
          is_senior_citizen?: boolean
          is_4ps_beneficiary?: boolean
          emergency_contact_name?: string
          emergency_contact_phone?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resident_id?: string
          household_id?: string
          relationship_to_head?: string
          is_registered_voter?: boolean
          voter_id?: string
          is_pwd?: boolean
          pwd_id?: string
          is_senior_citizen?: boolean
          is_4ps_beneficiary?: boolean
          emergency_contact_name?: string
          emergency_contact_phone?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      document_requests: {
        Row: {
          id: string
          request_number: string
          document_type_id: string
          applicant_id: string
          purpose: string
          status: string
          fee_amount?: number
          payment_status: string
          payment_reference?: string
          requested_at: string
          processed_at?: string
          released_at?: string
          processed_by?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_number: string
          document_type_id: string
          applicant_id: string
          purpose: string
          status?: string
          fee_amount?: number
          payment_status?: string
          payment_reference?: string
          requested_at?: string
          processed_at?: string
          released_at?: string
          processed_by?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_number?: string
          document_type_id?: string
          applicant_id?: string
          purpose?: string
          status?: string
          fee_amount?: number
          payment_status?: string
          payment_reference?: string
          requested_at?: string
          processed_at?: string
          released_at?: string
          processed_by?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          summary?: string
          category?: string
          priority: string
          author_id: string
          is_published: boolean
          published_at?: string
          expires_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string
          category?: string
          priority?: string
          author_id: string
          is_published?: boolean
          published_at?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string
          category?: string
          priority?: string
          author_id?: string
          is_published?: boolean
          published_at?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
