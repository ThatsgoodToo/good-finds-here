import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedItemsWithDetails, SavedItemWithDetails } from "@/hooks/useSaves";
import Header from "@/components/Header";
import SavedListingCard from "@/components/SavedListingCard";
import SavedVendorCard from "@/components/SavedVendorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Hand, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FolderGroup {
  folderId: string | null;
  folderName: string;
  folderDescription: string | null;
  items: SavedItemWithDetails[];
}

const SavedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedItems, isLoading, deleteSave, isDeleting } = useSavedItemsWithDetails();
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Group items by folder
  const folderGroups: FolderGroup[] = savedItems.reduce((acc: FolderGroup[], item) => {
    const folderId = item.folder_id || 'unsorted';
    let group = acc.find(g => (g.folderId || 'unsorted') === folderId);
    
    if (!group) {
      group = {
        folderId: item.folder_id,
        folderName: item.folder_name || 'Unsorted',
        folderDescription: item.folder_description,
        items: []
      };
      acc.push(group);
    }
    
    group.items.push(item);
    return acc;
  }, []);

  // Sort folders: put "Unsorted" last
  folderGroups.sort((a, b) => {
    if (a.folderId === null) return 1;
    if (b.folderId === null) return -1;
    return 0;
  });

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Saved Items</h1>
            <p className="text-muted-foreground">
              All your hi-fived deals and vendors, organized by folders
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(j => (
                        <Skeleton key={j} className="h-64 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Hand className="h-24 w-24 text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-bold mb-2">No saved items yet</h2>
              <p className="text-muted-foreground mb-8">
                Hi five some deals to save here!
              </p>
              <Button onClick={() => navigate("/")}>
                Explore Listings
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {folderGroups.map(folder => {
                const folderId = folder.folderId || 'unsorted';
                const isOpen = openFolders[folderId] !== false; // default open

                return (
                  <Collapsible
                    key={folderId}
                    open={isOpen}
                    onOpenChange={() => toggleFolder(folderId)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {folder.folderName}
                                <span className="text-sm font-normal text-muted-foreground">
                                  ({folder.items.length})
                                </span>
                              </CardTitle>
                              {folder.folderDescription && (
                                <CardDescription className="mt-1">
                                  {folder.folderDescription}
                                </CardDescription>
                              )}
                            </div>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folder.items.map(item => (
                              item.save_type === 'listing' ? (
                                <SavedListingCard
                                  key={item.id}
                                  saveId={item.id}
                                  listing={item.listing}
                                  onUnsave={() => deleteSave(item.id)}
                                  isDeleting={isDeleting}
                                />
                              ) : (
                                <SavedVendorCard
                                  key={item.id}
                                  saveId={item.id}
                                  vendor={item.vendor}
                                  onUnsave={() => deleteSave(item.id)}
                                  isDeleting={isDeleting}
                                />
                              )
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedPage;
