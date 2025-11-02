import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface BusinessDetailsTabProps {
  application: VendorApplication;
}

export const BusinessDetailsTab = ({ application }: BusinessDetailsTabProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-muted-foreground">Business Type</Label>
        <p className="font-medium">
          {application.business_type || "N/A"}
          {application.business_type_other && ` (${application.business_type_other})`}
        </p>
      </div>
      <div>
        <Label className="text-muted-foreground">Business Description</Label>
        <p className="font-medium whitespace-pre-wrap">
          {application.business_description || "No description provided"}
        </p>
      </div>
      <div>
        <Label className="text-muted-foreground">Website</Label>
        {application.website ? (
          <a
            href={application.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {application.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="font-medium">No website</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">City</Label>
          <p className="font-medium">{application.city || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">State/Region</Label>
          <p className="font-medium">{application.state_region || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Country</Label>
          <p className="font-medium">{application.country || "N/A"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Business Duration</Label>
          <p className="font-medium">{application.business_duration || "N/A"}</p>
        </div>
      </div>
      {application.pickup_address && (
        <div>
          <Label className="text-muted-foreground">Pickup Address</Label>
          <p className="font-medium">{application.pickup_address}</p>
        </div>
      )}
    </div>
  );
};
