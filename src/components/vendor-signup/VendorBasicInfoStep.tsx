import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorSignupData } from "@/pages/VendorSignup";
import { Plus, X } from "lucide-react";

type VendorBasicInfoStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
};

const VendorBasicInfoStep = ({ data, onUpdate, onNext }: VendorBasicInfoStepProps) => {
  const [newSocialLink, setNewSocialLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.website || !data.city || !data.stateRegion || !data.country || !data.businessType) {
      return;
    }
    onNext();
  };

  const addSocialLink = () => {
    if (newSocialLink.trim()) {
      onUpdate({ socialMediaLinks: [...data.socialMediaLinks, newSocialLink.trim()] });
      setNewSocialLink("");
    }
  };

  const removeSocialLink = (index: number) => {
    onUpdate({
      socialMediaLinks: data.socialMediaLinks.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Basic Info</h2>
        <p className="text-muted-foreground">Where can we find you?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website / Store URL *</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.website}
            onChange={(e) => onUpdate({ website: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media Links</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add Instagram, Facebook, etc."
              value={newSocialLink}
              onChange={(e) => setNewSocialLink(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSocialLink())}
            />
            <Button type="button" onClick={addSocialLink} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.socialMediaLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                {link}
                <button type="button" onClick={() => removeSocialLink(idx)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={data.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stateRegion">State/Region *</Label>
            <Input
              id="stateRegion"
              placeholder="California"
              value={data.stateRegion}
              onChange={(e) => onUpdate({ stateRegion: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              placeholder="USA"
              value={data.country}
              onChange={(e) => onUpdate({ country: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phoneNumber}
            onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type *</Label>
          <Select value={data.businessType} onValueChange={(value) => onUpdate({ businessType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independent">Independent artist / maker</SelectItem>
              <SelectItem value="nonprofit">Nonprofit / mission-driven</SelectItem>
              <SelectItem value="family">Family Owned</SelectItem>
              <SelectItem value="collaborative">Collaborative</SelectItem>
              <SelectItem value="diverse">Diverse-owned</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(data.businessType === "diverse" || data.businessType === "other") && (
          <div className="space-y-2">
            <Label htmlFor="businessTypeOther">Please Specify</Label>
            <Input
              id="businessTypeOther"
              placeholder="Specify..."
              value={data.businessTypeOther}
              onChange={(e) => onUpdate({ businessTypeOther: e.target.value })}
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!data.website || !data.city || !data.stateRegion || !data.country || !data.businessType}
      >
        Next
      </Button>
    </form>
  );
};

export default VendorBasicInfoStep;
