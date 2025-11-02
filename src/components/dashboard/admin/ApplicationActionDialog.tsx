import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface ApplicationActionDialogProps {
  application: VendorApplication | null;
  actionType: "approve" | "reject" | "pending" | null;
  isOpen: boolean;
  processing: boolean;
  onConfirm: (adminNotes: string) => Promise<void>;
  onCancel: () => void;
}

export const ApplicationActionDialog = ({
  application,
  actionType,
  isOpen,
  processing,
  onConfirm,
  onCancel,
}: ApplicationActionDialogProps) => {
  const [adminNotes, setAdminNotes] = useState("");

  const handleConfirm = async () => {
    await onConfirm(adminNotes);
    setAdminNotes("");
  };

  const handleCancel = () => {
    setAdminNotes("");
    onCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === "approve" && "Approve Application"}
            {actionType === "reject" && "Reject Application"}
            {actionType === "pending" && "Set to Pending"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === "approve" &&
              `Approve ${application?.profiles?.full_name || "this vendor"}'s application? This will create their vendor profile and grant access.`}
            {actionType === "reject" &&
              `Reject ${application?.profiles?.full_name || "this vendor"}'s application? They will be notified via email.`}
            {actionType === "pending" &&
              `Set ${application?.profiles?.full_name || "this vendor"}'s application back to pending status?`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {actionType === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
            <Textarea
              id="adminNotes"
              placeholder="Provide feedback or reason for rejection..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be included in the rejection email
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={processing}>
            {processing ? "Processing..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
