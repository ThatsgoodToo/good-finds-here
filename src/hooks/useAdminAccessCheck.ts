import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export const useAdminAccessCheck = (user: User | null) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [user, navigate]);
};
