import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { NotificationDropdown } from "./NotificationDropdown";
import { MarketToggle } from "./MarketToggle";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Find Contractors", path: "/contractors" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const dashboardPath = user?.role === "admin" ? "/admin" : `/dashboard/${user?.role}`;

  return (
    <header className="sticky top-0 z-40 border-b bg-[#D6E8FF] backdrop-blur">
      <nav className="container-main flex min-h-16 items-center justify-between py-4">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="SubbyMe" className="h-12 sm:h-14 md:h-16 lg:h-20 object-contain max-h-24 w-auto" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors text-black hover:text-primary ${location.pathname === l.path ? "text-primary font-semibold" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/messages"><MessageSquare size={16} className="mr-1" /> Messages</Link>
              </Button>
              <MarketToggle />
          <NotificationDropdown />
              <Button asChild variant="ghost" size="sm">
                <Link to={dashboardPath}><User size={16} className="mr-1" /> Dashboard</Link>
              </Button>
              <span className="text-sm text-black">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-black hover:text-primary"><Link to="/login">Log In</Link></Button>
              <Button asChild size="sm"><Link to="/register">Sign Up</Link></Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </nav>

      {mobileOpen && (
        <div className="border-t bg-[#D6E8FF] p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path} onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors text-black ${location.pathname === l.path ? "bg-primary/20 text-primary font-semibold" : "hover:bg-primary/10"}`}>
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="text-sm font-medium px-3 py-2 rounded-md text-black hover:bg-primary/10 flex items-center gap-2">
                  <MessageSquare size={16} /> Messages
                </Link>
                <div className="px-3 py-2"><NotificationDropdown /></div>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="text-sm font-medium px-3 py-2 rounded-md text-black hover:bg-primary/10">Dashboard</Link>
                <Button variant="outline" size="sm" onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link></Button>
                <Button asChild size="sm" className="flex-1"><Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
