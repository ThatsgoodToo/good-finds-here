import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { getStatusBadge } from "@/utils/applicationFormatters";
import type { VendorApplication } from "@/hooks/useAdminApplications";

interface ApplicationsTableProps {
  applications: VendorApplication[];
  filteredApplications: VendorApplication[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onViewDetails: (app: VendorApplication) => void;
  onAction: (app: VendorApplication, action: "approve" | "reject" | "pending") => void;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const ApplicationsTable = ({
  applications,
  filteredApplications,
  activeFilter,
  onFilterChange,
  onViewDetails,
  onAction,
  stats,
}: ApplicationsTableProps) => {
  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
      </TabsList>

      <TabsContent value={activeFilter} className="mt-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.profiles?.full_name || app.profiles?.display_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.profiles?.email || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.business_type || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.city && app.state_region
                        ? `${app.city}, ${app.state_region}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails(app)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction(app, "pending")}
                          title="Set to Pending"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction(app, "approve")}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction(app, "reject")}
                          className="text-destructive hover:text-destructive"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};
