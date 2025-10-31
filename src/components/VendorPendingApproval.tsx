import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VendorPendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Application Under Review</CardTitle>
          <CardDescription className="text-base mt-2">
            Your vendor application is currently being reviewed by our team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  What happens next?
                </p>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• A real person will review your application personally</li>
                  <li>• Review typically takes up to 5 business days</li>
                  <li>• You'll receive an email once a decision is made</li>
                  <li>• If approved, you'll gain full access to vendor tools</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              While You Wait
            </h3>
            <p className="text-sm text-muted-foreground">
              You can still browse That's Good Too as a shopper, discover amazing vendors, 
              and save items to your favorites. Once approved, you'll be able to create 
              listings and manage your vendor profile.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              If you have questions about your application or the vendor program, 
              feel free to reach out to our support team.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "mailto:connect@thatsgoodtoo.shop"}
            >
              Contact Support
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Browse as Shopper
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPendingApproval;
