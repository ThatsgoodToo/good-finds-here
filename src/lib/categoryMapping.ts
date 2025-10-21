import { CategoryType } from "@/components/ProductCard";

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
  
  // Experiences
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
