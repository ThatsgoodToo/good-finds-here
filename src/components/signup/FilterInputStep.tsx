import { useState, useMemo } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type FilterInputStepProps = {
  interests: string[];
  onUpdate: (interests: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

// Popular interest suggestions
const POPULAR_INTERESTS = [
  "Whole Food",
  "Healthy Snacks",
  "Investments",
  "Community Programs",
  "Handmade Crafts",
  "Local Coffee",
  "Sustainable Goods",
  "Artisan Products",
  "Wellness & Self-Care",
  "Educational Services",
];

// Smart suggestions based on keywords
const KEYWORD_SUGGESTIONS: Record<string, string[]> = {
  food: ["Whole Food", "Healthy Snacks", "Organic Produce", "Local Farms"],
  health: ["Wellness & Self-Care", "Healthy Snacks", "Fitness", "Natural Products"],
  art: ["Handmade Crafts", "Artisan Products", "Local Art", "Creative Workshops"],
  coffee: ["Local Coffee", "Coffee Roasters", "Artisan Tea", "Specialty Drinks"],
  invest: ["Investments", "Financial Planning", "Real Estate", "Stock Market"],
  community: ["Community Programs", "Local Events", "Volunteer Opportunities", "Neighborhood Groups"],
  sustain: ["Sustainable Goods", "Eco-Friendly", "Zero Waste", "Green Living"],
  craft: ["Handmade Crafts", "DIY Supplies", "Craft Workshops", "Artisan Tools"],
};

const FilterInputStep = ({ interests, onUpdate, onNext, onBack }: FilterInputStepProps) => {
  const [currentInput, setCurrentInput] = useState("");

  // Get smart suggestions based on current input
  const smartSuggestions = useMemo(() => {
    if (!currentInput || currentInput.length < 2) return [];
    
    const inputLower = currentInput.toLowerCase();
    const suggestions: string[] = [];
    
    Object.entries(KEYWORD_SUGGESTIONS).forEach(([keyword, values]) => {
      if (inputLower.includes(keyword)) {
        suggestions.push(...values);
      }
    });
    
    // Remove duplicates and already added interests
    return [...new Set(suggestions)].filter(s => !interests.includes(s)).slice(0, 4);
  }, [currentInput, interests]);

  const handleAddInterest = (interest?: string) => {
    const toAdd = interest || currentInput.trim();
    if (toAdd && !interests.includes(toAdd)) {
      onUpdate([...interests, toAdd]);
      if (!interest) setCurrentInput(""); // Only clear input if manually typed
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
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">What are you into?</CardTitle>
        <CardDescription>
          Tell us what you're interested in to help us personalize your experience.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type an interest and press Enter"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={() => handleAddInterest()} disabled={!currentInput.trim()}>
              Add
            </Button>
          </div>

          {/* Smart Suggestions based on input */}
          {smartSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Related Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {smartSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleAddInterest(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Interests - Always visible when no smart suggestions */}
          {smartSuggestions.length === 0 && interests.length === 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Popular Interests:</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    onClick={() => handleAddInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Added Interests */}
        {interests.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Your Interests:</div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="default" className="gap-1 pl-3 pr-1">
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
            onClick={onNext}
            disabled={interests.length === 0}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default FilterInputStep;
