import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignupData } from "@/pages/ShopperSignup";

type TermsStepProps = {
  data: SignupData;
  onUpdate: (data: Partial<SignupData>) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
};

const TermsStep = ({ data, onUpdate, onFinish, onBack, loading }: TermsStepProps) => {
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.termsAccepted) {
      onFinish();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Terms & Agreements</h2>
          <p className="text-muted-foreground">Just one more step!</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={data.termsAccepted}
              onCheckedChange={(checked) => onUpdate({ termsAccepted: checked as boolean })}
              required
            />
            <Label htmlFor="terms" className="font-normal cursor-pointer leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsDialog(true)}
                className="text-primary underline"
              >
                TGT Shopper Guidelines & Terms of Use
              </button>
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="analytics"
              checked={data.analyticsConsent}
              onCheckedChange={(checked) => onUpdate({ analyticsConsent: checked as boolean })}
            />
            <Label htmlFor="analytics" className="font-normal cursor-pointer leading-relaxed">
              I consent to tracking and analytics to improve my experience
            </Label>
          </div>
        </div>

        <div className="flex gap-3 justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button type="submit" disabled={!data.termsAccepted || loading}>
            {loading ? "Creating Account..." : "Finish & Go to Dashboard"}
          </Button>
        </div>
      </form>

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>TGT Shopper Guidelines & Terms of Use</DialogTitle>
            <DialogDescription>
              Please read these terms carefully before agreeing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Platform Purpose</h3>
              <p className="text-muted-foreground">
                TGT is a discovery and promotional platform. We do not process payments or handle sales. 
                All purchases happen directly on the vendor's site or third-party platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Shopper Eligibility</h3>
              <p className="text-muted-foreground">
                You must provide accurate and truthful information when signing up.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Tracking & Analytics</h3>
              <p className="text-muted-foreground">
                By using TGT, you consent to tracking clicks, visits, and referrals to vendor sites. 
                This helps us improve the platform and your experience.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Content & Interaction</h3>
              <p className="text-muted-foreground">
                Respect the TGT community and vendors. Do not post spam, inappropriate content, or 
                solicit illegal items.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Prohibited Items</h3>
              <p className="text-muted-foreground">
                TGT does not allow promotion or purchase of alcohol, tobacco, or age-restricted products.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Liability</h3>
              <p className="text-muted-foreground">
                TGT is not responsible for any purchases, transactions, or disputes. You are responsible 
                for your interactions and purchases with vendors.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Updates & Changes</h3>
              <p className="text-muted-foreground">
                TGT may update terms or suspend accounts at our discretion. Major changes will be communicated.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TermsStep;
