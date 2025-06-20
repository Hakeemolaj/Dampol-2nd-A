import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

// Admin client with service key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Regular client with anon key for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

// Database types (will be generated from Supabase CLI)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          middle_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          civil_status?: string;
          occupation?: string;
          address?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          middle_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          civil_status?: string;
          occupation?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          middle_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          civil_status?: string;
          occupation?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      residents: {
        Row: {
          id: string;
          user_id: string;
          resident_id: string;
          household_id?: string;
          relationship_to_head?: string;
          is_registered_voter: boolean;
          voter_id?: string;
          is_pwd: boolean;
          pwd_id?: string;
          is_senior_citizen: boolean;
          is_4ps_beneficiary: boolean;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resident_id: string;
          household_id?: string;
          relationship_to_head?: string;
          is_registered_voter?: boolean;
          voter_id?: string;
          is_pwd?: boolean;
          pwd_id?: string;
          is_senior_citizen?: boolean;
          is_4ps_beneficiary?: boolean;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resident_id?: string;
          household_id?: string;
          relationship_to_head?: string;
          is_registered_voter?: boolean;
          voter_id?: string;
          is_pwd?: boolean;
          pwd_id?: string;
          is_senior_citizen?: boolean;
          is_4ps_beneficiary?: boolean;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_requests: {
        Row: {
          id: string;
          request_number: string;
          document_type_id: string;
          applicant_id: string;
          purpose: string;
          status: string;
          fee_amount?: number;
          payment_status: string;
          payment_reference?: string;
          requested_at: string;
          processed_at?: string;
          released_at?: string;
          processed_by?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_number: string;
          document_type_id: string;
          applicant_id: string;
          purpose: string;
          status?: string;
          fee_amount?: number;
          payment_status?: string;
          payment_reference?: string;
          requested_at?: string;
          processed_at?: string;
          released_at?: string;
          processed_by?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_number?: string;
          document_type_id?: string;
          applicant_id?: string;
          purpose?: string;
          status?: string;
          fee_amount?: number;
          payment_status?: string;
          payment_reference?: string;
          requested_at?: string;
          processed_at?: string;
          released_at?: string;
          processed_by?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_types: {
        Row: {
          id: string;
          name: string;
          description?: string;
          requirements?: any;
          fee: number;
          processing_time_days: number;
          validity_days?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          requirements?: any;
          fee?: number;
          processing_time_days?: number;
          validity_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          requirements?: any;
          fee?: number;
          processing_time_days?: number;
          validity_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          summary?: string;
          category?: string;
          priority: string;
          author_id: string;
          is_published: boolean;
          published_at?: string;
          expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          summary?: string;
          category?: string;
          priority?: string;
          author_id: string;
          is_published?: boolean;
          published_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          summary?: string;
          category?: string;
          priority?: string;
          author_id?: string;
          is_published?: boolean;
          published_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
