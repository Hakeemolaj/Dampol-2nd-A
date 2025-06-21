// Auto-generated database types for Supabase
// This file should be regenerated when the database schema changes
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/config/database.types.ts

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
          role: string | null
          position: string | null
          department: string | null
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
          role?: string | null
          position?: string | null
          department?: string | null
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
          role?: string | null
          position?: string | null
          department?: string | null
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
      streams: {
        Row: {
          id: string
          title: string
          description: string | null
          stream_key: string
          category: string | null
          status: string | null
          is_public: boolean | null
          recording_enabled: boolean | null
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          viewer_count: number | null
          peak_viewer_count: number | null
          final_viewer_count: number | null
          recording_url: string | null
          recording_path: string | null
          hls_url: string | null
          rtmp_url: string | null
          thumbnail_url: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          stream_key: string
          category?: string | null
          status?: string | null
          is_public?: boolean | null
          recording_enabled?: boolean | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          viewer_count?: number | null
          peak_viewer_count?: number | null
          final_viewer_count?: number | null
          recording_url?: string | null
          recording_path?: string | null
          hls_url?: string | null
          rtmp_url?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          stream_key?: string
          category?: string | null
          status?: string | null
          is_public?: boolean | null
          recording_enabled?: boolean | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          viewer_count?: number | null
          peak_viewer_count?: number | null
          final_viewer_count?: number | null
          recording_url?: string | null
          recording_path?: string | null
          hls_url?: string | null
          rtmp_url?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streams_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_viewers: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          session_id: string
          joined_at: string | null
          left_at: string | null
          watch_duration_seconds: number | null
          ip_address: string | null
          user_agent: string | null
          device_type: string | null
          browser: string | null
          location_data: Json | null
          chat_messages_count: number | null
          reactions_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          session_id: string
          joined_at?: string | null
          left_at?: string | null
          watch_duration_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          location_data?: Json | null
          chat_messages_count?: number | null
          reactions_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          session_id?: string
          joined_at?: string | null
          left_at?: string | null
          watch_duration_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          location_data?: Json | null
          chat_messages_count?: number | null
          reactions_count?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_viewers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_chat: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          viewer_session_id: string | null
          message: string
          message_type: string | null
          is_moderated: boolean | null
          moderated_by: string | null
          moderated_at: string | null
          moderation_reason: string | null
          timestamp: string | null
          edited_at: string | null
          reply_to_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          viewer_session_id?: string | null
          message: string
          message_type?: string | null
          is_moderated?: boolean | null
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          timestamp?: string | null
          edited_at?: string | null
          reply_to_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          viewer_session_id?: string | null
          message?: string
          message_type?: string | null
          is_moderated?: boolean | null
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          timestamp?: string | null
          edited_at?: string | null
          reply_to_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_chat_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_chat_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_reactions: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          viewer_session_id: string | null
          reaction_type: string
          reaction_emoji: string | null
          timestamp: string | null
          stream_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          viewer_session_id?: string | null
          reaction_type: string
          reaction_emoji?: string | null
          timestamp?: string | null
          stream_time_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          viewer_session_id?: string | null
          reaction_type?: string
          reaction_emoji?: string | null
          timestamp?: string | null
          stream_time_seconds?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_reactions_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_reactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_analytics: {
        Row: {
          id: string
          stream_id: string
          hour_timestamp: string
          unique_viewers: number | null
          concurrent_viewers: number | null
          peak_concurrent_viewers: number | null
          total_watch_time_seconds: number | null
          average_watch_time_seconds: number | null
          chat_messages: number | null
          reactions: number | null
          new_joins: number | null
          viewer_drops: number | null
          stream_quality_score: number | null
          buffering_events: number | null
          connection_issues: number | null
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          hour_timestamp: string
          unique_viewers?: number | null
          concurrent_viewers?: number | null
          peak_concurrent_viewers?: number | null
          total_watch_time_seconds?: number | null
          average_watch_time_seconds?: number | null
          chat_messages?: number | null
          reactions?: number | null
          new_joins?: number | null
          viewer_drops?: number | null
          stream_quality_score?: number | null
          buffering_events?: number | null
          connection_issues?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          hour_timestamp?: string
          unique_viewers?: number | null
          concurrent_viewers?: number | null
          peak_concurrent_viewers?: number | null
          total_watch_time_seconds?: number | null
          average_watch_time_seconds?: number | null
          chat_messages?: number | null
          reactions?: number | null
          new_joins?: number | null
          viewer_drops?: number | null
          stream_quality_score?: number | null
          buffering_events?: number | null
          connection_issues?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_analytics_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type_id: string
          title: string
          message: string
          data: Json | null
          is_read: boolean | null
          is_sent: boolean | null
          priority: string | null
          delivery_method: string[] | null
          scheduled_for: string | null
          sent_at: string | null
          read_at: string | null
          expires_at: string | null
          related_entity_type: string | null
          related_entity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type_id: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean | null
          is_sent?: boolean | null
          priority?: string | null
          delivery_method?: string[] | null
          scheduled_for?: string | null
          sent_at?: string | null
          read_at?: string | null
          expires_at?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type_id?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean | null
          is_sent?: boolean | null
          priority?: string | null
          delivery_method?: string[] | null
          scheduled_for?: string | null
          sent_at?: string | null
          read_at?: string | null
          expires_at?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          category: string
          subject: string
          message: string
          status: string | null
          priority: string | null
          response: string | null
          responded_by: string | null
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: string
          subject: string
          message: string
          status?: string | null
          priority?: string | null
          response?: string | null
          responded_by?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: string
          subject?: string
          message?: string
          status?: string | null
          priority?: string | null
          response?: string | null
          responded_by?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_moderators: {
        Row: {
          id: string
          stream_id: string
          user_id: string
          can_moderate_chat: boolean | null
          can_ban_users: boolean | null
          can_control_stream: boolean | null
          assigned_by: string
          assigned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id: string
          can_moderate_chat?: boolean | null
          can_ban_users?: boolean | null
          can_control_stream?: boolean | null
          assigned_by: string
          assigned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string
          can_moderate_chat?: boolean | null
          can_ban_users?: boolean | null
          can_control_stream?: boolean | null
          assigned_by?: string
          assigned_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_moderators_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_moderators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stream_notifications: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          notification_type: string
          title: string
          message: string
          priority: string | null
          channels: string[] | null
          is_sent: boolean | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          notification_type: string
          title: string
          message: string
          priority?: string | null
          channels?: string[] | null
          is_sent?: boolean | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          notification_type?: string
          title?: string
          message?: string
          priority?: string | null
          channels?: string[] | null
          is_sent?: boolean | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_notifications_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean | null
          sms_notifications: boolean | null
          push_notifications: boolean | null
          stream_notifications: boolean | null
          document_notifications: boolean | null
          announcement_notifications: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          push_notifications?: boolean | null
          stream_notifications?: boolean | null
          document_notifications?: boolean | null
          announcement_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          push_notifications?: boolean | null
          stream_notifications?: boolean | null
          document_notifications?: boolean | null
          announcement_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
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
      calculate_watch_duration: {
        Args: { viewer_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
