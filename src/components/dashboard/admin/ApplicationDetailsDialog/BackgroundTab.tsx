import { Label } from "@/components/ui/label";
import { formatArray } from "@/utils/applicationFormatters";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface BackgroundTabProps {
  application: VendorApplication;
}

export const BackgroundTab = ({ application }: BackgroundTabProps) => {
  return (
    <div className="space-y-4">
      {application.craft_development && (
        <div>
          <Label className="text-muted-foreground">Craft Development</Label>
          <p className="font-medium whitespace-pre-wrap">{application.craft_development}</p>
        </div>
      )}
      {application.certifications_awards && (
        <div>
          <Label className="text-muted-foreground">Certifications & Awards</Label>
          <p className="font-medium whitespace-pre-wrap">{application.certifications_awards}</p>
        </div>
      )}
      {application.creativity_style && (
        <div>
          <Label className="text-muted-foreground">Creativity Style</Label>
          <p className="font-medium whitespace-pre-wrap">{application.creativity_style}</p>
        </div>
      )}
      {application.inspiration && (
        <div>
          <Label className="text-muted-foreground">Inspiration</Label>
          <p className="font-medium whitespace-pre-wrap">{application.inspiration}</p>
        </div>
      )}
      {application.brand_uniqueness && (
        <div>
          <Label className="text-muted-foreground">Brand Uniqueness</Label>
          <p className="font-medium whitespace-pre-wrap">{application.brand_uniqueness}</p>
        </div>
      )}
      {application.sustainable_methods && (
        <div>
          <Label className="text-muted-foreground">Sustainable Methods</Label>
          <p className="font-medium">{formatArray(application.sustainable_methods)}</p>
        </div>
      )}
    </div>
  );
};
