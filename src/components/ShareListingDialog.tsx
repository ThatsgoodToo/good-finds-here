import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Share2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const shareSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  couponCode?: string;
}

const ShareListingDialog = ({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  couponCode,
}: ShareListingDialogProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
  });

  const onSubmit = async (data: ShareFormData) => {
    if (!user) {
      toast.error("Please sign in to share listings");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert to shares table
      const { error: insertError } = await supabase
        .from("shares")
        .insert({
          user_id: user.id,
          listing_id: listingId,
          shared_to_email: data.email,
        });

      if (insertError) throw insertError;

      // Send email via send-email function
      const listingUrl = `${window.location.origin}/listing/${listingId}`;
      const couponText = couponCode ? `Use coupon code: <strong>${couponCode}</strong>` : "";
      
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: data.email,
          subject: `Check out this deal: ${listingTitle}`,
          html: `<p>Hey there!</p><p>A friend thought you'd love this deal from ThatsGoodToo:</p><h3>${listingTitle}</h3>${couponText}<p><a href="${listingUrl}" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 16px;">View Deal</a></p>`,
          templateVars: {
            listing_title: listingTitle,
            coupon_code: couponCode || "",
          },
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        throw new Error("Failed to send email");
      }

      toast.success("Deal shared!", {
        description: `${data.email} will receive an email with the details.`,
      });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Share error:", error);
      toast.error("Failed to share", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <DialogTitle>Share this deal</DialogTitle>
          </div>
          <DialogDescription>
            Send "{listingTitle}" to a friend via email
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-email">Friend's Email</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="friend@email.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share Deal
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListingDialog;
