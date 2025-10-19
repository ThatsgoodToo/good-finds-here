import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type FilterInputStepProps = {
  interests: string[];
  onUpdate: (interests: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

const FilterInputStep = ({ interests, onUpdate, onNext, onBack }: FilterInputStepProps) => {
  const [currentInput, setCurrentInput] = useState("");

  const handleAddInterest = () => {
    const trimmed = currentInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      onUpdate([...interests, trimmed]);
      setCurrentInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleRemoveInterest = (interest: string) => {
    onUpdate(interests.filter((i) => i !== interest));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">What are you into?</h2>
        <p className="text-muted-foreground">Add interests to personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="interest">Add interests (press Enter or click Add)</Label>
          <div className="flex gap-2">
            <Input
              id="interest"
              type="text"
              placeholder="e.g., handmade jewelry, local coffee"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" onClick={handleAddInterest} variant="secondary">
              Add
            </Button>
          </div>
        </div>

        {interests.length > 0 && (
          <div className="space-y-2">
            <Label>Your interests</Label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={interests.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default FilterInputStep;
