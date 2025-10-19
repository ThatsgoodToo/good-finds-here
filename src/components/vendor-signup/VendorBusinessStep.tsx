import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorSignupData } from "@/pages/VendorSignup";

type VendorBusinessStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const VendorBusinessStep = ({ data, onUpdate, onNext, onBack }: VendorBusinessStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.businessDescription || data.productsServices.length === 0) {
      return;
    }
    onNext();
  };

  const toggleCheckbox = (field: keyof VendorSignupData, value: string) => {
    const currentArray = data[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    onUpdate({ [field]: newArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">About Your Business</h2>
        <p className="text-muted-foreground">Tell us what you do</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Brief Description of Business *</Label>
          <Textarea
            id="businessDescription"
            placeholder="Describe your business, what you create, and what makes you unique..."
            value={data.businessDescription}
            onChange={(e) => onUpdate({ businessDescription: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Products or Services Offered *</Label>
          <div className="space-y-2">
            {["Designed, made, grown, or collected", "Services offered", "An Experience"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={data.productsServices.includes(option)}
                  onCheckedChange={() => toggleCheckbox("productsServices", option)}
                />
                <label className="text-sm cursor-pointer">{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Inventory Type</Label>
          <div className="space-y-2">
            {["Regular", "Overstocked", "Odd Balls / One-Offs / Misfits", "Viewer-based", "Other"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={data.inventoryType.includes(option)}
                  onCheckedChange={() => toggleCheckbox("inventoryType", option)}
                />
                <label className="text-sm cursor-pointer">{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Shipping Options</Label>
          <div className="space-y-2">
            {["Shipping", "Pick Up", "In Person", "Virtual", "Other"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={data.shippingOptions.includes(option)}
                  onCheckedChange={() => toggleCheckbox("shippingOptions", option)}
                />
                <label className="text-sm cursor-pointer">{option}</label>
              </div>
            ))}
          </div>
        </div>

        {data.shippingOptions.includes("Pick Up") && (
          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pick Up Address</Label>
            <Input
              id="pickupAddress"
              placeholder="123 Main St, City, State ZIP"
              value={data.pickupAddress}
              onChange={(e) => onUpdate({ pickupAddress: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!data.businessDescription || data.productsServices.length === 0}
        >
          Next
        </Button>
      </div>
    </form>
  );
};

export default VendorBusinessStep;
