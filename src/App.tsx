import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ShopperSignup from "./pages/ShopperSignup";
import VendorSignup from "./pages/VendorSignup";
import ShopperDashboard from "./pages/ShopperDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfile from "./pages/VendorProfile";
import VendorNewListing from "./pages/VendorNewListing";
import ProductListing from "./pages/ProductListing";
import AudioListing from "./pages/AudioListing";
import VideoListing from "./pages/VideoListing";
import HighFives from "./pages/HighFives";
import ShopperProfile from "./pages/ShopperProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup/shopper" element={<ShopperSignup />} />
              <Route path="/signup/vendor" element={<VendorSignup />} />
              <Route path="/dashboard/shopper" element={<ShopperDashboard />} />
              <Route path="/dashboard/vendor" element={<VendorDashboard />} />
              <Route path="/vendor/:vendorId" element={<VendorProfile />} />
              <Route path="/vendor/listing/new" element={<VendorNewListing />} />
              <Route path="/listing/product/:listingId" element={<ProductListing />} />
              <Route path="/listing/audio/:listingId" element={<AudioListing />} />
              <Route path="/listing/video/:listingId" element={<VideoListing />} />
              <Route path="/high-fives" element={<HighFives />} />
              <Route path="/shopper/:shopperId" element={<ShopperProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
