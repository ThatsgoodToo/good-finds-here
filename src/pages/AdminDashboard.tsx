import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Search } from "lucide-react";
import { useAdminAccessCheck } from "@/hooks/useAdminAccessCheck";
import { useAdminApplications } from "@/hooks/useAdminApplications";
import { useApplicationFilters } from "@/hooks/useApplicationFilters";
import { ApplicationStatsCards } from "@/components/dashboard/admin/ApplicationStatsCards";
import { ApplicationsTable } from "@/components/dashboard/admin/ApplicationsTable";
import { ApplicationDetailsDialog } from "@/components/dashboard/admin/ApplicationDetailsDialog";
import { ApplicationActionDialog } from "@/components/dashboard/admin/ApplicationActionDialog";
import type { VendorApplication } from "@/hooks/useAdminApplications";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Check admin access
  useAdminAccessCheck(user);
  
  // Data and filters
  const { applications, loading, updateApplicationStatus } = useAdminApplications();
  const {
    filteredApplications,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    stats,
  } = useApplicationFilters(applications);
  
  // Action dialog state
  const [actionState, setActionState] = useState<{
    selectedApp: VendorApplication | null;
    actionType: "approve" | "reject" | "pending" | null;
    processing: boolean;
  }>({
    selectedApp: null,
    actionType: null,
    processing: false,
  });
  
  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<{
    app: VendorApplication | null;
    open: boolean;
  }>({
    app: null,
    open: false,
  });
  
  const handleAction = (app: VendorApplication, action: "approve" | "reject" | "pending") => {
    setActionState({
      selectedApp: app,
      actionType: action,
      processing: false,
    });
  };
  
  const confirmAction = async (adminNotes: string) => {
    if (!actionState.selectedApp || !actionState.actionType) return;
    
    setActionState(prev => ({ ...prev, processing: true }));
    
    await updateApplicationStatus(
      actionState.selectedApp.id,
      actionState.actionType,
      adminNotes
    );
    
    setActionState({
      selectedApp: null,
      actionType: null,
      processing: false,
    });
  };
  
  const handleViewDetails = (app: VendorApplication) => {
    setDetailDialog({ app, open: true });
  };
  
  const handleActionFromDetail = (action: "approve" | "reject" | "pending") => {
    if (detailDialog.app) {
      setDetailDialog({ app: null, open: false });
      handleAction(detailDialog.app, action);
    }
  };

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

          <ApplicationStatsCards
            pendingCount={stats.pending}
            approvedCount={stats.approved}
            rejectedCount={stats.rejected}
          />

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
              <ApplicationsTable
                applications={applications}
                filteredApplications={filteredApplications}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onViewDetails={handleViewDetails}
                onAction={handleAction}
                stats={stats}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <ApplicationDetailsDialog
        application={detailDialog.app}
        isOpen={detailDialog.open}
        onClose={() => setDetailDialog({ app: null, open: false })}
        onAction={handleActionFromDetail}
      />

      <ApplicationActionDialog
        application={actionState.selectedApp}
        actionType={actionState.actionType}
        isOpen={!!actionState.selectedApp && !!actionState.actionType}
        processing={actionState.processing}
        onConfirm={confirmAction}
        onCancel={() => setActionState({ selectedApp: null, actionType: null, processing: false })}
      />
    </div>
  );
};

export default AdminDashboard;
