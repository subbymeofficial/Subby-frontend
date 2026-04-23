import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { NotificationDropdown } from "./NotificationDropdown";
import { RoleSwitcher } from "./RoleSwitcher";

type NavLinkDef = { label: string; path: string };

// Marketplace link is role-aware: contractors get "Find Jobs", everyone else gets "Find Contractors".
// Fixes the post-signup navigation gap where contractors had no discoverable path to job listings.
const buildNavLinks = (role?: string): NavLinkDef[] => {
  const extraLinks: NavLinkDef[] =
    role === "contractor"
      ? [{ label: "Find Jobs", path: "/dashboard/contractor/jobs" }]
      : [];
  return [
    { label: "Home", path: "/" },
    { label: "Find Contractors", path: "/contractors" },
    ...extraLinks,
    { label: "Contact", path: "/contact" },
  ];
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const dashboardPath =
    user?.role === "admin" ? "/admin" : `/dashboard/${user?.role}`;
  // Platform nav (Home / Find Contractors / Find Jobs / Contact) is only shown
  // to authenticated members. Unauth visitors see just logo + Log In / Sign Up.
  // This enforces the walled-garden rule: nothing about the platform is
  // discoverable without an account.
  const navLinks = isAuthenticated ? buildNavLinks(user?.role) : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-[#D6E8FF] backdrop-blur">
      <nav className="container-main flex min-h-16 items-center justify-between py-4">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="SubbyMe"
            className="h-12 sm:h-14 md:h-16 lg:h-20 object-contain max-h-24 w-auto"
          />
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors text-black hover:text-primary ${
                location.pathname === l.path ? "text-primary font-semibold" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/messages">
                  <MessageSquare size={16} className="mr-1" /> Messages
                </Link>
              </Button>
              <NotificationDropdown />
              <RoleSwitcher />
              <Button asChild variant="ghost" size="sm">
                <Link to={dashboardPath}>
                  <User size={16} className="mr-1" /> Dashboard
                </Link>
              </Button>
              <span className="text-sm text-black">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-black hover:text-primary"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && user && <RoleSwitcher />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="border-t bg-[#D6E8FF] p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors text-black ${
                  location.pathname === l.path
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-3 py-2 rounded-md text-black hover:bg-primary/10 flex items-center gap-2"
                >
                  <MessageSquare size={16} /> Messages
                </Link>
                <div className="px-3 py-2">
                  <NotificationDropdown />
                </div>
                <div className="py-2">
                  <RoleSwitcher />
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-3 py-2 rounded-md text-black hover:bg-primary/10"
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
