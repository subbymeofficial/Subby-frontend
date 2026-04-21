/**
 * Camera helper.
 *
 * On native, opens the Capacitor Camera picker (camera OR gallery).
 * On web, opens a hidden file input which uses the device camera on mobile
 * browsers and file picker on desktop.
 */
import { isNative } from "./platform";

export type PickedImage = {
  file: File;
  dataUrl: string;
};

export type PickSource = "camera" | "gallery" | "prompt";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, data] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

function pickFromWeb(source: PickSource): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (source === "camera") input.capture = "environment";
    input.style.display = "none";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? "");
        resolve({ file, dataUrl });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 60_000);
  });
}

export async function pickImage(
  source: PickSource = "prompt",
): Promise<PickedImage | null> {
  if (!isNative()) {
    return pickFromWeb(source);
  }

  const { Camera, CameraResultType, CameraSource } = await import(
    "@capacitor/camera"
  );

  const nativeSource =
    source === "camera"
      ? CameraSource.Camera
      : source === "gallery"
        ? CameraSource.Photos
        : CameraSource.Prompt;

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: nativeSource,
      saveToGallery: false,
      correctOrientation: true,
    });

    const dataUrl = photo.dataUrl ?? "";
    if (!dataUrl) return null;
    const ext = photo.format || "jpeg";
    const file = dataUrlToFile(dataUrl, `photo-${Date.now()}.${ext}`);
    return { file, dataUrl };
  } catch (err) {
    return null;
  }
}
