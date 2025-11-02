import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnboardingTutorial = () => {
  const { user, activeRole } = useAuth();
  const [showHelpButton, setShowHelpButton] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem("tgt_tour_completed");
    const firstSigninComplete = localStorage.getItem("tgt_first_signin_complete");
    
    if (user && !tourCompleted && !firstSigninComplete) {
      // Mark that first sign-in has occurred
      localStorage.setItem("tgt_first_signin_complete", "true");
      
      // Show tour after a brief delay to ensure all elements are loaded
      setTimeout(() => {
        startTour();
      }, 1500);
    } else if (user) {
      setShowHelpButton(true);
    }
  }, [user, activeRole]); // eslint-disable-line react-hooks/exhaustive-deps
  // startTour is defined below and including it would cause circular dependency

  const getSteps = () => {
    const isVendor = activeRole === "vendor";

    if (isVendor) {
      return [
        {
          element: '[data-tour="your-goods-icon"]',
          popover: {
            title: "Vendor Dashboard",
            description: "Your home base for managing your business. View metrics, create listings, and engage with shoppers.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="hi-fives-icon"]',
          popover: {
            title: "Your Followers",
            description: "See shoppers who have Hi-Fived your listings. Send them personalized coupon codes to drive sales.",
            side: "bottom" as const,
            align: "center" as const,
          },
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: "Customize Your View",
            description: "Switch between light and dark modes to match your preference or device settings.",
            side: "bottom" as const,
            align: "center" as const,
          },
        },
        {
          element: '[data-tour="settings-menu"]',
          popover: {
            title: "Settings & More",
            description: "Access your account settings, vendor settings, notifications, messages, help center, and more.",
            side: "bottom" as const,
            align: "end" as const,
          },
        },
        {
          element: '[data-tour="vendor-dashboard"]',
          popover: {
            title: "Dashboard Tabs",
            description: "Navigate between Overview (metrics), Listings (your products), Active Offers (coupons), and Hi-Fives (engaged shoppers).",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="vendor-listings"]',
          popover: {
            title: "Create Your Listings",
            description: "Click here to add your products, services, or experiences. Include great photos and descriptions to attract shoppers.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="vendor-offers"]',
          popover: {
            title: "Set Up Offers",
            description: "Create coupon codes to attract shoppers. You can set discount amounts and expiration dates.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="vendor-hi-fives"]',
          popover: {
            title: "Share with Shoppers",
            description: "When shoppers 'Hi-Five' you, you can send them exclusive offers directly. Check this tab to engage with interested customers.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="vendor-metrics"]',
          popover: {
            title: "Track Your Performance",
            description: "Monitor clicks, sales, and followers in your dashboard. Use these insights to grow your business.",
            side: "left" as const,
            align: "start" as const,
          },
        },
        {
          element: '[data-tour="vendor-image-upload"]',
          popover: {
            title: "Update Your Brand Image",
            description: "Upload a profile image that represents your brand. This appears on your vendor page and listings.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
      ];
    }

    // Shopper steps
    return [
      {
        element: '[data-tour="your-goods-icon"]',
        popover: {
          title: "Your Personal Dashboard",
          description: "Click the squirrel to access your dashboard where you can organize saved items into folders and manage your preferences.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: '[data-tour="hi-fives-icon"]',
        popover: {
          title: "Save Your Favorites",
          description: "Click the hand icon to see all items and vendors you've Hi-Fived. Vendors are notified and may send you exclusive offers!",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: '[data-tour="theme-toggle"]',
        popover: {
          title: "Customize Your View",
          description: "Switch between light and dark modes to match your preference or device settings.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: '[data-tour="settings-menu"]',
        popover: {
          title: "Settings & More",
          description: "Access your account settings, notifications, messages, help center, and more.",
          side: "bottom" as const,
          align: "end" as const,
        },
      },
      {
        element: '[data-tour="search-bar"]',
        popover: {
          title: "Search & Discover",
          description: "Use the search bar to find products, services, and experiences. Filter by category to narrow down your results.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: '[data-tour="whatsgood-button"]',
        popover: {
          title: "What's Good Today",
          description: "Click here to see today's featured items and special offers from local vendors.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: '[data-tour="view-toggle"]',
        popover: {
          title: "Switch Views",
          description: "Toggle between gallery and map view to see vendors near you or browse products visually.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: '[data-tour="filter-bar"]',
        popover: {
          title: "Filter Results",
          description: "Narrow down results by category (Products, Services, Experiences, Sales). Toggle between grid and list views.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: '[data-tour="hi-five-icon"]',
        popover: {
          title: "Hi-Five Items",
          description: "Click the hand icon on any item to save it to your dashboard. Vendors get notified and may send you exclusive deals!",
          side: "top" as const,
          align: "center" as const,
        },
      },
      {
        element: '[data-tour="vendor-signup"]',
        popover: {
          title: "Become a Vendor",
          description: "Ready to sell on TGT? Click here to sign up as a vendor and start showcasing your products.",
          side: "bottom" as const,
          align: "end" as const,
        },
      },
    ];
  };

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: getSteps(),
      popoverClass: "driverjs-theme",
      animate: true,
      overlayOpacity: 0.75,
      popoverOffset: 20,
      onDestroyStarted: () => {
        // Mark tour as completed when user closes it
        localStorage.setItem("tgt_tour_completed", "true");
        setShowHelpButton(true);
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  const replayTour = () => {
    startTour();
  };

  if (!user) return null;

  return (
    <>
      {showHelpButton && (
        <Button
          onClick={replayTour}
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Replay Tour"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default OnboardingTutorial;
