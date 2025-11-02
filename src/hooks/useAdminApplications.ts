import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VendorApplication {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  business_type: string | null;
  business_type_other: string | null;
  business_description: string | null;
  website: string | null;
  phone_number: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  pickup_address: string | null;
  products_services: string[] | null;
  inventory_type: string[] | null;
  shipping_options: string[] | null;
  area_of_expertise: string[] | null;
  business_duration: string | null;
  craft_development: string | null;
  certifications_awards: string | null;
  creativity_style: string | null;
  inspiration: string | null;
  brand_uniqueness: string | null;
  sustainable_methods: string[] | null;
  pricing_style: string | null;
  exclusive_offers: string | null;
  promotion_social_channels: string | null;
  social_media_links: string[] | null;
  future_website: string | null;
  subscription_type: string | null;
  promo_code: string | null;
  additional_info: string | null;
  admin_notes: string | null;
  info_accurate: boolean | null;
  understands_review: boolean | null;
  agrees_to_terms: boolean | null;
  receive_updates: boolean | null;
  payment_method_saved: boolean | null;
  profiles?: {
    email: string;
    full_name: string | null;
    display_name: string | null;
  } | null;
}

export const useAdminApplications = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select(`
          *,
          profiles (
            email,
            full_name,
            display_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as unknown as VendorApplication[]) || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: "approve" | "reject" | "pending",
    adminNotes?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("update-vendor-status", {
        body: {
          application_id: applicationId,
          new_status: newStatus,
          admin_notes: adminNotes || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Application ${newStatus === "approve" ? "approved" : newStatus === "reject" ? "rejected" : "set to pending"}`);
      
      await loadApplications();
      
      return { success: true };
    } catch (error: unknown) {
      console.error("Error updating application:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update application";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return { applications, loading, loadApplications, updateApplicationStatus };
};
