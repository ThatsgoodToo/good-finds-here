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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      coupon_shares: {
        Row: {
          coupon_id: string
          id: string
          shared_at: string
          shopper_id: string
          vendor_id: string
          viewed: boolean | null
          viewed_at: string | null
        }
        Insert: {
          coupon_id: string
          id?: string
          shared_at?: string
          shopper_id: string
          vendor_id: string
          viewed?: boolean | null
          viewed_at?: string | null
        }
        Update: {
          coupon_id?: string
          id?: string
          shared_at?: string
          shopper_id?: string
          vendor_id?: string
          viewed?: boolean | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_shares_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_shares_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "vendor_coupon_analytics"
            referencedColumns: ["coupon_id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          listing_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          listing_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          listing_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "vendor_coupon_analytics"
            referencedColumns: ["coupon_id"]
          },
          {
            foreignKeyName: "coupon_usage_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active_status: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_recurring: boolean | null
          listing_id: string | null
          max_uses: number | null
          recurrence_pattern: string | null
          start_date: string
          updated_at: string
          used_count: number
          vendor_id: string
        }
        Insert: {
          active_status?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_recurring?: boolean | null
          listing_id?: string | null
          max_uses?: number | null
          recurrence_pattern?: string | null
          start_date: string
          updated_at?: string
          used_count?: number
          vendor_id: string
        }
        Update: {
          active_status?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_recurring?: boolean | null
          listing_id?: string | null
          max_uses?: number | null
          recurrence_pattern?: string | null
          start_date?: string
          updated_at?: string
          used_count?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          folder_name: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_name?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_name?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          id: string
          shopper_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shopper_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shopper_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          categories: string[] | null
          category: string
          created_at: string
          description: string
          generic_category: string | null
          generic_subcategory: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          listing_type: string
          location: string | null
          price: number | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          vendor_id: string
          website_url: string | null
        }
        Insert: {
          categories?: string[] | null
          category: string
          created_at?: string
          description: string
          generic_category?: string | null
          generic_subcategory?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          listing_type?: string
          location?: string | null
          price?: number | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          vendor_id: string
          website_url?: string | null
        }
        Update: {
          categories?: string[] | null
          category?: string
          created_at?: string
          description?: string
          generic_category?: string | null
          generic_subcategory?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          listing_type?: string
          location?: string | null
          price?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          vendor_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_verified: boolean | null
          analytics_consent: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          high_fives_public: boolean | null
          id: string
          interests: string[] | null
          location_public: boolean | null
          onboarding_completed: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          subscription_status: string | null
          terms_accepted: boolean | null
          updated_at: string
        }
        Insert: {
          age_verified?: boolean | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          high_fives_public?: boolean | null
          id: string
          interests?: string[] | null
          location_public?: boolean | null
          onboarding_completed?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_status?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
        }
        Update: {
          age_verified?: boolean | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          high_fives_public?: boolean | null
          id?: string
          interests?: string[] | null
          location_public?: boolean | null
          onboarding_completed?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_status?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          id: string
          promo_code: string
          redeemed_at: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          promo_code: string
          redeemed_at?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          promo_code?: string
          redeemed_at?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          notified_expiring: boolean | null
          promo_code: string | null
          start_date: string
          status: string
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          notified_expiring?: boolean | null
          promo_code?: string | null
          start_date?: string
          status?: string
          subscription_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          notified_expiring?: boolean | null
          promo_code?: string | null
          start_date?: string
          status?: string
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          notification_frequency: string | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          notification_frequency?: string | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          notification_frequency?: string | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_applications: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          agrees_to_terms: boolean | null
          area_of_expertise: string[] | null
          brand_uniqueness: string | null
          business_description: string | null
          business_duration: string | null
          business_type: string | null
          business_type_other: string | null
          certifications_awards: string | null
          city: string | null
          country: string | null
          craft_development: string | null
          created_at: string
          creativity_style: string | null
          exclusive_offers: string | null
          future_website: string | null
          id: string
          info_accurate: boolean | null
          inspiration: string | null
          inventory_type: string[] | null
          payment_method_saved: boolean | null
          phone_number: string | null
          pickup_address: string | null
          pricing_style: string | null
          products_services: string[] | null
          promo_code: string | null
          promotion_social_channels: string | null
          receive_updates: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          shipping_options: string[] | null
          social_media_links: string[] | null
          state_region: string | null
          status: string
          subscription_type: string | null
          sustainable_methods: string[] | null
          understands_review: boolean | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          agrees_to_terms?: boolean | null
          area_of_expertise?: string[] | null
          brand_uniqueness?: string | null
          business_description?: string | null
          business_duration?: string | null
          business_type?: string | null
          business_type_other?: string | null
          certifications_awards?: string | null
          city?: string | null
          country?: string | null
          craft_development?: string | null
          created_at?: string
          creativity_style?: string | null
          exclusive_offers?: string | null
          future_website?: string | null
          id?: string
          info_accurate?: boolean | null
          inspiration?: string | null
          inventory_type?: string[] | null
          payment_method_saved?: boolean | null
          phone_number?: string | null
          pickup_address?: string | null
          pricing_style?: string | null
          products_services?: string[] | null
          promo_code?: string | null
          promotion_social_channels?: string | null
          receive_updates?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipping_options?: string[] | null
          social_media_links?: string[] | null
          state_region?: string | null
          status?: string
          subscription_type?: string | null
          sustainable_methods?: string[] | null
          understands_review?: boolean | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          agrees_to_terms?: boolean | null
          area_of_expertise?: string[] | null
          brand_uniqueness?: string | null
          business_description?: string | null
          business_duration?: string | null
          business_type?: string | null
          business_type_other?: string | null
          certifications_awards?: string | null
          city?: string | null
          country?: string | null
          craft_development?: string | null
          created_at?: string
          creativity_style?: string | null
          exclusive_offers?: string | null
          future_website?: string | null
          id?: string
          info_accurate?: boolean | null
          inspiration?: string | null
          inventory_type?: string[] | null
          payment_method_saved?: boolean | null
          phone_number?: string | null
          pickup_address?: string | null
          pricing_style?: string | null
          products_services?: string[] | null
          promo_code?: string | null
          promotion_social_channels?: string | null
          receive_updates?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipping_options?: string[] | null
          social_media_links?: string[] | null
          state_region?: string | null
          status?: string
          subscription_type?: string | null
          sustainable_methods?: string[] | null
          understands_review?: boolean | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      vendor_change_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          current_value: string | null
          field_name: string
          id: string
          reason: string | null
          requested_value: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
          vendor_profile_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          current_value?: string | null
          field_name: string
          id?: string
          reason?: string | null
          requested_value: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
          vendor_profile_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          current_value?: string | null
          field_name?: string
          id?: string
          reason?: string | null
          requested_value?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
          vendor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_change_requests_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          application_id: string | null
          area_of_expertise: string[]
          brand_uniqueness: string | null
          business_description: string
          business_duration: string
          business_type: string
          business_type_other: string | null
          certifications_awards: string | null
          city: string
          clicks_to_website: number | null
          contact_info_public: boolean | null
          country: string
          craft_development: string | null
          created_at: string
          creativity_style: string | null
          exclusive_offers: string | null
          future_website: string | null
          id: string
          inspiration: string | null
          inventory_type: string[] | null
          pending_changes: Json | null
          phone_number: string | null
          pickup_address: string | null
          pricing_style: string | null
          products_services: string[] | null
          profile_views: number | null
          promotion_social_channels: string | null
          shipping_options: string[] | null
          social_media_links: string[] | null
          state_region: string
          status: string
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_type: string | null
          sustainable_methods: string[] | null
          updated_at: string
          user_id: string
          website: string
        }
        Insert: {
          application_id?: string | null
          area_of_expertise: string[]
          brand_uniqueness?: string | null
          business_description: string
          business_duration: string
          business_type: string
          business_type_other?: string | null
          certifications_awards?: string | null
          city: string
          clicks_to_website?: number | null
          contact_info_public?: boolean | null
          country: string
          craft_development?: string | null
          created_at?: string
          creativity_style?: string | null
          exclusive_offers?: string | null
          future_website?: string | null
          id?: string
          inspiration?: string | null
          inventory_type?: string[] | null
          pending_changes?: Json | null
          phone_number?: string | null
          pickup_address?: string | null
          pricing_style?: string | null
          products_services?: string[] | null
          profile_views?: number | null
          promotion_social_channels?: string | null
          shipping_options?: string[] | null
          social_media_links?: string[] | null
          state_region: string
          status?: string
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          sustainable_methods?: string[] | null
          updated_at?: string
          user_id: string
          website: string
        }
        Update: {
          application_id?: string | null
          area_of_expertise?: string[]
          brand_uniqueness?: string | null
          business_description?: string
          business_duration?: string
          business_type?: string
          business_type_other?: string | null
          certifications_awards?: string | null
          city?: string
          clicks_to_website?: number | null
          contact_info_public?: boolean | null
          country?: string
          craft_development?: string | null
          created_at?: string
          creativity_style?: string | null
          exclusive_offers?: string | null
          future_website?: string | null
          id?: string
          inspiration?: string | null
          inventory_type?: string[] | null
          pending_changes?: Json | null
          phone_number?: string | null
          pickup_address?: string | null
          pricing_style?: string | null
          products_services?: string[] | null
          profile_views?: number | null
          promotion_social_channels?: string | null
          shipping_options?: string[] | null
          social_media_links?: string[] | null
          state_region?: string
          status?: string
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          sustainable_methods?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vendor_coupon_analytics: {
        Row: {
          active_status: boolean | null
          code: string | null
          coupon_id: string | null
          created_at: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          max_uses: number | null
          start_date: string | null
          total_claims: number | null
          unique_users: number | null
          usage_percentage: number | null
          used_count: number | null
          vendor_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_coupon: {
        Args: {
          _coupon_code: string
          _device_fingerprint?: string
          _ip_address?: string
          _listing_id?: string
          _user_id?: string
          _vendor_id: string
        }
        Returns: Json
      }
      expire_coupons: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_own_vendor_profile: {
        Args: { _vendor_profile_id: string }
        Returns: boolean
      }
      renew_recurring_coupons: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "vendor" | "shopper" | "admin" | "moderator"
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
      app_role: ["vendor", "shopper", "admin", "moderator"],
    },
  },
} as const
