import { Label } from "@/components/ui/label";
import { formatBoolean } from "@/utils/applicationFormatters";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface AgreementsSectionProps {
  application: VendorApplication;
}

export const AgreementsSection = ({ application }: AgreementsSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Agreements & Verification</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">Information Accurate</Label>
          {formatBoolean(application.info_accurate)}
        </div>
        <div>
          <Label className="text-muted-foreground">Understands Review Process</Label>
          {formatBoolean(application.understands_review)}
        </div>
        <div>
          <Label className="text-muted-foreground">Agrees to Terms</Label>
          {formatBoolean(application.agrees_to_terms)}
        </div>
        <div>
          <Label className="text-muted-foreground">Receive Updates</Label>
          {formatBoolean(application.receive_updates)}
        </div>
        <div>
          <Label className="text-muted-foreground">Payment Method Saved</Label>
          {formatBoolean(application.payment_method_saved)}
        </div>
      </div>
    </div>
  );
};
