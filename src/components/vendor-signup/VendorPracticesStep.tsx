import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorSignupData } from "@/pages/VendorSignup";

type VendorPracticesStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const VendorPracticesStep = ({ data, onUpdate, onNext, onBack }: VendorPracticesStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const toggleMethod = (value: string) => {
    const newArray = data.sustainableMethods.includes(value)
      ? data.sustainableMethods.filter((item) => item !== value)
      : [...data.sustainableMethods, value];
    onUpdate({ sustainableMethods: newArray });
  };

  const methods = [
    { emoji: "♻️", label: "Upcycled / recycled materials" },
    { emoji: "🌿", label: "Eco-friendly" },
    { emoji: "🧵", label: "Handcrafted / small-batch" },
    { emoji: "🏠", label: "Locally made" },
    { emoji: "🚜", label: "Locally sourced" },
    { emoji: "🔋", label: "Low-waste / zero-waste" },
    { emoji: "🌞", label: "Ethical labor" },
    { emoji: "💧", label: "Energy-conscious" },
    { emoji: "🌎", label: "Community-based" },
    { emoji: "🪴", label: "Regenerative / circular" },
    { emoji: "🧡", label: "Social impact" },
    { emoji: "🪡", label: "Made-to-order" },
    { emoji: "", label: "Other" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Practices & Creativity</h2>
        <p className="text-muted-foreground">What makes your work special?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="creativityStyle">Creativity Style/Level</Label>
          <Select value={data.creativityStyle} onValueChange={(value) => onUpdate({ creativityStyle: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How would you describe your creative approach?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventive">🎨 Inventive</SelectItem>
              <SelectItem value="refined">🌿 Refined</SelectItem>
              <SelectItem value="resourceful">🔄 Resourceful</SelectItem>
              <SelectItem value="expressive">✨ Expressive</SelectItem>
              <SelectItem value="practical">⚙️ Practical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspiration">Inspiration (Optional)</Label>
          <Textarea
            id="inspiration"
            placeholder="What inspires your work?"
            value={data.inspiration}
            onChange={(e) => onUpdate({ inspiration: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandUniqueness">Brand Uniqueness (Optional)</Label>
          <Textarea
            id="brandUniqueness"
            placeholder="What makes your brand unique?"
            value={data.brandUniqueness}
            onChange={(e) => onUpdate({ brandUniqueness: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Sustainable / Local / Small-Scale Methods</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {methods.map(({ emoji, label }) => (
              <div key={label} className="flex items-center space-x-2">
                <Checkbox
                  checked={data.sustainableMethods.includes(label)}
                  onCheckedChange={() => toggleMethod(label)}
                />
                <label className="text-sm cursor-pointer">
                  {emoji} {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default VendorPracticesStep;
