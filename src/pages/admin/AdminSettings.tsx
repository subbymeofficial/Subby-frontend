import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminNavItems } from "./AdminOverview";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth, getApiError } from "@/context/AuthContext";
import { useChangePassword } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const changePassword = useChangePassword();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isGoogleUser = !!user?.googleId;

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast({ title: "Success", description: "Password changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AdminLayout navItems={adminNavItems}>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Admin Settings</h2>

        <div className="rounded-lg border bg-card p-6 card-shadow">
          <h3 className="font-semibold text-foreground">Account Information</h3>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
            <ProfileImageUpload />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Name:</span> {user?.name}</p>
              <p><span className="font-medium text-foreground">Email:</span> {user?.email}</p>
              <p><span className="font-medium text-foreground">Role:</span> Admin</p>
            </div>
          </div>
        </div>

        {!isGoogleUser && (
          <form onSubmit={handleChangePassword} className="rounded-lg border bg-card p-6 card-shadow">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Lock size={16} /> Change Password
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </form>
        )}

        <div className="rounded-lg border bg-card p-6 card-shadow">
          <h3 className="font-semibold text-foreground">Session</h3>
          <p className="mt-2 text-sm text-muted-foreground">Sign out of the admin panel.</p>
          <Button variant="destructive" className="mt-4" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
