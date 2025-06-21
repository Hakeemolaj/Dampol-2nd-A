// Auto-generated database types for Supabase
// This file should be regenerated when the database schema changes
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

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
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          middle_name: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          civil_status: string | null
          occupation: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          middle_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          occupation?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          middle_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          occupation?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      households: {
        Row: {
          id: string
          household_number: string
          head_of_family: string | null
          address_line1: string
          address_line2: string | null
          purok: string | null
          coordinates: unknown | null
          household_type: string | null
          monthly_income: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_number: string
          head_of_family?: string | null
          address_line1: string
          address_line2?: string | null
          purok?: string | null
          coordinates?: unknown | null
          household_type?: string | null
          monthly_income?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_number?: string
          head_of_family?: string | null
          address_line1?: string
          address_line2?: string | null
          purok?: string | null
          coordinates?: unknown | null
          household_type?: string | null
          monthly_income?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_head_of_family_fkey"
            columns: ["head_of_family"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      residents: {
        Row: {
          id: string
          user_id: string | null
          resident_id: string
          household_id: string | null
          relationship_to_head: string | null
          is_registered_voter: boolean | null
          voter_id: string | null
          is_pwd: boolean | null
          pwd_id: string | null
          is_senior_citizen: boolean | null
          is_4ps_beneficiary: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          resident_id: string
          household_id?: string | null
          relationship_to_head?: string | null
          is_registered_voter?: boolean | null
          voter_id?: string | null
          is_pwd?: boolean | null
          pwd_id?: string | null
          is_senior_citizen?: boolean | null
          is_4ps_beneficiary?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          resident_id?: string
          household_id?: string | null
          relationship_to_head?: string | null
          is_registered_voter?: boolean | null
          voter_id?: string | null
          is_pwd?: boolean | null
          pwd_id?: string | null
          is_senior_citizen?: boolean | null
          is_4ps_beneficiary?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string
          category: string
          priority: string | null
          is_published: boolean | null
          published_at: string | null
          expires_at: string | null
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content: string
          category: string
          priority?: string | null
          is_published?: boolean | null
          published_at?: string | null
          expires_at?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          content?: string
          category?: string
          priority?: string | null
          is_published?: boolean | null
          published_at?: string | null
          expires_at?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      document_types: {
        Row: {
          id: string
          name: string
          description: string | null
          fee_amount: number | null
          processing_days: number | null
          requirements: Json | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          fee_amount?: number | null
          processing_days?: number | null
          requirements?: Json | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          fee_amount?: number | null
          processing_days?: number | null
          requirements?: Json | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          id: string
          request_number: string
          document_type_id: string
          applicant_id: string
          purpose: string
          status: string | null
          fee_amount: number | null
          payment_status: string | null
          payment_reference: string | null
          requested_at: string | null
          processed_at: string | null
          released_at: string | null
          processed_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_number: string
          document_type_id: string
          applicant_id: string
          purpose: string
          status?: string | null
          fee_amount?: number | null
          payment_status?: string | null
          payment_reference?: string | null
          requested_at?: string | null
          processed_at?: string | null
          released_at?: string | null
          processed_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_number?: string
          document_type_id?: string
          applicant_id?: string
          purpose?: string
          status?: string | null
          fee_amount?: number | null
          payment_status?: string | null
          payment_reference?: string | null
          requested_at?: string | null
          processed_at?: string | null
          released_at?: string | null
          processed_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_applicant_id_fkey"
            columns: ["applicant_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_document_type_id_fkey"
            columns: ["document_type_id"]
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_processed_by_fkey"
            columns: ["processed_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
