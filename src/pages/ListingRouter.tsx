import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductListing from "./ProductListing";
import VideoListing from "./VideoListing";
import AudioListing from "./AudioListing";

const ListingRouter = () => {
  const { listingId } = useParams();
  const [listingType, setListingType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingType = async () => {
      if (!listingId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("listing_type")
        .eq("id", listingId)
        .maybeSingle();

      if (data) {
        setListingType(data.listing_type);
      }
      setLoading(false);
    };

    fetchListingType();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listingType) {
    return <Navigate to="/404" replace />;
  }

  // Render the appropriate component based on listing type
  switch (listingType) {
    case "video":
      return <VideoListing />;
    case "audio":
      return <AudioListing />;
    case "product":
    default:
      return <ProductListing />;
  }
};

export default ListingRouter;
