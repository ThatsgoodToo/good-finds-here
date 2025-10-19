import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorSignupData } from "@/pages/VendorSignup";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type VendorConfirmationStepProps = {
  data: VendorSignupData;
  onUpdate: (data: Partial<VendorSignupData>) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
};

const VendorConfirmationStep = ({ data, onUpdate, onFinish, onBack, loading }: VendorConfirmationStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.infoAccurate || !data.understandsReview || !data.agreesToTerms) {
      return;
    }
    onFinish();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Confirmation</h2>
        <p className="text-muted-foreground">Review and agree to terms</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Anything else you'd like to add? (Optional)</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Share any additional information about your business..."
            value={data.additionalInfo}
            onChange={(e) => onUpdate({ additionalInfo: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="infoAccurate"
              checked={data.infoAccurate}
              onCheckedChange={(checked) => onUpdate({ infoAccurate: checked as boolean })}
              required
            />
            <Label htmlFor="infoAccurate" className="font-normal cursor-pointer">
              I confirm the information provided is accurate *
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="understandsReview"
              checked={data.understandsReview}
              onCheckedChange={(checked) => onUpdate({ understandsReview: checked as boolean })}
              required
            />
            <Label htmlFor="understandsReview" className="font-normal cursor-pointer">
              I understand TGT reviews applications and approval is at your discretion *
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreesToTerms"
              checked={data.agreesToTerms}
              onCheckedChange={(checked) => onUpdate({ agreesToTerms: checked as boolean })}
              required
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="agreesToTerms" className="font-normal cursor-pointer">
                I agree to TGT Vendor Guidelines & Terms of Use *
              </Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="link" className="h-auto p-0 text-xs">
                    Read Vendor Guidelines
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>TGT Vendor Guidelines & Terms of Use</DialogTitle>
                    <DialogDescription>Please read carefully before agreeing</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4 text-sm">
                      <p>• TGT is a promotional platform; all transactions occur outside TGT.</p>
                      <p>• Vendors must be legal owners of their business/content.</p>
                      <p>• Product/service listings require at least one active exclusive offer. Content-based listings are optional.</p>
                      <p>• Vendors consent to tracking clicks, referrals, coupon use, and visits from TGT to checkout sites.</p>
                      <p>• Vendors retain content ownership but grant TGT a non-exclusive license to promote it.</p>
                      <p>• <strong>Prohibited:</strong> alcohol, tobacco, age-restricted items.</p>
                      <p>• Vendors must keep listings accurate, follow laws, and respect community guidelines.</p>
                      <p>• TGT is not liable for sales, transactions, or disputes.</p>
                      <p>• TGT may remove listings or terminate accounts at its discretion.</p>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="receiveUpdates"
              checked={data.receiveUpdates}
              onCheckedChange={(checked) => onUpdate({ receiveUpdates: checked as boolean })}
            />
            <Label htmlFor="receiveUpdates" className="font-normal cursor-pointer">
              I'd like to receive updates, tips, and promotional opportunities
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!data.infoAccurate || !data.understandsReview || !data.agreesToTerms || loading}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};

export default VendorConfirmationStep;
