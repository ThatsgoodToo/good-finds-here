import { Card, CardContent } from "@/components/ui/card";
import { MousePointer, DollarSign, Tag, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsRowProps {
  clicks: number;
  sales: number;
  activeOffers: number;
  followers: number;
  onMetricClick: (metric: string) => void;
}

const MetricsRow = ({ clicks, sales, activeOffers, followers, onMetricClick }: MetricsRowProps) => {
  const metrics = [
    {
      label: "CLICKS",
      value: clicks,
      icon: MousePointer,
      description: "Vendor site clicks via TGT",
      key: "clicks",
    },
    {
      label: "SALES",
      value: sales,
      icon: DollarSign,
      description: "Via referral codes",
      key: "sales",
    },
    {
      label: "ACTIVE OFFERS",
      value: activeOffers,
      icon: Tag,
      description: "Active coupons on listings",
      key: "offers",
    },
    {
      label: "YOUR HI FIVES",
      value: followers,
      icon: Hand,
      description: "Followers",
      key: "followers",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card
          key={metric.key}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onMetricClick(metric.key)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsRow;
