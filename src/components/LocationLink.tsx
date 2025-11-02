import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationLinkProps {
  location: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const LocationLink = ({ 
  location, 
  className,
  iconSize = "md",
  showIcon = true 
}: LocationLinkProps) => {
  const iconClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors hover:underline",
        className
      )}
      title="View on Google Maps"
      onClick={(e) => e.stopPropagation()}
    >
      {showIcon && <MapPin className={iconClasses[iconSize]} />}
      <span>{location}</span>
    </a>
  );
};

export default LocationLink;
