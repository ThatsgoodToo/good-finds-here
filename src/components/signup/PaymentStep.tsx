import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CreditCard, Sparkles, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentStepProps {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
  onTrialSelect?: () => void;
}

const PaymentStep = ({ promoCode, onPromoCodeChange, onNext, onBack, onTrialSelect }: PaymentStepProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isTrial, setIsTrial] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoValid, setPromoValid] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [remainingClaims, setRemainingClaims] = useState<number | null>(null);

  // Validate promo code when it changes
  useEffect(() => {
    const validatePromoCode = async () => {
      if (!promoCode || promoCode.length < 3) {
        setPromoValid(false);
        setPromoError("");
        setRemainingClaims(null);
        return;
      }

      setIsValidatingPromo(true);
      setPromoError("");

      try {
        const { data, error } = await supabase.functions.invoke('validate-promo', {
          body: { promoCode, subscriptionType: null }
        });

        if (error) throw error;

        if (data.valid) {
          setPromoValid(true);
          setRemainingClaims(data.remainingClaims);
          setPromoError("");
        } else {
          setPromoValid(false);
          setPromoError(data.error || "Invalid promo code");
          setRemainingClaims(null);
        }
      } catch (error) {
        console.error('Promo validation error:', error);
        setPromoValid(false);
        setPromoError("Failed to validate promo code");
        setRemainingClaims(null);
      } finally {
        setIsValidatingPromo(false);
      }
    };

    const debounce = setTimeout(validatePromoCode, 500);
    return () => clearTimeout(debounce);
  }, [promoCode]);

  const handleContinue = () => {
    if (isTrial || promoValid || paymentMethod) {
      onNext();
    }
  };

  const handleTrialClick = () => {
    setIsTrial(true);
    onPromoCodeChange('__TRIAL__'); // Set special marker for trial
    if (onTrialSelect) onTrialSelect();
    onNext();
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Subscription & Payment</CardTitle>
        <CardDescription>
          Choose your subscription plan
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 15-Day Trial Option - Top Priority */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border-2 border-primary shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl">15-Day Free Trial</h3>
                <Badge variant="secondary" className="text-xs">Most Popular</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No payment required. Full access to explore the platform. Trial expires in 15 days.
              </p>
              <Button 
                onClick={handleTrialClick}
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Founding Member Promo Code Section */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg border-2 border-accent/40">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/20 rounded-full">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl">Founding Member Code</h3>
                <Badge variant="outline" className="text-xs bg-accent/20">1 Year Access</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Have a founding member code? Unlock 1 year of full access. No payment required.
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      onPromoCodeChange(upperValue);
                    }}
                    className="max-w-xs"
                    disabled={isValidatingPromo}
                  />
                  {isValidatingPromo && (
                    <Badge variant="secondary" className="self-center">
                      Validating...
                    </Badge>
                  )}
                  {promoValid && (
                    <Badge className="self-center bg-green-600">
                      ✓ Valid
                    </Badge>
                  )}
                </div>
                
                {promoError && (
                  <p className="text-sm text-destructive">{promoError}</p>
                )}
                
                {promoValid && remainingClaims !== null && (
                  <div className="p-3 bg-accent/30 rounded-lg border border-accent/40">
                    <p className="text-sm font-medium text-accent-foreground">
                      ✓ 1 Year Access Unlocked!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {remainingClaims} of 500 codes remaining
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Standard Subscription - Only show if no trial/promo selected */}
        {!isTrial && !promoValid && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-6 bg-muted/30 rounded-lg border-2 border-border">
              <CreditCard className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Standard Subscription
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>
                    <strong className="text-foreground">Startup price:</strong> $3/month billed every 6 months
                  </p>
                  <p>
                    After this period, the subscription automatically renews at $7/month.
                  </p>
                  <p className="text-primary font-medium">
                    14-day refund available
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Credit / Debit Card
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                        Stripe
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground text-center">
                        Payment integration will be set up in the next step
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={!isTrial && !promoValid && !paymentMethod}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default PaymentStep;
