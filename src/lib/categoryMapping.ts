import { CategoryType } from "@/components/ProductCard";

// Mapping from UI category names to backend generic categories
const categoryToGenericMapping: Record<string, 'necessary_goods' | 'personal_goods' | 'experiences'> = {
  "Culinary & Food": "necessary_goods",
  "Wellness & Beauty": "necessary_goods",
  "Home & Decor": "necessary_goods",
  "Textiles & Apparel": "personal_goods",
  "Ceramics & Pottery": "personal_goods",
  "Music & Audio": "personal_goods",
  "Art & Visual": "personal_goods",
  "Crafts & Handmade": "personal_goods",
  "Other": "personal_goods",
  "Experiences & Workshops": "experiences",
};

/**
 * Maps UI category names to backend generic category values
 * @param category - Category name from the UI
 * @returns Generic category value for the database
 */
export function mapCategoryToGeneric(category: string | null | undefined): 'necessary_goods' | 'personal_goods' | 'experiences' | null {
  if (!category) return null;
  return categoryToGenericMapping[category] || 'personal_goods'; // Default to personal_goods if unknown
}

// Mapping from database category names to frontend category types
const categoryToTypeMap: Record<string, CategoryType> = {
  // Products
  "Food & Beverage": "product",
  "Fashion & Accessories": "product",
  "Home & Lifestyle": "product",
  "Wellness & Body Care": "product",
  "Art & Crafts": "product",
  "Beauty & Personal Care": "product",
  "Clothing": "product",
  
  // Services
  "Professional Services": "service",
  "Creative Services": "service",
  "Consulting": "service",
  "Repair & Maintenance": "service",
  
  // Experiences (changed from viewerbase)
  "Education & Experiences": "experience",
  "Workshops & Classes": "experience",
  "Events": "experience",
  "Tours & Activities": "experience",
  
  // Sales
  "Sale": "sale",
  "Clearance": "sale",
  "Special Offer": "sale",
};

/**
 * Maps database category names to frontend CategoryType values
 * @param categories - Array of category names from the database
 * @returns Array of CategoryType values for displaying colored dots
 */
export function mapCategoriesToTypes(categories: string[] | null | undefined): CategoryType[] {
  if (!categories || categories.length === 0) {
    return ["product"]; // Default to product if no categories
  }

  const mappedTypes = categories
    .map(cat => categoryToTypeMap[cat])
    .filter((type): type is CategoryType => type !== undefined);

  // Return unique types only
  return [...new Set(mappedTypes)];
}
