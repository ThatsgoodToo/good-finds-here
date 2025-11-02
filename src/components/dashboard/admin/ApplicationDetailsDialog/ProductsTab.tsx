import { Label } from "@/components/ui/label";
import { formatArray } from "@/utils/applicationFormatters";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface ProductsTabProps {
  application: VendorApplication;
}

export const ProductsTab = ({ application }: ProductsTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-muted-foreground">Products & Services</Label>
        <p className="font-medium">{formatArray(application.products_services)}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Inventory Type</Label>
        <p className="font-medium">{formatArray(application.inventory_type)}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Shipping Options</Label>
        <p className="font-medium">{formatArray(application.shipping_options)}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Area of Expertise</Label>
        <p className="font-medium">{formatArray(application.area_of_expertise)}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Pricing Style</Label>
        <p className="font-medium">{application.pricing_style || "N/A"}</p>
      </div>
      {application.exclusive_offers && (
        <div>
          <Label className="text-muted-foreground">Exclusive Offers</Label>
          <p className="font-medium whitespace-pre-wrap">{application.exclusive_offers}</p>
        </div>
      )}
    </div>
  );
};
