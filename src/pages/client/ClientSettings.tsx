import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { clientNavItems } from "./ClientOverview";
import { useAuth, getApiError } from "@/context/AuthContext";
import { useUpdateProfile, useChangePassword, useDeleteSelfAccount } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, Lock } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { LocationSelect } from "@/components/LocationSelect";
import { useMarket } from "@/context/MarketContext";

export default function ClientSettings() {
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteSelf = useDeleteSelfAccount();
  const { toast } = useToast();
  const { market } = useMarket();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) return;
    try {
      await updateProfile.mutateAsync({ id: userId, data: form });
      await refreshUser();
      toast({ title: "Saved", description: "Profile updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast({ title: "Success", description: "Password changed successfully" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteSelf.mutateAsync();
      toast({ title: "Account deleted", description: "Your account has been deleted successfully." });
      window.localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      <div className="max-w-2xl space-y-8">
        {/* Profile Section */}
        <form onSubmit={handleProfileSubmit} className="rounded-lg border bg-card p-6 card-shadow">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserIcon size={18} /> Profile Settings
          </h2>
          <div className="mt-6 space-y-6">
            <ProfileImageUpload />
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0412 345 678" />
            </div>
            <LocationSelect
              value={form.location}
              lockCountry={market?.code === "US" ? "US" : "AU"}
              helperText="We use this to show you tradies in your area."
              onChange={(formatted) => setForm({ ...form, location: formatted })}
            />
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </form>

        {/* Password Section */}
        {!user?.googleId && (
          <form onSubmit={handlePasswordSubmit} className="rounded-lg border bg-card p-6 card-shadow">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock size={18} /> Change Password
            </h2>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </form>
        )}

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 card-shadow">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock size={18} /> Danger Zone
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting your account will cancel your jobs and withdraw your applications. This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            className="mt-4"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Account
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
