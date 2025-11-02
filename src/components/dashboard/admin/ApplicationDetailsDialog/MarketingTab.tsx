import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface MarketingTabProps {
  application: VendorApplication;
}

export const MarketingTab = ({ application }: MarketingTabProps) => {
  return (
    <div className="space-y-4">
      {application.social_media_links && application.social_media_links.length > 0 && (
        <div>
          <Label className="text-muted-foreground">Social Media Links</Label>
          <div className="space-y-1">
            {application.social_media_links.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline inline-flex items-center gap-1 block"
              >
                {link}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}
      {application.promotion_social_channels && (
        <div>
          <Label className="text-muted-foreground">Promotion & Social Channels</Label>
          <p className="font-medium whitespace-pre-wrap">{application.promotion_social_channels}</p>
        </div>
      )}
      {application.future_website && (
        <div>
          <Label className="text-muted-foreground">Future Website Plans</Label>
          <p className="font-medium whitespace-pre-wrap">{application.future_website}</p>
        </div>
      )}
      <div>
        <Label className="text-muted-foreground">Subscription Type</Label>
        <p className="font-medium">{application.subscription_type || "N/A"}</p>
      </div>
      {application.promo_code && (
        <div>
          <Label className="text-muted-foreground">Promo Code</Label>
          <p className="font-medium">{application.promo_code}</p>
        </div>
      )}
    </div>
  );
};
