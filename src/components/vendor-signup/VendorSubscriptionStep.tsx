import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorSignupData } from "@/pages/VendorSignup";
import { Check } from "lucide-react";

type VendorSubscriptionStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const VendorSubscriptionStep = ({ data, onUpdate, onNext, onBack }: VendorSubscriptionStepProps) => {
  const [hasPromoCode, setHasPromoCode] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Subscription</h2>
        <p className="text-muted-foreground">Choose your membership plan</p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Vendor Membership</CardTitle>
          <CardDescription>Join our community of makers and creators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-lg">Startup Price: $5/month</p>
            <p className="text-sm text-muted-foreground">Billed every 6 months</p>
            <p className="text-sm text-muted-foreground">After this period, automatically renews at $7/month</p>
            <p className="text-sm text-muted-foreground">14-day refund available</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Profile page on TGT marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Promotional opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Analytics dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Community support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant={hasPromoCode ? "outline" : "default"}
            onClick={() => setHasPromoCode(false)}
          >
            Standard Subscription
          </Button>
          <Button
            type="button"
            variant={hasPromoCode ? "default" : "outline"}
            onClick={() => setHasPromoCode(true)}
          >
            I Have a Promo Code
          </Button>
        </div>

        {hasPromoCode && (
          <div className="space-y-2">
            <Label htmlFor="promoCode">Founding Member / Promo Code</Label>
            <Input
              id="promoCode"
              placeholder="Enter code"
              value={data.promoCode}
              onChange={(e) => onUpdate({ promoCode: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              If you have a valid promo code, you can sign up for free!
            </p>
          </div>
        )}

        {!hasPromoCode && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>No payment required now!</strong> You can enter payment details after your application is approved.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Your subscription will only be charged after approval.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};

export default VendorSubscriptionStep;
