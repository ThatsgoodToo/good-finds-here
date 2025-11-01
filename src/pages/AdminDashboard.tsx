import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Clock, Search, Shield } from "lucide-react";

interface VendorApplication {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  business_type: string | null;
  business_description: string | null;
  city: string | null;
  state_region: string | null;
  profiles: {
    email: string;
    full_name: string | null;
    display_name: string | null;
  } | null;
}

const AdminDashboard = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "pending" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  // Load applications
  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (activeFilter !== "all") {
      filtered = filtered.filter((app) => app.status === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.profiles?.full_name?.toLowerCase().includes(query) ||
          app.profiles?.email?.toLowerCase().includes(query) ||
          app.business_type?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, activeFilter, searchQuery]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select(`
          *,
          profiles (
            email,
            full_name,
            display_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as any) || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (app: VendorApplication, action: "approve" | "reject" | "pending") => {
    setSelectedApp(app);
    setActionType(action);
    setAdminNotes("");
  };

  const confirmAction = async () => {
    if (!selectedApp || !actionType) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-vendor-status", {
        body: {
          application_id: selectedApp.id,
          new_status: actionType,
          admin_notes: adminNotes || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Application ${actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "set to pending"}`);
      
      // Reload applications
      await loadApplications();
      
      // Close dialog
      setSelectedApp(null);
      setActionType(null);
      setAdminNotes("");
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error(error.message || "Failed to update application");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 container mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage vendor applications</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Review</CardDescription>
                <CardTitle className="text-3xl">{pendingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-3xl text-green-600">{approvedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-3xl text-destructive">{rejectedCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Vendor Applications</CardTitle>
                  <CardDescription>Review and manage vendor applications</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
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
                                    variant="ghost"
                                    onClick={() => handleAction(app, "pending")}
                                    title="Set to Pending"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAction(app, "approve")}
                                    className="text-green-600 hover:text-green-700"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAction(app, "reject")}
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
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Action Dialog */}
      <AlertDialog open={!!selectedApp && !!actionType} onOpenChange={() => {
        setSelectedApp(null);
        setActionType(null);
        setAdminNotes("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && "Approve Application"}
              {actionType === "reject" && "Reject Application"}
              {actionType === "pending" && "Set to Pending"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" &&
                `Approve ${selectedApp?.profiles?.full_name || "this vendor"}'s application? This will create their vendor profile and grant access.`}
              {actionType === "reject" &&
                `Reject ${selectedApp?.profiles?.full_name || "this vendor"}'s application? They will be notified via email.`}
              {actionType === "pending" &&
                `Set ${selectedApp?.profiles?.full_name || "this vendor"}'s application back to pending status?`}
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
            <AlertDialogAction onClick={confirmAction} disabled={processing}>
              {processing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
