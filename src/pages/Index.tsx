import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import MasonryGallery from "@/components/MasonryGallery";
import ListView from "@/components/ListView";
import { CategoryType } from "@/components/ProductCard";
import { toast } from "sonner";
import { mapCategoriesToTypes } from "@/lib/categoryMapping";

type FilterType = "all" | CategoryType;

const Index = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [dbListings, setDbListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          vendor_profiles!inner(business_name, display_name:profiles(display_name))
        `)
        .eq("status", "active");
      
      if (data) {
        setDbListings(data);
      }
    };
    
    fetchListings();
  }, []);

  const handleSearch = (query: string) => {
    setHasSearched(true);
  };

  const handleBack = () => {
    setHasSearched(false);
  };

  const handleWhatsgoodClick = () => {
    if (user) {
      toast.info(`Showing curated listings for ${userRole}s`);
    } else {
      toast.info("Showing highly rated, new, and lowest rated listings");
    }
    setHasSearched(true);
  };

  const handleHighFiveClick = () => {
    if (!user) {
      toast.info("Showing highly rated vendors and listings");
      setHasSearched(true);
    } else if (userRole === "shopper") {
      toast.info("Showing your favorite vendors and listings");
      setHasSearched(true);
    } else if (userRole === "vendor") {
      toast.info("Showing your followers");
      setHasSearched(true);
    }
  };

  const handleYourGoodsClick = () => {
    if (userRole === "shopper") {
      navigate("/dashboard/shopper");
    } else if (userRole === "vendor") {
      navigate("/dashboard/vendor");
    }
  };

  // Map database listings to product format
  const dbProducts = dbListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ? `$${Number(listing.price).toFixed(2)}` : "Free",
    image: listing.image_url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
    categories: (listing.listing_types && listing.listing_types.length > 0 
      ? listing.listing_types 
      : [listing.listing_type]) as CategoryType[],
    vendor: listing.vendor_profiles?.business_name || listing.vendor_profiles?.display_name?.display_name || "Local Vendor",
    vendorId: listing.vendor_id,
  }));

  // Use only database listings
  const allProducts = [...dbProducts];

  const filteredProducts =
    activeFilter === "all"
      ? allProducts
      : allProducts.filter((p) => p.categories.includes(activeFilter as CategoryType));

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showGoodToday={!hasSearched}
        onWhatsgoodClick={handleWhatsgoodClick}
        onHighFiveClick={handleHighFiveClick}
        onYourGoodsClick={handleYourGoodsClick}
      />
      
      <OnboardingTutorial />
      
      <main className="pt-16 sm:pt-20">
        {/* Hero search (centered) or bottom search bar */}
        <SearchBar
          onSearch={handleSearch}
          isCentered={!hasSearched}
          onWhatsgoodClick={handleWhatsgoodClick}
        />

        {/* Content appears after search */}
        {hasSearched && (
          <>
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onBack={handleBack}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {viewMode === "gallery" ? (
              <MasonryGallery products={filteredProducts} />
            ) : (
              <ListView products={filteredProducts} />
            )}
          </>
        )}

        {/* What's Good Today Section - Shows on scroll when not searched */}
        {!hasSearched && (
          <div className="container mx-auto px-4 py-16 mt-[40vh]">
            <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in">
              What's Good Today
            </h2>
            <MasonryGallery products={filteredProducts} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
