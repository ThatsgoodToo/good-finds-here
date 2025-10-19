import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

interface Visitor {
  id: string;
  name: string;
  image: string;
  lastVisit: string;
  itemsViewed: number;
}

interface RecentVisitorsProps {
  visitors: Visitor[];
  onSendOffer: (visitorId: string) => void;
  offersRemaining: number;
}

const RecentVisitors = ({ visitors, onSendOffer, offersRemaining }: RecentVisitorsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Visitors</CardTitle>
            <CardDescription>Shoppers who visited your listings</CardDescription>
          </div>
          <Badge variant="secondary">{offersRemaining}/20 offers remaining this month</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={visitor.image} />
                  <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{visitor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {visitor.itemsViewed} items • {visitor.lastVisit}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => onSendOffer(visitor.id)}
                disabled={offersRemaining === 0}
              >
                <Send className="h-4 w-4" />
                Send Offer
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentVisitors;
