import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
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
import { ExternalLink, CheckCircle, Hand, ChevronLeft, ChevronRight, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const VideoListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Mock data
  const vendor = {
    id: "1",
    name: "FATKING",
    logo: "https://images.unsplash.com/photo-1574267432644-f610f5293f3e?w=100",
    website: "https://fatking.example.com",
    location: "Sacramento, CA",
    verified: true,
  };

  const video = {
    title: "VIDEO TITLE",
    description: "A compelling visual narrative exploring urban life and human connection. Shot on location with a focus on authentic storytelling.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    thumbnails: [
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600",
      "https://images.unsplash.com/photo-1574267432644-f610f5293f3e?w=600",
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600",
    ],
    ownership: "Independent Filmmaker",
    expertise: "Documentary & Narrative",
    videoInfo: {
      publishDate: "2025",
      duration: "8:42",
      views: "12.5K",
    },
    activeOffer: "Free screening available",
    highFives: 3000,
    filters: ["Documentary", "Urban Life", "Short Film", "Independent"],
  };

  const moreFromVendor = [
    { id: "1", title: "City Lights", image: video.thumbnails[0], types: ["video"] },
    { id: "2", title: "Street Stories", image: video.thumbnails[0], types: ["video"] },
    { id: "3", title: "Urban Poetry", image: video.thumbnails[0], types: ["video"] },
  ];

  const relatedListings = [
    { id: "1", title: "Documentary Series", vendor: "Film Collective", image: video.thumbnails[0], types: ["video"] },
    { id: "2", title: "Visual Essay", vendor: "Media Lab", image: video.thumbnails[0], types: ["video"] },
  ];

  const categoryColors: Record<string, string> = {
    product: "bg-category-product",
    service: "bg-category-service",
    material: "bg-category-material",
    music: "bg-category-music",
    video: "bg-category-video",
    food: "bg-category-food",
    wellness: "bg-category-wellness",
  };

  const folders = [
    { id: "1", name: "Videos" },
    { id: "2", name: "Inspiration" },
    { id: "3", name: "Favorites" },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % video.thumbnails.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + video.thumbnails.length) % video.thumbnails.length);
  };

  const handleClaimCoupon = () => {
    setShowCouponDialog(true);
  };

  const handleConfirmClaim = () => {
    toast.success("Coupon claimed! Redirecting...");
    window.open("https://bandcamp.com/", "_blank");
    setShowCouponDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Vendor Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Link to={`/vendor/${vendor.id}`}>
                <div className="h-16 w-32 bg-white rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-black">{vendor.name}</span>
                </div>
              </Link>
              
              <div className="space-y-2">
                <Button
                  variant="link"
                  className="text-sm gap-1"
                  onClick={() => window.open("https://bandcamp.com/", "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  webiste
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  location {vendor.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          {/* Video Player with Image Carousel */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-8">
            <img
              src={video.thumbnails[currentImageIndex]}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Carousel Controls */}
            {video.thumbnails.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Video Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{video.title}</h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => setShowFolderDialog(true)}
              >
                <Hand className="h-4 w-4" />
                {video.highFives.toLocaleString()}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">description</h3>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">ownership | expetise | any applicable info embeded</h3>
                <p className="text-sm text-muted-foreground">
                  {video.ownership} | {video.expertise} | {video.videoInfo.duration} • {video.videoInfo.views} views • {video.videoInfo.publishDate}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Active Offer</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{video.activeOffer}</p>
                        <p className="text-xs text-muted-foreground mt-1">Limited time offer</p>
                      </div>
                      <Button size="sm" onClick={handleClaimCoupon} className="gap-2 shrink-0">
                        <Ticket className="h-4 w-4" />
                        Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {video.filters.map((filter, index) => (
                    <Badge key={index} variant="secondary">{filter}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* More from Vendor */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">More from {vendor.name}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {moreFromVendor.map((item) => (
                <Card key={item.id} className="shrink-0 w-64 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-t-lg" loading="lazy" />
                      {item.types && item.types.length > 0 && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {item.types.map((type: string, idx: number) => (
                            <div
                              key={idx}
                              className={`h-3 w-3 rounded-full ring-1 ring-[#1a1a1a] ${categoryColors[type] || "bg-category-product"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
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
            <h2 className="text-xl font-bold mb-4">Relatable Content</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedListings.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-t-lg" loading="lazy" />
                      {item.types && item.types.length > 0 && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {item.types.map((type: string, idx: number) => (
                            <div
                              key={idx}
                              className={`h-3 w-3 rounded-full ring-1 ring-[#1a1a1a] ${categoryColors[type] || "bg-category-product"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
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
              Choose a folder to save this video or create a new one.
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
            {newFolderName ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                />
                <Button onClick={() => {
                  toast.success(`Folder "${newFolderName}" created!`);
                  setShowFolderDialog(false);
                  setNewFolderName("");
                }}>
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="default" className="w-full" onClick={() => setNewFolderName("New Folder")}>
                + Create New Folder
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Claim Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Exclusive Offer</DialogTitle>
            <DialogDescription>
              {video.activeOffer}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will redirect you to {vendor.name}'s website where you can access this exclusive offer.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCouponDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2" onClick={handleConfirmClaim}>
                <Ticket className="h-4 w-4" />
                Claim & Visit Site
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default VideoListing;
