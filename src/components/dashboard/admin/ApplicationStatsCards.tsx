import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationStatsCardsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export const ApplicationStatsCards = ({
  pendingCount,
  approvedCount,
  rejectedCount,
}: ApplicationStatsCardsProps) => {
  return (
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
  );
};
