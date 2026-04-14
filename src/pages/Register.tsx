import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, getApiError } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: UserRole = roleParam === "contractor" ? "subcontractor" : "client";
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for error in URL (from Google OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      toast({ 
        title: "Sign Up Failed", 
        description: error, 
        variant: "destructive",
        duration: 6000,
      });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      toast({ title: "Success", description: "Account created successfully" });
      if (role === "contractor") {
        navigate("/dashboard/contractor/subscription");
      } else {
        navigate("/dashboard/client/subscription");
      }
    } catch (error) {
      toast({ title: "Sign Up Failed", description: getApiError(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    registerWithGoogle(role);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container-main flex items-center justify-center py-16">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 card-shadow">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">{roleParam === "contractor" ? "Sign up as a Subcontractor" : roleParam === "hirer" ? "Sign up as a Builder / Hirer" : "Join SubbyMe today"}</p>
          </div>

          <div className="mt-8 space-y-4">
            {!roleParam && (
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "client" as UserRole, label: "Find Subcontractors", desc: "Hire skilled subcontractors for your projects" },
                  { value: "contractor" as UserRole, label: "Sign up as a Subcontractor", desc: "Offer your skills and get hired for jobs" },
                ]).map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border p-4 text-left transition-all ${role === r.value ? "border-primary bg-accent" : "border-border hover:bg-secondary"}`}
                  >
                    <span className={`block text-sm font-semibold ${role === r.value ? "text-primary" : "text-foreground"}`}>{r.label}</span>
                    <span className="block mt-0.5 text-xs text-muted-foreground">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            )}

            <GoogleSignInButton
              onClick={handleGoogleSignUp}
              text="Sign up with Google"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Minimum 8 characters" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={8} 
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
