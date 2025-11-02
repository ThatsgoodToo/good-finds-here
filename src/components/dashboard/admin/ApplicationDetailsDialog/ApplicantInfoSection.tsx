import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/applicationFormatters";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface ApplicantInfoSectionProps {
  application: VendorApplication;
}

export const ApplicantInfoSection = ({ application }: ApplicantInfoSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Applicant Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-muted-foreground">Full Name</Label>
          <p className="font-medium">{application.profiles?.full_name || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Display Name</Label>
          <p className="font-medium">{application.profiles?.display_name || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Email</Label>
          <p className="font-medium">{application.profiles?.email || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Phone</Label>
          <p className="font-medium">{application.phone_number || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Submitted</Label>
          <p className="font-medium">{formatDate(application.created_at)}</p>
        </div>
        {application.reviewed_at && (
          <div>
            <Label className="text-muted-foreground">Reviewed</Label>
            <p className="font-medium">{formatDate(application.reviewed_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
