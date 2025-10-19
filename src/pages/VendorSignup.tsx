import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Card } from "@/components/ui/card";
import VendorBasicInfoStep from "@/components/vendor-signup/VendorBasicInfoStep";
import VendorBusinessStep from "@/components/vendor-signup/VendorBusinessStep";
import VendorExpertiseStep from "@/components/vendor-signup/VendorExpertiseStep";
import VendorPracticesStep from "@/components/vendor-signup/VendorPracticesStep";
import VendorPricingStep from "@/components/vendor-signup/VendorPricingStep";
import VendorSubscriptionStep from "@/components/vendor-signup/VendorSubscriptionStep";
import VendorConfirmationStep from "@/components/vendor-signup/VendorConfirmationStep";
import VendorThankYouStep from "@/components/vendor-signup/VendorThankYouStep";

export type VendorSignupData = {
  // Page 1: Basic Info
  website: string;
  socialMediaLinks: string[];
  city: string;
  stateRegion: string;
  country: string;
  phoneNumber: string;
  businessType: string;
  businessTypeOther: string;
  
  // Page 2: About Business
  businessDescription: string;
  productsServices: string[];
  inventoryType: string[];
  shippingOptions: string[];
  pickupAddress: string;
  
  // Page 3: Expertise
  areaOfExpertise: string[];
  businessDuration: string;
  craftDevelopment: string;
  certificationsAwards: string;
  
  // Page 4: Practices & Creativity
  creativityStyle: string;
  inspiration: string;
  brandUniqueness: string;
  sustainableMethods: string[];
  
  // Page 5: Pricing & Accessibility
  pricingStyle: string;
  exclusiveOffers: string;
  promotionSocialChannels: string;
  futureWebsite: string;
  
  // Page 6: Subscription
  promoCode: string;
  subscriptionType: string;
  paymentMethodSaved: boolean;
  
  // Page 7: Confirmation
  additionalInfo: string;
  infoAccurate: boolean;
  understandsReview: boolean;
  agreesToTerms: boolean;
  receiveUpdates: boolean;
};

const VendorSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signupData, setSignupData] = useState<VendorSignupData>({
    website: "",
    socialMediaLinks: [],
    city: "",
    stateRegion: "",
    country: "",
    phoneNumber: "",
    businessType: "",
    businessTypeOther: "",
    businessDescription: "",
    productsServices: [],
    inventoryType: [],
    shippingOptions: [],
    pickupAddress: "",
    areaOfExpertise: [],
    businessDuration: "",
    craftDevelopment: "",
    certificationsAwards: "",
    creativityStyle: "",
    inspiration: "",
    brandUniqueness: "",
    sustainableMethods: [],
    pricingStyle: "",
    exclusiveOffers: "",
    promotionSocialChannels: "",
    futureWebsite: "",
    promoCode: "",
    subscriptionType: "",
    paymentMethodSaved: false,
    additionalInfo: "",
    infoAccurate: false,
    understandsReview: false,
    agreesToTerms: false,
    receiveUpdates: false,
  });

  const updateSignupData = (data: Partial<VendorSignupData>) => {
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to submit an application");
        navigate("/auth");
        return;
      }

      // Submit vendor application
      const { error } = await supabase
        .from("vendor_applications")
        .insert({
          user_id: user.id,
          website: signupData.website,
          social_media_links: signupData.socialMediaLinks,
          city: signupData.city,
          state_region: signupData.stateRegion,
          country: signupData.country,
          phone_number: signupData.phoneNumber,
          business_type: signupData.businessType,
          business_type_other: signupData.businessTypeOther,
          business_description: signupData.businessDescription,
          products_services: signupData.productsServices,
          inventory_type: signupData.inventoryType,
          shipping_options: signupData.shippingOptions,
          pickup_address: signupData.pickupAddress,
          area_of_expertise: signupData.areaOfExpertise,
          business_duration: signupData.businessDuration,
          craft_development: signupData.craftDevelopment,
          certifications_awards: signupData.certificationsAwards,
          creativity_style: signupData.creativityStyle,
          inspiration: signupData.inspiration,
          brand_uniqueness: signupData.brandUniqueness,
          sustainable_methods: signupData.sustainableMethods,
          pricing_style: signupData.pricingStyle,
          exclusive_offers: signupData.exclusiveOffers,
          promotion_social_channels: signupData.promotionSocialChannels,
          future_website: signupData.futureWebsite,
          promo_code: signupData.promoCode,
          subscription_type: signupData.subscriptionType,
          payment_method_saved: signupData.paymentMethodSaved,
          additional_info: signupData.additionalInfo,
          info_accurate: signupData.infoAccurate,
          understands_review: signupData.understandsReview,
          agrees_to_terms: signupData.agreesToTerms,
          receive_updates: signupData.receiveUpdates,
        });

      if (error) throw error;

      handleNext();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 8;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-6">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="That's Good Too" className="h-16 w-16" />
        </div>

        {currentStep < 8 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps - 1 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-12 rounded-full transition-colors ${
                  idx + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        {currentStep === 1 && (
          <VendorBasicInfoStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <VendorBusinessStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <VendorExpertiseStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <VendorPracticesStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 5 && (
          <VendorPricingStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 6 && (
          <VendorSubscriptionStep
            data={signupData}
            onUpdate={updateSignupData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 7 && (
          <VendorConfirmationStep
            data={signupData}
            onUpdate={updateSignupData}
            onFinish={handleFinish}
            onBack={handleBack}
            loading={loading}
          />
        )}

        {currentStep === 8 && (
          <VendorThankYouStep onClose={() => navigate("/")} />
        )}
      </Card>
    </div>
  );
};

export default VendorSignup;
