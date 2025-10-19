import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type VendorThankYouStepProps = {
  onClose: () => void;
};

const VendorThankYouStep = ({ onClose }: VendorThankYouStepProps) => {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Thank You for Applying! ✨</h2>
        <p className="text-lg">We've received your application and are excited to learn more about you!</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
        <p>
          At TGT, we keep things authentic — every application is reviewed by a real person, not an automated system.
        </p>
        <p>
          <strong>Please allow up to 5 business days for review.</strong>
        </p>
        <p>
          If approved, you'll receive a confirmation email with next steps to set up your vendor profile.
        </p>
        <p className="text-sm">
          Thank you for helping us support small-scale makers, independent artists, and authentic experiences!
        </p>
      </div>

      <div className="pt-6">
        <Button onClick={onClose} size="lg">
          Return to Home
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Check your email inbox (and spam folder) for updates on your application status.
      </p>
    </div>
  );
};

export default VendorThankYouStep;
