import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  type: "product" | "service" | "content";
  price: string;
  inventory: string;
  activeOffer: boolean;
  offerDetails?: string;
  couponClaims?: number;
  status: "active" | "paused" | "warning";
}

interface ManageListingsProps {
  listings: Listing[];
  onAddListing: () => void;
  onEditListing: (id: string) => void;
}

const ManageListings = ({ listings, onAddListing, onEditListing }: ManageListingsProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (listing: Listing) => {
    if (listing.status === "warning") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Add Offer
        </Badge>
      );
    }
    if (listing.status === "paused") {
      return <Badge variant="secondary">Paused</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Listings</CardTitle>
              <CardDescription>Your products, services, and content</CardDescription>
            </div>
            <Button onClick={() => navigate("/vendor/listing/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Listing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Active Offer</TableHead>
                <TableHead>Claims</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell className="capitalize">{listing.type}</TableCell>
                  <TableCell>{listing.price}</TableCell>
                  <TableCell>{listing.inventory}</TableCell>
                  <TableCell>
                    {listing.activeOffer ? (
                      <span className="text-sm">{listing.offerDetails}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{listing.couponClaims || "—"}</TableCell>
                  <TableCell>{getStatusBadge(listing)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditListing(listing.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default ManageListings;
