import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
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
  promoCode: string;
  isTrial: boolean;
  termsAccepted: boolean;
  analyticsConsent: boolean;
};

const ShopperSignup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isDualRole = searchParams.get('promo') === 'DUAL_ROLE';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    email: "",
    password: "",
    profilePicture: null,
    ageVerified: false,
    interests: [],
    promoCode: isDualRole ? "DUAL_ROLE" : "",
    isTrial: false,
    termsAccepted: false,
    analyticsConsent: false,
  });

  // Check if user is already authenticated and load their data
  useEffect(() => {
    const loadUserData = async () => {
      if (user && isDualRole) {
        setIsExistingUser(true);
        
        // Load existing profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setSignupData(prev => ({
            ...prev,
            fullName: profile.full_name || "",
            email: profile.email || user.email || "",
            ageVerified: true, // Already verified if they have an account
          }));
        }
      }
    };

    loadUserData();
  }, [user, isDualRole]);

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
      let userId: string;

      // If existing user (dual role), skip account creation
      if (isExistingUser && user) {
        userId = user.id;
      } else {
        // Sign up the user (new account)
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

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw new Error(`Signup failed: ${signUpError.message}`);
        }
        
        if (!authData.user) {
          throw new Error("Account created but no user data returned. Please try signing in.");
        }
        
        // Wait for session to be established
        if (!authData.session) {
          console.log("No session returned, user may need to verify email");
          toast.info("Account created! Please check your email to verify.");
          navigate("/auth");
          return;
        }
        
        userId = authData.user.id;
      }

      // Update profile with additional data
      const profileUpdate: any = {
        interests: signupData.interests,
        age_verified: signupData.ageVerified,
        terms_accepted: signupData.termsAccepted,
        analytics_consent: signupData.analyticsConsent,
        onboarding_completed: true,
      };

      // Only update name if it changed or for new users
      if (!isExistingUser || signupData.fullName) {
        profileUpdate.full_name = signupData.fullName;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // Wait a moment to ensure database update completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show success message
      if (isExistingUser && isDualRole) {
        toast.success("You can now shop and discover as well!");
      } else {
        toast.success("Welcome to That's Good Too! Enjoy your Founding Member free access.");
      }
      
      navigate("/dashboard/shopper");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showGoodToday={false} />
      
      <main className="pt-16 sm:pt-20 pb-24">
        <div className="flex items-center justify-center p-4 pt-8">
          <Card className="w-full max-w-2xl p-6">

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
            isExistingUser={isExistingUser}
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
        
        <SearchBar
          onSearch={() => {}}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>
    </div>
  );
};

export default ShopperSignup;
