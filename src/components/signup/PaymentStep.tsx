import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";

interface PaymentStepProps {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PaymentStep = ({ promoCode, onPromoCodeChange, onNext, onBack }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  const handleContinue = () => {
    // If trial, promo code, or payment method selected, allow continue
    if (isTrial || promoCode || paymentMethod) {
      onNext();
    }
  };

  const handleTrialClick = () => {
    setIsTrial(true);
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
        {/* Trial Button */}
        <div className="space-y-4 p-6 bg-primary/10 rounded-lg border-2 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Start Free Trial
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try the platform for free. No payment required to get started.
              </p>
            </div>
            <Button 
              onClick={handleTrialClick}
              size="lg"
              className="ml-4"
            >
              Start Trial
            </Button>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="space-y-4 p-6 bg-muted/50 rounded-lg border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              Free
            </Badge>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Founding Member / Promo Code
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have a promo or founding member code, enter it to sign up for free. No payment details required.
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => {
                    onPromoCodeChange(e.target.value);
                    setHasPromoCode(e.target.value.length > 0);
                  }}
                  className="max-w-xs"
                />
                {promoCode && (
                  <Badge className="self-center" variant="default">
                    Applied ✓
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Standard Subscription */}
        {!hasPromoCode && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-6 bg-background rounded-lg border-2">
              <CreditCard className="h-5 w-5 mt-1 text-primary" />
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
            disabled={!isTrial && !hasPromoCode && !paymentMethod}
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
