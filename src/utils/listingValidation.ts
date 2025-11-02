export interface ListingFormData {
  listingTypes: string[];
  title: string;
  description: string;
  category: string;
  sourceUrl: string;
  mediaType: string;
  isFree: boolean;
  price: string;
  user: any;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface MediaValidationResult {
  isValid: boolean;
  needsConfirmation: boolean;
  message?: string;
}

export interface PriceValidationResult extends ValidationResult {
  priceNum?: number;
}

export const validateListingForm = (data: ListingFormData): ValidationResult => {
  if (data.listingTypes.length === 0) {
    return { isValid: false, error: "Please select at least one listing type" };
  }
  
  if (!data.title.trim()) {
    return { isValid: false, error: "Please enter a title" };
  }
  
  if (!data.description.trim()) {
    return { isValid: false, error: "Please enter a description" };
  }
  
  if (!data.category || !data.category.trim()) {
    return { isValid: false, error: "Please select a category" };
  }
  
  if (!data.sourceUrl.trim()) {
    return { isValid: false, error: "Source URL is required" };
  }
  
  try {
    new URL(data.sourceUrl);
  } catch {
    return { isValid: false, error: "Source URL must be a valid URL" };
  }
  
  if (!data.user) {
    return { isValid: false, error: "You must be logged in to save a listing" };
  }
  
  return { isValid: true };
};

export const validateMediaTypeUrl = (
  mediaType: string,
  sourceUrl: string
): MediaValidationResult => {
  if (mediaType !== 'video' && mediaType !== 'audio') {
    return { isValid: true, needsConfirmation: false };
  }

  const url = sourceUrl.toLowerCase();
  const isMediaPlatform = 
    url.includes('youtube') || 
    url.includes('youtu.be') || 
    url.includes('spotify') || 
    url.includes('soundcloud');

  if (!isMediaPlatform) {
    return {
      isValid: true,
      needsConfirmation: true,
      message: `You selected ${mediaType} but the URL doesn't appear to be from a media platform. Continue anyway?`
    };
  }

  return { isValid: true, needsConfirmation: false };
};

export const validatePrice = (isFree: boolean, price: string): PriceValidationResult => {
  if (isFree || !price) {
    return { isValid: true };
  }

  const priceNum = parseFloat(price);
  
  if (isNaN(priceNum) || priceNum < 0) {
    return { isValid: false, error: "Price must be a valid positive number" };
  }

  return { isValid: true, priceNum };
};
