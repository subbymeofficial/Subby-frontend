import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUploadProfileImage, useDeleteProfileImage } from "@/hooks/use-api";
import { useAuth, getApiError } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { isNative, pickImage } from "@/lib/native";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ProfileImageUpload() {
  const { user, refreshUser } = useAuth();
  const upload = useUploadProfileImage();
  const remove = useDeleteProfileImage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nativeBusy, setNativeBusy] = useState(false);

  const currentImage =
    user?.profileImage?.url ||
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`;

  const validateAndUpload = async (file: File, previewDataUrl?: string) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP images are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be under 2MB.",
        variant: "destructive",
      });
      return;
    }

    const objectUrl = previewDataUrl ?? URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      await upload.mutateAsync(file);
      await refreshUser();
      toast({ title: "Uploaded", description: "Profile image updated successfully." });
    } catch (error) {
      toast({ title: "Upload failed", description: getApiError(error), variant: "destructive" });
    } finally {
      setPreview(null);
      if (!previewDataUrl) URL.revokeObjectURL(objectUrl);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await validateAndUpload(file);
  };

  const handlePickNative = async () => {
    setNativeBusy(true);
    try {
      const picked = await pickImage("prompt");
      if (!picked) return;
      const file =
        ALLOWED_TYPES.includes(picked.file.type)
          ? picked.file
          : new File([picked.file], picked.file.name, { type: "image/jpeg" });
      await validateAndUpload(file, picked.dataUrl);
    } finally {
      setNativeBusy(false);
    }
  };

  const openPicker = () => {
    if (isNative()) {
      void handlePickNative();
    } else {
      fileRef.current?.click();
    }
  };

  const handleRemove = async () => {
    try {
      await remove.mutateAsync();
      await refreshUser();
      toast({ title: "Removed", description: "Profile image removed." });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const isUploading = upload.isPending || nativeBusy;
  const isRemoving = remove.isPending;
  const hasImage = !!user?.profileImage?.url;
  const displayImage = preview || currentImage;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
          {isUploading ? (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <img
              src={displayImage}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <button
          type="button"
          onClick={openPicker}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Camera size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Profile Photo</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or WebP. Max 2MB.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openPicker}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Upload size={14} className="mr-1" />
            )}
            {hasImage ? "Replace" : "Upload"}
          </Button>
          {hasImage && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Trash2 size={14} className="mr-1 text-destructive" />
              )}
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
