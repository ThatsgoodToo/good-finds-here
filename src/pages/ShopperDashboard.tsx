import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, FolderHeart, History } from "lucide-react";

const ShopperDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Manage your favorites and explore saved items.
              </p>
            </div>

            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="favorites">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="folders">
                  <FolderHeart className="h-4 w-4 mr-2" />
                  Folders
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="favorites" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Favorites</CardTitle>
                    <CardDescription>
                      Items and vendors you've saved
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No favorites yet. Start exploring to save items!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="folders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Folders</CardTitle>
                    <CardDescription>
                      Organize your favorites into folders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <FolderHeart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No folders created yet.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Browsing History</CardTitle>
                    <CardDescription>
                      Recently viewed items and vendors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No browsing history yet.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopperDashboard;
