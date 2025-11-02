import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { getStatusBadge } from "@/utils/applicationFormatters";
import { ApplicantInfoSection } from "./ApplicationDetailsDialog/ApplicantInfoSection";
import { BusinessDetailsTab } from "./ApplicationDetailsDialog/BusinessDetailsTab";
import { ProductsTab } from "./ApplicationDetailsDialog/ProductsTab";
import { BackgroundTab } from "./ApplicationDetailsDialog/BackgroundTab";
import { MarketingTab } from "./ApplicationDetailsDialog/MarketingTab";
import { AgreementsSection } from "./ApplicationDetailsDialog/AgreementsSection";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface ApplicationDetailsDialogProps {
  application: VendorApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: "approve" | "reject" | "pending") => void;
}

export const ApplicationDetailsDialog = ({
  application,
  isOpen,
  onClose,
  onAction,
}: ApplicationDetailsDialogProps) => {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Vendor Application Details</span>
            {getStatusBadge(application.status)}
          </DialogTitle>
          <DialogDescription>
            Review complete application information for {application.profiles?.full_name || "this vendor"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <ApplicantInfoSection application={application} />

            <Separator />

            <Tabs defaultValue="business" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-4 mt-4">
                <BusinessDetailsTab application={application} />
              </TabsContent>

              <TabsContent value="products" className="space-y-4 mt-4">
                <ProductsTab application={application} />
              </TabsContent>

              <TabsContent value="background" className="space-y-4 mt-4">
                <BackgroundTab application={application} />
              </TabsContent>

              <TabsContent value="marketing" className="space-y-4 mt-4">
                <MarketingTab application={application} />
              </TabsContent>
            </Tabs>

            <Separator />

            <AgreementsSection application={application} />

            {application.additional_info && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Additional Information</Label>
                  <p className="font-medium whitespace-pre-wrap mt-2">{application.additional_info}</p>
                </div>
              </>
            )}

            {application.admin_notes && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="font-medium whitespace-pre-wrap mt-2 text-destructive">
                    {application.admin_notes}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onAction("pending")}
              disabled={application.status === "pending"}
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Pending
            </Button>
            <Button
              variant="outline"
              className="text-green-600 hover:text-green-700 border-green-600"
              onClick={() => onAction("approve")}
              disabled={application.status === "approved"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => onAction("reject")}
              disabled={application.status === "rejected"}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
