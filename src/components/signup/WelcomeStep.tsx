import { Button } from "@/components/ui/button";

type WelcomeStepProps = {
  onNext: () => void;
};

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to That's Good Too!</h1>
      <p className="text-lg text-muted-foreground">
        Your one-stop destination to discover local goods, support small-scale makers, and access exclusive offers.
      </p>
      <p className="text-muted-foreground">
        Our affordable, subscription-based platform is designed to save you time while providing a clean, distraction-free shopping experience.
      </p>
      <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
