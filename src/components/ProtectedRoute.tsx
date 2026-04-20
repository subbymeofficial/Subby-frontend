import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Subscription-aware route guard.
 *
 * Rules:
 *  - Not logged in        â /login
 *  - Role not allowed     â /
 *  - Contractor without an active/trialing subscription â /dashboard/contractor/subscription
 *    (the subscription page, the contractor overview and /messages/settings stay reachable
 *    so the subbie can actually pay and still receive messages.)
 *
 * Clients (builders/hirers) and admins are never paywalled.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Exception: a contractor with an active/trialing subscription may
    // access client (builder) routes via the RoleSwitcher toggle.
    const subStatus = user.subscriptionStatus ?? user.subscription?.status;
    const isPaidContractor =
      user.role === "contractor" &&
      (subStatus === "active" || subStatus === "trialing");
    const isClientRoute = allowedRoles.includes("client");

    if (!(isPaidContractor && isClientRoute)) {
      return <Navigate to="/" replace />;
    }
  }

  // Contractor subscription gate
  if (user && user.role === "contractor") {
    const hasActiveSub =
      user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

    // Pages a contractor can reach WITHOUT paying (so they can actually pay,
    // read messages, and manage their account)
    const allowlist = [
      "/dashboard/contractor",
      "/dashboard/contractor/subscription",
      "/dashboard/contractor/settings",
      "/messages",
    ];
    const onAllowlisted = allowlist.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

    if (!hasActiveSub && !onAllowlisted) {
      return <Navigate to="/dashboard/contractor/subscription" replace />;
    }
  }

  return <>{children}</>;
}
