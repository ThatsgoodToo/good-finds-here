import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

export interface UserSave {
  id: string;
  user_id: string;
  save_type: 'listing' | 'vendor';
  target_id: string;
  folder_id: string | null;
  saved_at: string;
  email_on_save: boolean;
}

export function useSaves(saveType?: 'listing' | 'vendor', folderId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: saves, isLoading } = useQuery({
    queryKey: ['user_saves', user?.id, saveType, folderId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('user_saves')
        .select('*')
        .eq('user_id', user.id);
      
      if (saveType) {
        query = query.eq('save_type', saveType);
      }
      
      if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query.order('saved_at', { ascending: false });
      
      if (error) throw error;
      return data as UserSave[];
    },
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async ({ 
      saveType, 
      targetId, 
      folderId,
      emailOnSave = false 
    }: { 
      saveType: 'listing' | 'vendor'; 
      targetId: string; 
      folderId?: string;
      emailOnSave?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('user_saves')
        .insert({
          user_id: user.id,
          save_type: saveType,
          target_id: targetId,
          folder_id: folderId || null,
          email_on_save: emailOnSave
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_saves', user?.id] });
    },
    onError: (error: PostgrestError | Error) => {
      if ('code' in error && error.code === '23505') {
        toast.error("Item already saved");
      } else {
        toast.error("Failed to save item");
      }
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: async ({ saveType, targetId }: { saveType: 'listing' | 'vendor'; targetId: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('save_type', saveType)
        .eq('target_id', targetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_saves', user?.id] });
    },
    onError: () => {
      toast.error("Failed to remove save");
    }
  });

  const updateSaveMutation = useMutation({
    mutationFn: async ({ 
      id, 
      folderId,
      emailOnSave 
    }: { 
      id: string; 
      folderId?: string | null;
      emailOnSave?: boolean;
    }) => {
      const updates: Partial<Pick<UserSave, 'folder_id' | 'email_on_save'>> = {};
      if (folderId !== undefined) updates.folder_id = folderId;
      if (emailOnSave !== undefined) updates.email_on_save = emailOnSave;
      
      const { data, error } = await supabase
        .from('user_saves')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_saves', user?.id] });
      toast.success("Save updated successfully");
    },
    onError: () => {
      toast.error("Failed to update save");
    }
  });

  const checkIsSaved = async (saveType: 'listing' | 'vendor', targetId: string) => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('user_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('save_type', saveType)
      .eq('target_id', targetId)
      .maybeSingle();
    
    return !!data;
  };

  return {
    saves: saves || [],
    isLoading,
    saveItem: saveMutation.mutate,
    unsaveItem: unsaveMutation.mutate,
    updateSave: updateSaveMutation.mutate,
    checkIsSaved,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
    isUpdating: updateSaveMutation.isPending
  };
}

export interface SavedItemWithDetails {
  id: string;
  save_type: 'listing' | 'vendor';
  target_id: string;
  saved_at: string;
  folder_id: string | null;
  folder_name: string | null;
  folder_description: string | null;
  listing?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
    vendor_id: string;
    listing_type: string;
    category: string;
  };
  vendor?: {
    user_id: string;
    business_name: string;
    profile_picture_url: string;
    city: string;
    state_region: string;
    business_description: string;
  };
}

export function useSavedItemsWithDetails() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedItems, isLoading } = useQuery({
    queryKey: ['saved_items_with_details', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all saves with folder info
      const { data: saves, error: savesError } = await supabase
        .from('user_saves')
        .select(`
          id,
          save_type,
          target_id,
          saved_at,
          folder_id
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      
      if (savesError) throw savesError;
      if (!saves || saves.length === 0) return [];

      // Fetch folder details
      const folderIds = saves.map(s => s.folder_id).filter(Boolean);
      const { data: folders } = await supabase
        .from('folders')
        .select('id, name, description')
        .in('id', folderIds);
      
      // Fetch listing details for listing saves
      const listingIds = saves
        .filter(s => s.save_type === 'listing')
        .map(s => s.target_id);
      
      let listings: any[] = [];
      if (listingIds.length > 0) {
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id, title, image_url, price, vendor_id, listing_type, category')
          .in('id', listingIds);
        listings = listingsData || [];
      }
      
      // Fetch vendor details for vendor saves
      const vendorIds = saves
        .filter(s => s.save_type === 'vendor')
        .map(s => s.target_id);
      
      let vendors: any[] = [];
      let vendorProfiles: any[] = [];
      if (vendorIds.length > 0) {
        const { data: vendorsData } = await supabase
          .from('vendor_profiles')
          .select('user_id, business_name, city, state_region, business_description')
          .in('user_id', vendorIds);
        vendors = vendorsData || [];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, profile_picture_url')
          .in('id', vendorIds);
        vendorProfiles = profilesData || [];
      }
      
      // Combine data
      return saves.map(save => {
        const folder = folders?.find(f => f.id === save.folder_id);
        return {
          ...save,
          folder_name: folder?.name || null,
          folder_description: folder?.description || null,
          listing: save.save_type === 'listing' 
            ? listings.find(l => l.id === save.target_id)
            : undefined,
          vendor: save.save_type === 'vendor'
            ? {
                ...vendors.find(v => v.user_id === save.target_id),
                ...vendorProfiles.find(p => p.id === save.target_id)
              }
            : undefined
        } as SavedItemWithDetails;
      });
    },
    enabled: !!user
  });

  const deleteSaveMutation = useMutation({
    mutationFn: async (saveId: string) => {
      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('id', saveId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved_items_with_details', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user_saves', user?.id] });
      toast.success("Item removed from saved");
    },
    onError: () => {
      toast.error("Failed to remove item");
    }
  });

  return {
    savedItems: savedItems || [],
    isLoading,
    deleteSave: deleteSaveMutation.mutate,
    isDeleting: deleteSaveMutation.isPending
  };
}
