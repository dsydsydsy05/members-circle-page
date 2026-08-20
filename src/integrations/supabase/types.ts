export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_photos: {
        Row: {
          caption: string
          created_at: string
          id: string
          sort_order: number
          src: string
          updated_at: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          sort_order?: number
          src: string
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          sort_order?: number
          src?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          body: string | null
          city: string
          cover_url: string | null
          created_at: string
          date_label: string
          detail_image_url: string | null
          id: string
          slug: string | null
          sort_order: number
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          city?: string
          cover_url?: string | null
          created_at?: string
          date_label?: string
          detail_image_url?: string | null
          id?: string
          slug?: string | null
          sort_order?: number
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          city?: string
          cover_url?: string | null
          created_at?: string
          date_label?: string
          detail_image_url?: string | null
          id?: string
          slug?: string | null
          sort_order?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      factories: {
        Row: {
          category: string
          contact: string
          created_at: string
          id: string
          location: string
          moq: string
          name: string
          notes: string
          sample_time: string
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          category?: string
          contact?: string
          created_at?: string
          id?: string
          location?: string
          moq?: string
          name: string
          notes?: string
          sample_time?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string
          contact?: string
          created_at?: string
          id?: string
          location?: string
          moq?: string
          name?: string
          notes?: string
          sample_time?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      family_businesses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          owner_name: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_name?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_name?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          date_label: string
          event: string
          id: string
          name: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_label?: string
          event?: string
          id?: string
          name?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_label?: string
          event?: string
          id?: string
          name?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_code_redemptions: {
        Row: {
          id: string
          invitation_code_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invitation_code_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invitation_code_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_code_redemptions_invitation_code_id_fkey"
            columns: ["invitation_code_id"]
            isOneToOne: false
            referencedRelation: "invitation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          active: boolean
          code_hash: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          label: string
          max_redemptions: number | null
          redemption_count: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code_hash: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label: string
          max_redemptions?: number | null
          redemption_count?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code_hash?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label?: string
          max_redemptions?: number | null
          redemption_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      member_embedding_jobs: {
        Row: {
          attempts: number
          last_error: string | null
          profile_id: string
          queued_at: string
        }
        Insert: {
          attempts?: number
          last_error?: string | null
          profile_id: string
          queued_at?: string
        }
        Update: {
          attempts?: number
          last_error?: string | null
          profile_id?: string
          queued_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_embedding_jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_domains: {
        Row: {
          active: boolean
          category: string
          created_at: string
          domain: string
          id: string
          source: string
          source_url: string | null
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          domain: string
          id?: string
          source: string
          source_url?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          domain?: string
          id?: string
          source?: string
          source_url?: string | null
        }
        Relationships: []
      }
      moderation_events: {
        Row: {
          actor_id: string | null
          category: string
          content_hash: string
          created_at: string
          id: string
          source: string
        }
        Insert: {
          actor_id?: string | null
          category: string
          content_hash: string
          created_at?: string
          id?: string
          source: string
        }
        Update: {
          actor_id?: string | null
          category?: string
          content_hash?: string
          created_at?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      moderation_terms: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          effect: string
          id: string
          language: string
          match_mode: string
          severity: number
          source: string
          source_url: string | null
          term: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          created_by?: string | null
          effect?: string
          id?: string
          language: string
          match_mode?: string
          severity?: number
          source?: string
          source_url?: string | null
          term: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          effect?: string
          id?: string
          language?: string
          match_mode?: string
          severity?: number
          source?: string
          source_url?: string | null
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      nfc_tag_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: number
          member_id: string | null
          tag_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          member_id?: string | null
          tag_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          member_id?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_tag_events_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "nfc_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_tags: {
        Row: {
          batch_id: string
          claimable_until: string | null
          claimed_at: string | null
          created_at: string
          created_by: string | null
          disabled_at: string | null
          id: string
          serial_no: string
          status: string
          token_hash: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          batch_id: string
          claimable_until?: string | null
          claimed_at?: string | null
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          id?: string
          serial_no: string
          status?: string
          token_hash: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          batch_id?: string
          claimable_until?: string | null
          claimed_at?: string | null
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          id?: string
          serial_no?: string
          status?: string
          token_hash?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          blurb: string
          created_at: string
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          sort_order: number
          tier: string
          updated_at: string
          url: string | null
        }
        Insert: {
          blurb?: string
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          tier?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          blurb?: string
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          tier?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      profile_search_documents: {
        Row: {
          embedded_at: string | null
          embedding: string | null
          profile_id: string
          search_text: string
          updated_at: string
        }
        Insert: {
          embedded_at?: string | null
          embedding?: string | null
          profile_id: string
          search_text: string
          updated_at?: string
        }
        Update: {
          embedded_at?: string | null
          embedding?: string | null
          profile_id?: string
          search_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_search_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          home_featured: boolean
          home_featured_order: number
          id: string
          is_member: boolean
          member_no: number | null
          onboarded: boolean
          position: string | null
          school: string | null
          startup: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          home_featured?: boolean
          home_featured_order?: number
          id: string
          is_member?: boolean
          member_no?: number | null
          onboarded?: boolean
          position?: string | null
          school?: string | null
          startup?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          home_featured?: boolean
          home_featured_order?: number
          id?: string
          is_member?: boolean
          member_no?: number | null
          onboarded?: boolean
          position?: string | null
          school?: string | null
          startup?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      qa_answers: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          published_by: string
          question_id: string
          responder_avatar_url: string | null
          responder_name: string
          responder_title: string | null
          responder_type: string
          status: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          published_by: string
          question_id: string
          responder_avatar_url?: string | null
          responder_name: string
          responder_title?: string | null
          responder_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          published_by?: string
          question_id?: string
          responder_avatar_url?: string | null
          responder_name?: string
          responder_title?: string | null
          responder_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qa_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_questions: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          moderation_state: string
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          moderation_state?: string
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          moderation_state?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          admin_note: string | null
          admin_notification_error: string | null
          admin_notification_id: string | null
          admin_notification_status: string
          admin_notified_at: string | null
          created_at: string
          decision_notification_error: string | null
          decision_notification_id: string | null
          decision_notification_status: string
          decision_notified_at: string | null
          decision_notified_for: string | null
          email: string
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          admin_notification_error?: string | null
          admin_notification_id?: string | null
          admin_notification_status?: string
          admin_notified_at?: string | null
          created_at?: string
          decision_notification_error?: string | null
          decision_notification_id?: string | null
          decision_notification_status?: string
          decision_notified_at?: string | null
          decision_notified_for?: string | null
          email: string
          full_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          admin_notification_error?: string | null
          admin_notification_id?: string | null
          admin_notification_status?: string
          admin_notified_at?: string | null
          created_at?: string
          decision_notification_error?: string | null
          decision_notification_id?: string | null
          decision_notification_status?: string
          decision_notified_at?: string | null
          decision_notified_for?: string | null
          email?: string
          full_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_nfc_batch: {
        Args: { _batch_id: string; _count: number }
        Returns: {
          serial_no: string
          token: string
          url_path: string
        }[]
      }
      admin_disable_nfc_tag: { Args: { _tag_id: string }; Returns: boolean }
      admin_list_nfc_tags: {
        Args: never
        Returns: {
          batch_id: string
          claimable_until: string
          claimed_at: string
          created_at: string
          id: string
          member_name: string
          serial_no: string
          status: string
          user_id: string
        }[]
      }
      admin_list_qa_questions: {
        Args: never
        Returns: {
          author_email: string
          author_id: string
          body: string
          created_at: string
          id: string
          moderation_state: string
          status: string
        }[]
      }
      admin_replace_moderation_domains: {
        Args: {
          _category: string
          _domains: string[]
          _source: string
          _source_url: string
        }
        Returns: number
      }
      admin_review_waitlist: {
        Args: { _admin_note?: string; _entry_id: string; _status: string }
        Returns: {
          admin_note: string | null
          admin_notification_error: string | null
          admin_notification_id: string | null
          admin_notification_status: string
          admin_notified_at: string | null
          created_at: string
          decision_notification_error: string | null
          decision_notification_id: string | null
          decision_notification_status: string
          decision_notified_at: string | null
          decision_notified_for: string | null
          email: string
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "waitlist_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_home_featured: {
        Args: { _featured: boolean; _order?: number; _profile_id: string }
        Returns: undefined
      }
      admin_set_nfc_batch_claimable: {
        Args: { _batch_id: string; _claimable: boolean; _minutes?: number }
        Returns: number
      }
      claim_nfc_tag: {
        Args: { _token: string }
        Returns: {
          member_id: string
          profile_ready: boolean
          state: string
        }[]
      }
      get_public_directory_counts: {
        Args: never
        Returns: {
          family_businesses: number
          vetted_factories: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_member_profiles: {
        Args: {
          match_count?: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          profile_id: string
          score: number
        }[]
      }
      redeem_invitation_code: { Args: { _code: string }; Returns: boolean }
      resolve_nfc_tag: {
        Args: { _token: string }
        Returns: {
          member_id: string
          member_no: number
          profile_ready: boolean
          state: string
        }[]
      }
      submit_waitlist: {
        Args: { _full_name: string }
        Returns: {
          admin_note: string | null
          admin_notification_error: string | null
          admin_notification_id: string | null
          admin_notification_status: string
          admin_notified_at: string | null
          created_at: string
          decision_notification_error: string | null
          decision_notification_id: string | null
          decision_notification_status: string
          decision_notified_at: string | null
          decision_notified_for: string | null
          email: string
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "waitlist_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
