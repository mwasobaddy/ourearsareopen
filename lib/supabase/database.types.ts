export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability_slots: {
        Row: {
          booking_id: string | null
          created_at: string
          ends_at: string
          id: string
          is_booked: boolean
          listener_id: string
          starts_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          ends_at: string
          id?: string
          is_booked?: boolean
          listener_id: string
          starts_at: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          is_booked?: boolean
          listener_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          concern: string | null
          created_at: string
          id: string
          listener_id: string | null
          payment_intent_id: string | null
          payment_option: string
          preferences: Json
          slot_end: string | null
          slot_start: string | null
          status: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["book_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          concern?: string | null
          created_at?: string
          id?: string
          listener_id?: string | null
          payment_intent_id?: string | null
          payment_option?: string
          preferences?: Json
          slot_end?: string | null
          slot_start?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["book_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          concern?: string | null
          created_at?: string
          id?: string
          listener_id?: string | null
          payment_intent_id?: string | null
          payment_option?: string
          preferences?: Json
          slot_end?: string | null
          slot_start?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          type?: Database["public"]["Enums"]["book_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          listener_id: string | null
          session_id: string
          storage_path: string | null
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listener_id?: string | null
          session_id: string
          storage_path?: string | null
          summary?: string | null
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listener_id?: string | null
          session_id?: string
          storage_path?: string | null
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          session_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          session_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          bookings_id: string | null
          created_at: string
          currency: string
          id: string
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          type: Database["public"]["Enums"]["payment_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          bookings_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          type: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          bookings_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bookings_id_fkey"
            columns: ["bookings_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_range: string | null
          assigned_listener_id: string | null
          availability: Json
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          gender_identity: string | null
          id: string
          is_active: boolean
          open_queue_enabled: boolean
          phone: string | null
          prior_therapy: string | null
          profile_complete: boolean | null
          pronouns: string | null
          reason: string | null
          relationship_status: string | null
          religion_importance: string | null
          role: Database["public"]["Enums"]["user_role"]
          services_consent: boolean | null
          sexual_orientation: string | null
          spiritual: string | null
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          assigned_listener_id?: string | null
          availability?: Json
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gender_identity?: string | null
          id: string
          is_active?: boolean
          open_queue_enabled?: boolean
          phone?: string | null
          prior_therapy?: string | null
          profile_complete?: boolean | null
          pronouns?: string | null
          reason?: string | null
          relationship_status?: string | null
          religion_importance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          services_consent?: boolean | null
          sexual_orientation?: string | null
          spiritual?: string | null
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          assigned_listener_id?: string | null
          availability?: Json
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gender_identity?: string | null
          id?: string
          is_active?: boolean
          open_queue_enabled?: boolean
          phone?: string | null
          prior_therapy?: string | null
          profile_complete?: boolean | null
          pronouns?: string | null
          reason?: string | null
          relationship_status?: string | null
          religion_importance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          services_consent?: boolean | null
          sexual_orientation?: string | null
          spiritual?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_listener_id_fkey"
            columns: ["assigned_listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          assigned_at: string | null
          assigned_listener_id: string | null
          created_at: string
          id: string
          payment_id: string | null
          position: number | null
          status: Database["public"]["Enums"]["queue_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_listener_id?: string | null
          created_at?: string
          id?: string
          payment_id?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_listener_id?: string | null
          created_at?: string
          id?: string
          payment_id?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_assigned_listener_id_fkey"
            columns: ["assigned_listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          booking_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          listener_id: string
          mode: Database["public"]["Enums"]["session_mode"]
          notes: string | null
          queue_entry_id: string | null
          room_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          listener_id: string
          mode?: Database["public"]["Enums"]["session_mode"]
          notes?: string | null
          queue_entry_id?: string | null
          room_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          listener_id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          notes?: string | null
          queue_entry_id?: string | null
          room_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_queue_entry_id_fkey"
            columns: ["queue_entry_id"]
            isOneToOne: false
            referencedRelation: "queue_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          internal_notes: string | null
          kind: Database["public"]["Enums"]["support_kind"]
          payment_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["support_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          kind?: Database["public"]["Enums"]["support_kind"]
          payment_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          kind?: Database["public"]["Enums"]["support_kind"]
          payment_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_waiting_positions: { Args: never; Returns: undefined }
      delete_my_account: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_listener: { Args: never; Returns: boolean }
    }
    Enums: {
      book_type: "phone" | "chat"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      document_type: "session_notes" | "consent" | "other"
      payment_status:
        | "requires_payment_method"
        | "requires_confirmation"
        | "requires_action"
        | "processing"
        | "succeeded"
        | "canceled"
        | "failed"
      payment_type: "booking" | "donation" | "queue"
      queue_status: "waiting" | "assigned" | "connected" | "left" | "completed"
      session_mode: "chat" | "phone"
      session_status: "pending" | "active" | "left" | "ended" | "completed"
      support_kind: "refund" | "support"
      support_status: "open" | "resolved"
      user_role: "customer" | "listener" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const Constants = {
  public: {
    Enums: {
      book_type: ["phone", "chat"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      document_type: ["session_notes", "consent", "other"],
      payment_status: [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
        "succeeded",
        "canceled",
        "failed",
      ],
      payment_type: ["booking", "donation", "queue"],
      queue_status: ["waiting", "assigned", "connected", "left", "completed"],
      session_mode: ["chat", "phone"],
      session_status: ["pending", "active", "left", "ended", "completed"],
      support_kind: ["refund", "support"],
      support_status: ["open", "resolved"],
      user_role: ["customer", "listener", "admin", "super_admin"],
    },
  },
} as const
