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
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          gender_identity: string | null
          id: string
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
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gender_identity?: string | null
          id: string
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
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gender_identity?: string | null
          id?: string
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
      payment_status:
        | "requires_payment_method"
        | "requires_confirmation"
        | "requires_action"
        | "processing"
        | "succeeded"
        | "canceled"
        | "failed"
      payment_type: "booking" | "donation" | "queue"
      queue_status:
        | "waiting"
        | "assigned"
        | "connected"
        | "left"
        | "completed"
      user_role: "customer" | "listener" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      user_role: ["customer", "listener", "admin", "super_admin"],
    },
  },
} as const
