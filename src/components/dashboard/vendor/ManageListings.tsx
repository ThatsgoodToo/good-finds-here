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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import { useState } from "react";

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [listingType, setListingType] = useState<string>("");

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
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Listing</DialogTitle>
            <DialogDescription>
              Create a new product, service, or content listing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="listing-type">Listing Type *</Label>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger id="listing-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="content">Content/Media</SelectItem>
                </SelectContent>
              </Select>
              {(listingType === "product" || listingType === "service") && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Products and Services require at least one active coupon/offer at all times
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Enter listing title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your listing" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input id="price" placeholder="$0.00" />
              </div>
              <div>
                <Label htmlFor="inventory">Inventory</Label>
                <Input id="inventory" placeholder="Quantity available" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onAddListing();
                setShowAddDialog(false);
              }}>
                Create Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageListings;
