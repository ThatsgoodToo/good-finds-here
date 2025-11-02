import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { 
  handleApproval, 
  handleRejection, 
  handlePendingReset,
  type VendorApplication 
} from "./handlers.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  application_id: string;
  new_status: "pending" | "approved" | "rejected";
  admin_notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { application_id, new_status, admin_notes }: StatusUpdateRequest = await req.json();

    console.log(`Processing status update: ${application_id} -> ${new_status}`);

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("vendor_applications")
      .select("*, profiles!inner(email, full_name, display_name)")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      console.error("Application not found:", appError);
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route to appropriate handler based on status
    if (new_status === "approved") {
      await handleApproval({
        supabase,
        resend,
        application: application as VendorApplication,
        applicationId: application_id,
        adminUserId: user.id,
        adminNotes: admin_notes,
      });
    } else if (new_status === "rejected") {
      await handleRejection({
        supabase,
        resend,
        application: application as VendorApplication,
        applicationId: application_id,
        adminUserId: user.id,
        adminNotes: admin_notes,
      });
    } else if (new_status === "pending") {
      await handlePendingReset(supabase, application_id, admin_notes);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Application ${new_status}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error updating vendor status:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
