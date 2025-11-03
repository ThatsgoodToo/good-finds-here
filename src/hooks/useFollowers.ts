import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFollowers(vendorId?: string) {
  const queryClient = useQueryClient();

  // Check if current user is following this vendor
  const { data: isFollowing = false, isLoading: isCheckingFollow } = useQuery({
    queryKey: ["following", vendorId],
    queryFn: async () => {
      if (!vendorId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("vendor_id", vendorId)
        .eq("shopper_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!vendorId,
  });

  // Get follower count for a vendor
  const { data: followerCount = 0 } = useQuery({
    queryKey: ["follower-count", vendorId],
    queryFn: async () => {
      if (!vendorId) return 0;

      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!vendorId,
  });

  // Follow a vendor
  const followMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to follow vendors");

      const { error } = await supabase
        .from("followers")
        .insert({
          vendor_id: vendorId,
          shopper_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ["following", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["followed-vendors"] });
    },
  });

  // Unfollow a vendor
  const unfollowMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("vendor_id", vendorId)
        .eq("shopper_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ["following", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["followed-vendors"] });
    },
  });

  // Toggle follow/unfollow
  const toggleFollow = (vendorId: string) => {
    if (isFollowing) {
      return unfollowMutation.mutate(vendorId);
    } else {
      return followMutation.mutate(vendorId);
    }
  };

  return {
    isFollowing,
    isCheckingFollow,
    followerCount,
    toggleFollow,
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  };
}

// Hook to get all followed vendors for current user
export function useFollowedVendors() {
  return useQuery({
    queryKey: ["followed-vendors"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("followers")
        .select(`
          vendor_id,
          created_at,
          vendor_profiles!followers_vendor_id_fkey (
            user_id,
            business_name,
            business_type,
            city,
            state_region,
            location_public
          ),
          profiles!followers_vendor_id_fkey (
            display_name,
            profile_picture_url,
            avatar_url
          )
        `)
        .eq("shopper_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
