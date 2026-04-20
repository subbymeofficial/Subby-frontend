import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CONTRACTOR_HOME = "/dashboard/contractor";
const CLIENT_HOME = "/dashboard/client";

type Props = {
  className?: string;
};

export function RoleSwitcher({ className = "" }: Props) {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Only contractors with an active/trialing subscription get the toggle.
  const isContractor = user.role === "contractor";
  const subStatus = user.subscriptionStatus ?? user.subscription?.status;
  const hasActiveSub = subStatus === "active" || subStatus === "trialing";

  if (!isContractor || !hasActiveSub) return null;

  const onContractorView = location.pathname.startsWith("/dashboard/contractor");
  const activeView: "contractor" | "client" = onContractorView
    ? "contractor"
    : "client";

  const go = (target: "contractor" | "client") => {
    if (target === activeView) return;
    switchRole(target);
    navigate(target === "contractor" ? CONTRACTOR_HOME : CLIENT_HOME);
  };

  const base =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const activeCls = "bg-blue-600 text-white shadow";
  const idleCls = "bg-transparent text-gray-700 hover:bg-gray-100";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 ${className}`}
      role="group"
      aria-label="Switch dashboard view"
    >
      <button
        type="button"
        onClick={() => go("contractor")}
        className={`${base} ${activeView === "contractor" ? activeCls : idleCls}`}
        aria-pressed={activeView === "contractor"}
      >
        Contractor
      </button>
      <button
        type="button"
        onClick={() => go("client")}
        className={`${base} ${activeView === "client" ? activeCls : idleCls}`}
        aria-pressed={activeView === "client"}
      >
        Builder
      </button>
    </div>
  );
}
