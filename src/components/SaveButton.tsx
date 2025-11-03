import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFolders } from "@/hooks/useFolders";
import { useSaves } from "@/hooks/useSaves";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  itemType: 'listing' | 'vendor';
  itemId: string;
  itemTitle?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  showLabel?: boolean;
}

export function SaveButton({ 
  itemType, 
  itemId, 
  itemTitle,
  size = "icon",
  variant = "ghost",
  className,
  showLabel = false
}: SaveButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folders, createFolder } = useFolders();
  const { checkIsSaved, saveItem, unsaveItem } = useSaves();
  
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  // Check if item is already saved
  useEffect(() => {
    const checkSaved = async () => {
      if (!user) {
        setIsSaved(false);
        setIsChecking(false);
        return;
      }
      
      const saved = await checkIsSaved(itemType, itemId);
      setIsSaved(saved);
      setIsChecking(false);
    };

    checkSaved();
  }, [user, itemType, itemId, checkIsSaved]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save items");
      navigate("/auth");
      return;
    }

    if (isSaved) {
      // Unsave
      unsaveItem({ saveType: itemType, targetId: itemId }, {
        onSuccess: () => {
          setIsSaved(false);
          toast.success("Unsaved successfully");
        },
        onError: () => {
          toast.error("Failed to unsave");
        }
      });
    } else {
      // Show folder selection dialog
      setShowDialog(true);
    }
  };

  const handleSave = (folderId: string, folderName: string) => {
    saveItem({ 
      saveType: itemType, 
      targetId: itemId, 
      folderId,
      emailOnSave: false 
    }, {
      onSuccess: () => {
        setIsSaved(true);
        toast.success(`Saved to ${folderName}!`, {
          description: itemTitle ? `${itemTitle} has been added to your collection.` : undefined,
        });
        setShowDialog(false);
        setNewFolderName("");
        setNewFolderDescription("");
      },
      onError: () => {
        toast.error("Failed to save");
      }
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    createFolder({ 
      name: newFolderName.trim(), 
      description: newFolderDescription.trim() || undefined 
    }, {
      onSuccess: (newFolder) => {
        handleSave(newFolder.id, newFolder.name);
      },
      onError: () => {
        toast.error("Failed to create folder");
      }
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isChecking}
        className={cn(
          "transition-all",
          isSaved
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-background/90 hover:bg-background text-foreground",
          className
        )}
        title={isSaved ? "Unsave" : "Save to collection"}
      >
        <Hand className={cn("h-5 w-5", isSaved && "fill-current")} />
        {showLabel && <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>}
      </Button>

      {/* Folder Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Save to Collection</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a folder to save this {itemType} or create a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                onClick={() => handleSave(folder.id, folder.name)}
                variant="outline"
                className="w-full justify-start bg-background hover:bg-muted text-foreground"
              >
                {folder.name}
                {folder.description && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {folder.description}
                  </span>
                )}
              </Button>
            ))}
            
            {/* Create New Folder Section */}
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Folder</p>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateFolder();
                    }
                  }}
                />
                <Input
                  type="text"
                  placeholder="Description (optional)"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateFolder();
                    }
                  }}
                />
                <Button onClick={handleCreateFolder} className="w-full">
                  Create & Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
