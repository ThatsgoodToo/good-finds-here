import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";

type WelcomeStepProps = {
  onNext: () => void;
};

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <Card>
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl sm:text-4xl">Welcome to That's Good Too!</CardTitle>
        <CardDescription className="text-sm text-primary font-medium">
          Welcome to our Premiere Release. Our community and database will grow as we bring more creators on board!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-lg text-muted-foreground text-center">
          Your one-stop destination to discover local goods, support small-scale makers, and access exclusive offers.
        </p>
        
        <p className="text-muted-foreground text-center">
          Our affordable, subscription-based platform is designed to save you time while providing a clean, distraction-free shopping experience.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Your Own Shop</h3>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Founding Member Free Access</h3>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Exclusive Offers</h3>
          </div>
        </div>
        
        <Button size="lg" onClick={onNext} className="w-full">
          Get Started
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeStep;
