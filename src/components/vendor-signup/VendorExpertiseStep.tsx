import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorSignupData } from "@/pages/VendorSignup";

type VendorExpertiseStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const VendorExpertiseStep = ({ data, onUpdate, onNext, onBack }: VendorExpertiseStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.areaOfExpertise.length === 0 || !data.businessDuration) {
      return;
    }
    onNext();
  };

  const toggleExpertise = (value: string) => {
    const newArray = data.areaOfExpertise.includes(value)
      ? data.areaOfExpertise.filter((item) => item !== value)
      : [...data.areaOfExpertise, value];
    onUpdate({ areaOfExpertise: newArray });
  };

  const expertiseAreas = [
    "Art & Design",
    "Fashion & Accessories",
    "Food & Beverage",
    "Home & Lifestyle",
    "Wellness & Body Care",
    "Tech & Innovation",
    "Education & Experiences",
    "Other",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Expertise</h2>
        <p className="text-muted-foreground">Your skills and experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Area of Expertise *</Label>
          <div className="grid grid-cols-2 gap-2">
            {expertiseAreas.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  checked={data.areaOfExpertise.includes(area)}
                  onCheckedChange={() => toggleExpertise(area)}
                />
                <label className="text-sm cursor-pointer">{area}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDuration">Business Duration *</Label>
          <Select value={data.businessDuration} onValueChange={(value) => onUpdate({ businessDuration: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How long have you been in business?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<1">Less than 1 year</SelectItem>
              <SelectItem value="1-3">1–3 years</SelectItem>
              <SelectItem value="3-5">3–5 years</SelectItem>
              <SelectItem value="5-10">5–10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="craftDevelopment">Craft Development</Label>
          <Select value={data.craftDevelopment} onValueChange={(value) => onUpdate({ craftDevelopment: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How did you develop your craft?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self-taught">Self-taught</SelectItem>
              <SelectItem value="formally-trained">Formally trained</SelectItem>
              <SelectItem value="apprenticeship">Apprenticeship/mentorship</SelectItem>
              <SelectItem value="family-tradition">Family tradition</SelectItem>
              <SelectItem value="still-learning">Still learning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="certificationsAwards">Certifications/Awards (Optional)</Label>
          <Textarea
            id="certificationsAwards"
            placeholder="List any relevant certifications, awards, or recognition..."
            value={data.certificationsAwards}
            onChange={(e) => onUpdate({ certificationsAwards: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={data.areaOfExpertise.length === 0 || !data.businessDuration}
        >
          Next
        </Button>
      </div>
    </form>
  );
};

export default VendorExpertiseStep;
