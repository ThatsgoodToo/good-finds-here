import { SupabaseClient } from '@supabase/supabase-js';

export interface UrlMetadata {
  title: string;
  description: string;
  image: string | null;
  price?: string | null;
  currency?: string;
}

export interface ImportErrorDetails {
  show: boolean;
  message: string;
  suggestedTitle: string | null;
  sourceUrl: string;
}

export const extractUrlMetadata = async (
  supabase: SupabaseClient,
  url: string
): Promise<UrlMetadata | null> => {
  try {
    console.log('Fetching metadata for URL:', url);
    const { data, error } = await supabase.functions.invoke('fetch-url-metadata', {
      body: { url }
    });

    if (error) {
      console.error('Error fetching URL metadata:', error);
      return null;
    }

    if (data.error) {
      console.warn('Metadata fetch returned error:', data.error);
      return null;
    }

    console.log('Metadata fetched successfully:', data);
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      price: data.price,
      currency: data.currency
    };
  } catch (e) {
    console.error('Exception fetching URL metadata:', e);
    return null;
  }
};

export const detectMediaTypeFromUrl = (url: string): 'video' | 'audio' | null => {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
    return 'video';
  }
  
  if (hostname.includes('spotify') || hostname.includes('soundcloud')) {
    return 'audio';
  }
  
  return null;
};

export const generateImportError = (url: string): ImportErrorDetails => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname;
    const urlParts = pathname.split('/').filter(p => p.length > 0);
    const lastPart = urlParts[urlParts.length - 1];
    const potentialTitle = lastPart
      ?.replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\.\w+$/, '');
    
    const isEcommerce = 
      hostname.includes('etsy') || 
      hostname.includes('amazon') || 
      hostname.includes('ebay') || 
      hostname.includes('shopify');
    
    return {
      show: true,
      message: isEcommerce 
        ? `${hostname} blocks automatic imports. Let's create your listing manually!`
        : `We couldn't read this page automatically. Let's create your listing manually!`,
      suggestedTitle: potentialTitle || null,
      sourceUrl: url
    };
  } catch {
    return {
      show: true,
      message: 'There was a problem reading this URL. Let\'s create your listing manually!',
      suggestedTitle: null,
      sourceUrl: url
    };
  }
};
