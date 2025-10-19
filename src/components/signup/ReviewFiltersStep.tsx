import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type ReviewFiltersStepProps = {
  interests: string[];
  onUpdate: (interests: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

const ReviewFiltersStep = ({ interests, onUpdate, onNext, onBack }: ReviewFiltersStepProps) => {
  const handleRemoveInterest = (interest: string) => {
    onUpdate(interests.filter((i) => i !== interest));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Review Your Interests</h2>
        <p className="text-muted-foreground">Make sure everything looks good</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Your Interests ({interests.length})</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="gap-1 text-sm">
                {interest}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveInterest(interest)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
        <Button onClick={onNext}>
          Looks Good!
        </Button>
      </div>
    </div>
  );
};

export default ReviewFiltersStep;
