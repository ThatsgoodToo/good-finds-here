import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Check, X } from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    case "approved":
      return <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatArray = (arr: string[] | null) => {
  if (!arr || arr.length === 0) return "None specified";
  return arr.join(", ");
};

export const formatBoolean = (value: boolean | null) => {
  if (value === null) return <Badge variant="outline">Not specified</Badge>;
  return value ? (
    <Badge variant="default" className="bg-green-600 gap-1"><Check className="h-3 w-3" />Yes</Badge>
  ) : (
    <Badge variant="secondary" className="gap-1"><X className="h-3 w-3" />No</Badge>
  );
};
