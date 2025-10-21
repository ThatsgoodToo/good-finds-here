import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Hand, Store, MapPin, Gift, Tag } from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const shopperSteps: OnboardingStep[] = [
  {
    title: "Welcome to TGT!",
    description: "Discover local artisans, unique products, and authentic experiences. Let's get you started with a quick tour.",
    icon: <Hand className="h-12 w-12 text-primary" />,
  },
  {
    title: "Search & Discover",
    description: "Use the search bar to find products, services, and experiences. Filter by category to narrow down your results.",
    icon: <Search className="h-12 w-12 text-primary" />,
  },
  {
    title: "Save Your Favorites",
    description: "Click the hand icon to 'Hi-Five' items you love. This saves them to your collection and notifies vendors.",
    icon: <Hand className="h-12 w-12 text-primary" />,
  },
  {
    title: "Explore the Map",
    description: "Toggle to map view to see vendors near you. Discover local businesses in your area.",
    icon: <MapPin className="h-12 w-12 text-primary" />,
  },
  {
    title: "Claim Exclusive Offers",
    description: "Watch for special coupons and offers from vendors. Claim them to get deals on your favorite items.",
    icon: <Gift className="h-12 w-12 text-primary" />,
  },
];

const vendorSteps: OnboardingStep[] = [
  {
    title: "Welcome to TGT Vendors!",
    description: "You're all set to showcase your business. Let's walk through the key features to get you started.",
    icon: <Store className="h-12 w-12 text-primary" />,
  },
  {
    title: "Create Your Listings",
    description: "Go to the Listings tab to add your products, services, or experiences. Include great photos and descriptions.",
    icon: <Tag className="h-12 w-12 text-primary" />,
  },
  {
    title: "Set Up Offers",
    description: "Create coupon codes in the Active Offers tab to attract shoppers. You can set discount amounts and expiration dates.",
    icon: <Gift className="h-12 w-12 text-primary" />,
  },
  {
    title: "Share with Shoppers",
    description: "When shoppers 'Hi-Five' you, you can send them exclusive offers directly. Check the 'Your Hi Fives' tab.",
    icon: <Hand className="h-12 w-12 text-primary" />,
  },
  {
    title: "Track Your Performance",
    description: "Monitor clicks, sales, and followers in your dashboard. Use these insights to grow your business.",
    icon: <Store className="h-12 w-12 text-primary" />,
  },
];

const OnboardingTutorial = () => {
  const { user, activeRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = activeRole === "vendor" ? vendorSteps : shopperSteps;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!error && data && !data.onboarding_completed) {
        // Show tutorial after a brief delay for better UX
        setTimeout(() => setOpen(true), 500);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save tutorial progress");
    } else {
      toast.success("Welcome aboard! You're all set.");
    }

    setLoading(false);
    setOpen(false);
  };

  const handleSkip = async () => {
    if (!user) return;

    setLoading(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    setLoading(false);
    setOpen(false);
  };

  if (!user || !open) return null;

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-center text-2xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
            className="sm:mr-auto"
          >
            Skip Tutorial
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={loading}
              className="gap-2 flex-1 sm:flex-initial"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
