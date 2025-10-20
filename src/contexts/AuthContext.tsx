import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserRole = "vendor" | "shopper";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role after setting session
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    // Fetch all roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = rolesData?.map((r) => r.role as UserRole) || [];
    setRoles(userRoles);

    // Use the secure get_user_role function for primary role
    const { data, error } = await supabase
      .rpc("get_user_role", { _user_id: userId });

    if (!error && data) {
      setUserRole(data as UserRole);
    } else {
      setUserRole(null);
    }

    // Initialize activeRole
    const savedActiveRole = localStorage.getItem("activeRole") as UserRole | null;
    if (savedActiveRole && userRoles.includes(savedActiveRole)) {
      setActiveRoleState(savedActiveRole);
    } else {
      // Fallback to primary role
      const initialRole = data ? (data as UserRole) : userRoles[0] || null;
      setActiveRoleState(initialRole);
      if (initialRole) {
        localStorage.setItem("activeRole", initialRole);
      }
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem("activeRole", role);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setRoles([]);
    setActiveRoleState(null);
    localStorage.removeItem("activeRole");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, roles, activeRole, setActiveRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
