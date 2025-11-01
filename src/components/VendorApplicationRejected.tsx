import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const VendorApplicationRejected = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl pt-20">
      <Card className="border-destructive/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Application Not Approved</CardTitle>
          <CardDescription className="text-base mt-2">
            We're unable to approve your vendor application at this time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">What this means</p>
                <p className="text-sm text-muted-foreground">
                  After reviewing your application, we've determined that it doesn't meet 
                  our current vendor criteria. This decision is final for this application.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Next Steps
            </h3>
            <p className="text-sm text-muted-foreground">
              If you believe there was an error or would like more information about 
              the decision, please reach out to our team. You may also be welcome to 
              reapply in the future.
            </p>
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => window.location.href = "mailto:connect@thatsgoodtoo.shop"}
            >
              Contact Support
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Continue as Shopper</h3>
            <p className="text-sm text-muted-foreground">
              You can still explore That's Good Too as a shopper, discover local vendors, 
              and support independent artists and businesses.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Browse Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default VendorApplicationRejected;
