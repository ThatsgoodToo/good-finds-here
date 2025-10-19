import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import MasonryGallery from "@/components/MasonryGallery";
import MapView from "@/components/MapView";
import { CategoryType } from "@/components/ProductCard";

type FilterType = "all" | CategoryType;

const Index = () => {
  const [isMapView, setIsMapView] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    setHasSearched(true);
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
    },
    {
      id: "2",
      title: "Local Honey - Wildflower",
      price: "$12.00",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=500",
      category: "product" as CategoryType,
      vendor: "Bee Happy Farms",
    },
    {
      id: "3",
      title: "Pottery Workshop",
      price: "$75.00",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500",
      category: "experience" as CategoryType,
      vendor: "Studio Ceramics",
    },
    {
      id: "4",
      title: "Silver Earrings",
      price: "$28.00",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
      category: "product" as CategoryType,
      vendor: "Metalworks",
    },
    {
      id: "5",
      title: "Web Design Service",
      price: "$500.00",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=500",
      category: "service" as CategoryType,
      vendor: "Digital Dreams",
    },
    {
      id: "6",
      title: "Vintage Lamp - SALE",
      price: "$35.00",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
      category: "sale" as CategoryType,
      vendor: "Retro Home",
    },
    {
      id: "7",
      title: "Organic Soaps",
      price: "$8.00",
      image: "https://images.unsplash.com/photo-1600428449936-7d99b66d3e7c?w=500",
      category: "product" as CategoryType,
      vendor: "Pure Essence",
    },
    {
      id: "8",
      title: "Painting Class",
      price: "$60.00",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500",
      category: "experience" as CategoryType,
      vendor: "Art Studio",
    },
  ];

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header showGoodToday={!hasSearched} />
      
      <main className="pt-20">
        {/* Hero search (centered) or bottom search bar */}
        <SearchBar
          onSearch={handleSearch}
          onToggleMap={() => setIsMapView(!isMapView)}
          isMapView={isMapView}
          isCentered={!hasSearched}
        />

        {/* Content appears after search */}
        {hasSearched && !isMapView && (
          <>
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            <MasonryGallery products={filteredProducts} />
          </>
        )}

        {hasSearched && isMapView && <MapView />}
      </main>
    </div>
  );
};

export default Index;
