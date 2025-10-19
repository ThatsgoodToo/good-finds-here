import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorSignupData } from "@/pages/VendorSignup";

type VendorPricingStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const VendorPricingStep = ({ data, onUpdate, onNext, onBack }: VendorPricingStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.pricingStyle || !data.exclusiveOffers || !data.promotionSocialChannels || !data.futureWebsite) {
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Pricing & Accessibility</h2>
        <p className="text-muted-foreground">Help shoppers find the right fit</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pricingStyle">Pricing Style *</Label>
          <Select value={data.pricingStyle} onValueChange={(value) => onUpdate({ pricingStyle: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select pricing style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget-friendly">Budget-friendly</SelectItem>
              <SelectItem value="accessible">Accessible</SelectItem>
              <SelectItem value="cost-effective">Cost-effective</SelectItem>
              <SelectItem value="high-end">High-end/Designer</SelectItem>
              <SelectItem value="no-set-budget">No set budget</SelectItem>
              <SelectItem value="viewership-based">Viewership-based</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclusiveOffers">Exclusive Offers *</Label>
          <Select value={data.exclusiveOffers} onValueChange={(value) => onUpdate({ exclusiveOffers: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Will you offer exclusive discounts?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absolutely">Absolutely (free shipping, 15%+ discount, BOGO, exclusive access)</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="nope">Nope</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Required for products/services; optional for content listings
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotionSocialChannels">Promotion on TGT Social Channels *</Label>
          <Select
            value={data.promotionSocialChannels}
            onValueChange={(value) => onUpdate({ promotionSocialChannels: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Would you like to be featured on our social media?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="no">No thanks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="futureWebsite">Future Website *</Label>
          <Select value={data.futureWebsite} onValueChange={(value) => onUpdate({ futureWebsite: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Do you plan to have a website?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="already-have">Already have one</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!data.pricingStyle || !data.exclusiveOffers || !data.promotionSocialChannels || !data.futureWebsite}
        >
          Next
        </Button>
      </div>
    </form>
  );
};

export default VendorPricingStep;
