import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import WelcomeStep from "@/components/signup/WelcomeStep";
import AccountCreationStep from "@/components/signup/AccountCreationStep";
import FilterInputStep from "@/components/signup/FilterInputStep";
import ReviewFiltersStep from "@/components/signup/ReviewFiltersStep";
import TermsStep from "@/components/signup/TermsStep";
import { Card } from "@/components/ui/card";

export type SignupData = {
  fullName: string;
  email: string;
  password: string;
  profilePicture: File | null;
  ageVerified: boolean;
  interests: string[];
  termsAccepted: boolean;
  analyticsConsent: boolean;
};

const ShopperSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    email: "",
    password: "",
    profilePicture: null,
    ageVerified: false,
    interests: [],
    termsAccepted: false,
    analyticsConsent: false,
  });

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: "shopper",
            display_name: signupData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user returned from signup");

      // Update profile with additional data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: signupData.fullName,
          interests: signupData.interests,
          age_verified: signupData.ageVerified,
          terms_accepted: signupData.termsAccepted,
          analytics_consent: signupData.analyticsConsent,
          onboarding_completed: true,
        })
        .eq("id", authData.user.id);

      if (updateError) throw updateError;

      toast.success("Welcome to That's Good Too! Your account has been created.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="That's Good Too" className="h-16 w-16" />
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full transition-colors ${
                step <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {currentStep === 1 && <WelcomeStep onNext={handleNext} />}
        
        {currentStep === 2 && (
          <AccountCreationStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <FilterInputStep
            interests={signupData.interests}
            onUpdate={(interests) => updateSignupData({ interests })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 4 && (
          <ReviewFiltersStep
            interests={signupData.interests}
            onUpdate={(interests) => updateSignupData({ interests })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 5 && (
          <TermsStep
            data={signupData}
            onUpdate={updateSignupData}
            onFinish={handleFinish}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </Card>
    </div>
  );
};

export default ShopperSignup;
