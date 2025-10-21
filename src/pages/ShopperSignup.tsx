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
import PaymentStep from "@/components/signup/PaymentStep";
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
      // Check if trial was selected from PaymentStep
      const isTrial = signupData.promoCode === '__TRIAL__';
      
      let userId: string;

      // If existing user (dual role), skip account creation
      if (isExistingUser && user) {
        userId = user.id;
        
        // Just update their role to shopper (they'll keep vendor role too)
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // If they're a vendor, they can now be both vendor and shopper
        // The role field stays as their primary role, but they get shopper access
        
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

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("No user returned from signup");
        
        userId = authData.user.id;
      }

      // Create subscription based on selection (skip for dual role since they already have vendor subscription)
      if (!isDualRole) {
        if (isTrial) {
          // Create 15-day trial subscription
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 15);

          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              subscription_type: 'trial',
              end_date: endDate.toISOString(),
              status: 'active'
            });

          if (subError) console.error('Subscription creation error:', subError);

          // Update profile status
          await supabase
            .from('profiles')
            .update({ subscription_status: 'trial' })
            .eq('id', userId);

        } else if (signupData.promoCode && signupData.promoCode !== '__TRIAL__' && signupData.promoCode !== 'DUAL_ROLE') {
          // Create subscription via promo code validation
          const { data: promoResult, error: promoError } = await supabase.functions.invoke('validate-promo', {
            body: {
              promoCode: signupData.promoCode,
              subscriptionType: 'founding_member'
            }
          });

          if (promoError || !promoResult?.subscriptionCreated) {
            console.error('Promo code error:', promoError);
            toast.error('Failed to activate promo code, but account was created');
          }
        }
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

      if (updateError) throw updateError;

      // Show success message with subscription info
      if (isExistingUser && isDualRole) {
        toast.success("You can now shop and discover as well!");
      } else if (isTrial) {
        toast.success("Welcome! Your 15-day free trial starts now.");
      } else if (signupData.promoCode && signupData.promoCode !== 'DUAL_ROLE') {
        toast.success("Welcome! Your founding member access is active.");
      } else {
        toast.success("Welcome to That's Good Too! Your account has been created.");
      }
      
      navigate("/dashboard/shopper");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
          {[1, 2, 3, 4, 5, 6].map((step) => (
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
          <PaymentStep
            promoCode={signupData.promoCode}
            onPromoCodeChange={(code) => updateSignupData({ promoCode: code })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 6 && (
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
          onToggleMap={() => {}}
          isMapView={false}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>
    </div>
  );
};

export default ShopperSignup;
