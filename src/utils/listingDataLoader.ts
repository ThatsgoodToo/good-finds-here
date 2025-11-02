import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type ListingRow = Database['public']['Tables']['listings']['Row'];

export interface LoadedListingData {
  mediaType: 'product' | 'video' | 'audio';
  listingTypes: string[];
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  category: string;
  subcategories: string[];
  sourceUrl: string;
  mediaItems: Array<{ type: 'image'; url: string }>;
}

export const loadListingById = async (
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<LoadedListingData | null> => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (error || !data) {
    throw error || new Error("Listing not found");
  }

  return transformListingData(data);
};

const transformListingData = (data: ListingRow): LoadedListingData => {
  // Determine media type
  let mediaType: 'product' | 'video' | 'audio' = 'product';
  if (data.listing_type === 'video' || data.listing_type === 'audio' || data.listing_type === 'product') {
    mediaType = data.listing_type;
  }

  // Determine listing types
  const types = data.listing_types && data.listing_types.length > 0
    ? data.listing_types
    : (data.listing_type ? [data.listing_type] : []);

  // Parse media items
  const mediaItems: Array<{ type: 'image'; url: string }> = [];
  if (data.image_url) {
    mediaItems.push({
      type: 'image',
      url: data.image_url
    });
  }

  return {
    mediaType,
    listingTypes: types,
    title: data.title,
    description: data.description || "",
    price: data.price?.toString() || "",
    isFree: !data.price || data.price === 0,
    category: data.category || "",
    subcategories: data.categories || [],
    sourceUrl: data.source_url || "",
    mediaItems
  };
};
