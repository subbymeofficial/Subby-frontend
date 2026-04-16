import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api-client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshUser, user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndActivate = async () => {
      if (sessionId) {
        try {
          await apiClient.post("/payments/verify-session", { sessionId });
          await refreshUser();
        } catch (error: any) {
              setVerificationError(error?.response?.data?.message || "Failed to verify payment");
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
      }
    };

    verifyAndActivate();
  }, [sessionId, refreshUser]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="container-main flex items-center justify-center py-20">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 card-shadow text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Verifying Payment...</h1>
            <p className="mt-2 text-muted-foreground">
              Please wait while we activate your subscription.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container-main flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 card-shadow text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Payment Successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Your payment has been processed successfully. Your account has been updated.
          </p>
          {verificationError && (
            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{verificationError}</p>
              <p className="text-xs text-muted-foreground mt-1">
                If your subscription doesn't activate, please contact support.
              </p>
            </div>
          )}
          {sessionId && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Session: {sessionId.slice(0, 20)}...
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link to={user?.role === 'contractor' ? '/dashboard/contractor/subscription' : '/dashboard/client'}>View Subscription</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
