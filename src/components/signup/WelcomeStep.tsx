import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Gift, Sparkles } from "lucide-react";

type WelcomeStepProps = {
  onNext: () => void;
};

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to That's Good Too!</h1>
      
      <p className="text-sm text-primary font-medium">
        Welcome to our Premiere Release — our community and database will grow as we bring more creators on board!
      </p>
      
      <p className="text-lg text-muted-foreground">
        Your one-stop destination to discover local goods, support small-scale makers, and access exclusive offers.
      </p>
      
      <p className="text-muted-foreground">
        Our affordable, subscription-based platform is designed to save you time while providing a clean, distraction-free shopping experience.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-2">
            <Store className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Your Own Shop</h3>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-2">
            <Sparkles className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Founding Member Free Access</h3>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-2">
            <Gift className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Exclusive Offers</h3>
          </CardContent>
        </Card>
      </div>
      
      <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
