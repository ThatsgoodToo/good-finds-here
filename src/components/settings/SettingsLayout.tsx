import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Bell,
  Mail,
  Shield,
  HelpCircle,
  FileText,
  Info,
  MessageSquare,
  Settings,
  Store,
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  roles?: string[];
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const location = useLocation();
  const { activeRole } = useAuth();

  const navItems: NavItem[] = [
    {
      title: "Account Settings",
      href: "/settings/account",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Profile Settings",
      href: "/settings/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      title: "Messages",
      href: "/settings/messages",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Vendor Settings",
      href: "/settings/vendor",
      icon: <Store className="h-4 w-4" />,
      roles: ["vendor"],
    },
    {
      title: "Privacy Controls",
      href: "/settings/privacy",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Help & FAQ",
      href: "/help",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      title: "Contact Support",
      href: "/support",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "About Us",
      href: "/about",
      icon: <Info className="h-4 w-4" />,
    },
    {
      title: "Privacy Policy",
      href: "/privacy",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Terms of Service",
      href: "/terms",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(activeRole || "");
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-2">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-h-[600px]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
