import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, CheckCircle, Heart, ChevronDown } from "lucide-react";

const ProductListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  // Mock data
  const vendor = {
    id: "1",
    name: "GINEW",
    logo: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100",
    website: "https://ginew.example.com",
    location: "Sacramento, CA",
    verified: true,
    ownership: "Native American Owned",
    expertise: "Traditional Craftsmanship",
  };

  const product = {
    title: "Striped Heritage Shirt",
    description: "Handcrafted shirt made with traditional techniques and sustainable materials. Each piece tells a story of cultural heritage and modern design.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    ],
    shipping: ["Shipping", "Pickup", "In-person"],
    details: {
      material: "100% Organic Cotton",
      colors: ["Rust", "Cream", "Brown"],
      sizes: ["S", "M", "L", "XL"],
      quantity: "In Stock",
    },
    highFives: 1114,
    filters: ["Experience", "vibrational", "nourish", "watch & listen", "restore"],
  };

  const moreFromVendor = [
    { id: "1", title: "Denim Jacket", image: product.images[0] },
    { id: "2", title: "Leather Belt", image: product.images[0] },
    { id: "3", title: "Canvas Bag", image: product.images[0] },
  ];

  const relatedListings = [
    { id: "1", title: "Similar Shirt", vendor: "Another Brand", image: product.images[0] },
    { id: "2", title: "Handwoven Top", vendor: "Artisan Co", image: product.images[0] },
  ];

  const folders = [
    { id: "1", name: "Travel" },
    { id: "2", name: "Favorites" },
    { id: "3", name: "Gift Ideas" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Vendor Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={vendor.logo} alt={vendor.name} />
                <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                    className="text-2xl font-bold hover:text-primary transition-colors"
                  >
                    {vendor.name}
                  </button>
                  {vendor.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      TGT Verified
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="link"
                  className="text-sm gap-1"
                  onClick={() => window.open(vendor.website, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  website
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  location {vendor.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Product Images */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Thumbnail Strip */}
                <div className="flex flex-col gap-2 w-16">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`border-2 rounded-lg overflow-hidden transition-all ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-16 object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                  {product.images.length > 5 && (
                    <button className="border-2 border-border rounded-lg h-16 flex items-center justify-center text-sm text-muted-foreground hover:border-primary transition-colors">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Main Image */}
                <div className="flex-1">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">{product.title}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowFolderDialog(true)}
                  >
                    <Heart className="h-4 w-4" />
                    {product.highFives.toLocaleString()}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">description of item:</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">shops ownership</h3>
                  <p className="text-sm text-muted-foreground">{vendor.ownership}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">shops exerptise</h3>
                  <p className="text-sm text-muted-foreground">{vendor.expertise}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shops shipping optoin</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.shipping.map((option, index) => (
                      <Badge key={index} variant="secondary">{option}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">item desciption</h3>
                  <div className="text-sm space-y-1">
                    <p>size, color , material</p>
                    <p className="text-muted-foreground">
                      {product.details.sizes.join(", ")} | {product.details.colors.join(", ")} | {product.details.material}
                    </p>
                    <p className="text-muted-foreground">info as applicaable</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Filters, {product.filters.join(", ")}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* More from Vendor */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">More from {vendor.name}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {moreFromVendor.map((item) => (
                <Card key={item.id} className="shrink-0 w-48 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" loading="lazy" />
                    <div className="p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Related Listings */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Relatable Listings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedListings.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" loading="lazy" />
                    <div className="p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.vendor}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <SearchBar
          onSearch={() => {}}
          onToggleMap={() => {}}
          isMapView={false}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      {/* Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Folder</DialogTitle>
            <DialogDescription>
              Choose a folder to save this item or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFolderDialog(false)}
              >
                {folder.name}
              </Button>
            ))}
            <Button variant="default" className="w-full">
              Create New Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductListing;
