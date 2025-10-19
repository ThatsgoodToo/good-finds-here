import React from "react";
import { Button } from "@/components/ui/button";

type WelcomeStepProps = {
  onNext: () => void;
};

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to That's Good Too!</h1>
      <p className="text-lg text-muted-foreground">
        Discover unique goods from local vendors and small businesses.
      </p>
      <p className="text-muted-foreground">
        Sounds good?
      </p>
      <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
