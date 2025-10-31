import { supabase } from "@/integrations/supabase/client";

export type StorageBucket = "ui-assets" | "profile-pictures" | "product-images" | "user-uploads";

interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  path: string;
  onProgress?: (progress: number) => void;
}

export const uploadFile = async ({ bucket, file, path }: UploadOptions) => {
  try {
    // Validate file size based on bucket
    const maxSizes: Record<StorageBucket, number> = {
      "ui-assets": 10 * 1024 * 1024, // 10MB
      "profile-pictures": 5 * 1024 * 1024, // 5MB
      "product-images": 10 * 1024 * 1024, // 10MB
      "user-uploads": 20 * 1024 * 1024, // 20MB
    };

    if (file.size > maxSizes[bucket]) {
      throw new Error(`File size exceeds ${maxSizes[bucket] / 1024 / 1024}MB limit`);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error(`Upload error:`, error);
    throw error;
  }
};

export const deleteFile = async (bucket: StorageBucket, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};

export const getPublicUrl = (bucket: StorageBucket, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper to generate user-specific path
export const getUserPath = (userId: string, filename: string) => {
  return `${userId}/${Date.now()}-${filename}`;
};

// Helper to generate listing-specific path
export const getListingPath = (vendorId: string, listingId: string, filename: string) => {
  return `${vendorId}/${listingId}/${Date.now()}-${filename}`;
};
