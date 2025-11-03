import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    onError: (error: any) => {
      if (error.code === '23505') {
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
      const updates: any = {};
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
