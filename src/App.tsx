import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ShopperSignup from "./pages/ShopperSignup";
import VendorSignup from "./pages/VendorSignup";
import ShopperDashboard from "./pages/ShopperDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VendorProfile from "./pages/VendorProfile";
import VendorNewListing from "./pages/VendorNewListing";
import ListingRouter from "./pages/ListingRouter";
import HighFives from "./pages/HighFives";
import ShopperProfile from "./pages/ShopperProfile";
import NotFound from "./pages/NotFound";
import AccountSettings from "./pages/settings/AccountSettings";
import ProfileSettings from "./pages/settings/ProfileSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import VendorSettings from "./pages/settings/VendorSettings";
import PrivacySettings from "./pages/settings/PrivacySettings";
import HelpPage from "./pages/HelpPage";
import SupportPage from "./pages/SupportPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import VendorPendingApproval from "./components/VendorPendingApproval";
import EmailTestPage from "./pages/EmailTestPage";
import TestDataPage from "./pages/TestDataPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup/shopper" element={<ShopperSignup />} />
              <Route path="/signup/vendor" element={<VendorSignup />} />
              <Route path="/vendor/pending-approval" element={<VendorPendingApproval />} />
              <Route path="/dashboard/shopper" element={<ShopperDashboard />} />
              <Route path="/dashboard/vendor" element={<VendorDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/vendor/:vendorId" element={<VendorProfile />} />
              <Route path="/vendor/listing/new" element={<VendorNewListing />} />
              <Route path="/vendor/listing/edit/:listingId" element={<VendorNewListing />} />
              <Route path="/listing/:listingId" element={<ListingRouter />} />
              <Route path="/high-fives" element={<HighFives />} />
              <Route path="/shopper/:shopperId" element={<ShopperProfile />} />
              
              {/* Settings Routes */}
              <Route path="/settings/account" element={<AccountSettings />} />
              <Route path="/settings/profile" element={<ProfileSettings />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/settings/vendor" element={<VendorSettings />} />
              <Route path="/settings/privacy" element={<PrivacySettings />} />
              
              {/* Info Pages */}
              <Route path="/help" element={<HelpPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Admin Tools */}
              <Route path="/admin/email-test" element={<EmailTestPage />} />
              <Route path="/admin/test-data" element={<TestDataPage />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
