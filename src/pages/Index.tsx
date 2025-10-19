import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import MasonryGallery from "@/components/MasonryGallery";
import ListView from "@/components/ListView";
import MapView from "@/components/MapView";
import { CategoryType } from "@/components/ProductCard";
import { toast } from "sonner";

type FilterType = "all" | CategoryType;

const Index = () => {
  const { user, userRole } = useAuth();
  const [isMapView, setIsMapView] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");

  const handleSearch = (query: string) => {
    setHasSearched(true);
  };

  const handleBack = () => {
    setHasSearched(false);
    setIsMapView(false);
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
      window.location.href = "/dashboard/shopper";
    } else if (userRole === "vendor") {
      window.location.href = "/dashboard/vendor";
    }
  };

  // Mock products data
  const products = [
    {
      id: "1",
      title: "Handcrafted Ceramic Bowl",
      price: "$45.00",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
      category: "product" as CategoryType,
      vendor: "Clay & Co.",
      vendorId: "vendor-1",
    },
    {
      id: "2",
      title: "Local Honey - Wildflower",
      price: "$12.00",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=500",
      category: "product" as CategoryType,
      vendor: "Bee Happy Farms",
      vendorId: "vendor-2",
    },
    {
      id: "3",
      title: "Pottery Workshop",
      price: "$75.00",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500",
      category: "experience" as CategoryType,
      vendor: "Studio Ceramics",
      vendorId: "vendor-3",
    },
    {
      id: "4",
      title: "Silver Earrings",
      price: "$28.00",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      category: "product" as CategoryType,
      vendor: "Metalworks",
      vendorId: "vendor-4",
    },
    {
      id: "5",
      title: "Web Design Service",
      price: "$500.00",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=500",
      category: "service" as CategoryType,
      vendor: "Digital Dreams",
      vendorId: "vendor-5",
    },
    {
      id: "6",
      title: "Vintage Lamp - SALE",
      price: "$35.00",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
      category: "sale" as CategoryType,
      vendor: "Retro Home",
      vendorId: "vendor-6",
    },
    {
      id: "7",
      title: "Organic Soaps",
      price: "$8.00",
      image: "https://images.unsplash.com/photo-1600428449936-7d99b66d3e7c?w=500",
      category: "product" as CategoryType,
      vendor: "Pure Essence",
      vendorId: "vendor-7",
    },
    {
      id: "8",
      title: "Painting Class",
      price: "$60.00",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500",
      category: "experience" as CategoryType,
      vendor: "Art Studio",
      vendorId: "vendor-8",
    },
  ];

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showGoodToday={!hasSearched}
        onWhatsgoodClick={handleWhatsgoodClick}
        onHighFiveClick={handleHighFiveClick}
        onYourGoodsClick={handleYourGoodsClick}
      />
      
      <main className="pt-16 sm:pt-20">
        {/* Hero search (centered) or bottom search bar */}
        <SearchBar
          onSearch={handleSearch}
          onToggleMap={() => setIsMapView(!isMapView)}
          isMapView={isMapView}
          isCentered={!hasSearched}
          onWhatsgoodClick={handleWhatsgoodClick}
        />

        {/* Content appears after search */}
        {hasSearched && !isMapView && (
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

        {hasSearched && isMapView && <MapView />}
      </main>
    </div>
  );
};

export default Index;
