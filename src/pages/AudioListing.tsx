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
import { ExternalLink, CheckCircle, Heart } from "lucide-react";

const AudioListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  // Mock data
  const vendor = {
    id: "1",
    name: "KONDOR",
    logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100",
    website: "https://kondor.example.com",
    location: "Sacramento, CA",
    verified: true,
  };

  const audio = {
    title: "Collapse",
    description: "Ambient soundscape exploring themes of transformation and renewal. A meditative journey through sound.",
    playlist: [
      { id: "1", title: "Collapse", artist: "KONDOR", duration: "04:16" },
      { id: "2", title: "Collapse", artist: "KONDOR", duration: "04:16" },
      { id: "3", title: "Collapse", artist: "KONDOR", duration: "04:16" },
    ],
    coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    trackInfo: {
      releaseDate: "2025",
      genre: "Ambient",
      credits: "Produced by KONDOR",
    },
    highFives: 3000,
    ownership: "Independent Musician",
    expertise: "Sound Design & Composition",
    filters: ["Ambient", "Meditation", "Acoustic", "Instrumental"],
  };

  const moreFromVendor = [
    { id: "1", title: "Echoes", image: audio.coverArt },
    { id: "2", title: "Resonance", image: audio.coverArt },
    { id: "3", title: "Drift", image: audio.coverArt },
  ];

  const relatedListings = [
    { id: "1", title: "Deep Focus", vendor: "Sound Artist", image: audio.coverArt },
    { id: "2", title: "Night Waves", vendor: "Ambient Collective", image: audio.coverArt },
  ];

  const folders = [
    { id: "1", name: "Music" },
    { id: "2", name: "Meditation" },
    { id: "3", name: "Favorites" },
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
                  webiste
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Cover Art */}
            <div className="lg:col-span-1">
              <img
                src={audio.coverArt}
                alt={audio.title}
                className="w-full rounded-lg"
                loading="lazy"
              />
            </div>

            {/* Right - Audio Player & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">VIDEO TITLE</h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowFolderDialog(true)}
                  >
                    <Heart className="h-4 w-4" />
                    {audio.highFives.toLocaleString()}
                  </Button>
                </div>
              </div>

              {/* Audio Playlist */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  {audio.playlist.map((track) => (
                    <div key={track.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground">by {track.artist}</p>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">{track.duration}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">description</h3>
                  <p className="text-sm text-muted-foreground">{audio.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">ownership | expetise</h3>
                  <p className="text-sm text-muted-foreground">
                    {audio.ownership} | {audio.expertise}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">| any applicable info embeded</h3>
                  <p className="text-sm text-muted-foreground">
                    {audio.trackInfo.genre} • {audio.trackInfo.releaseDate} • {audio.trackInfo.credits}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">any active offers</h3>
                  <p className="text-sm text-muted-foreground">No active offers at this time</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {audio.filters.map((filter, index) => (
                      <Badge key={index} variant="secondary">{filter}</Badge>
                    ))}
                  </div>
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
            <h2 className="text-xl font-bold mb-4">Relatable Content</h2>
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
              Choose a folder to save this audio or create a new one.
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

export default AudioListing;
