/**
 * Push notification helper.
 *
 * On native (iOS/Android) this registers with APNs/FCM via Capacitor and
 * returns the device token. On web it resolves to null so callers can
 * gracefully skip registration.
 */
import { isNative } from "./platform";

export type PushRegistration = {
  token: string;
  platform: "ios" | "android";
};

type Listener = (reg: PushRegistration) => void;
type ErrorListener = (err: unknown) => void;

export async function registerPush(options?: {
  onRegistered?: Listener;
  onError?: ErrorListener;
  onNotificationReceived?: (payload: unknown) => void;
}): Promise<PushRegistration | null> {
  if (!isNative()) return null;

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const { Capacitor } = await import("@capacitor/core");

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") {
    options?.onError?.(new Error("push-permission-denied"));
    return null;
  }

  return new Promise<PushRegistration | null>((resolve) => {
    let settled = false;

    PushNotifications.addListener("registration", (token) => {
      const reg: PushRegistration = {
        token: token.value,
        platform: Capacitor.getPlatform() === "ios" ? "ios" : "android",
      };
      options?.onRegistered?.(reg);
      if (!settled) {
        settled = true;
        resolve(reg);
      }
    });

    PushNotifications.addListener("registrationError", (err) => {
      options?.onError?.(err);
      if (!settled) {
        settled = true;
        resolve(null);
      }
    });

    if (options?.onNotificationReceived) {
      PushNotifications.addListener(
        "pushNotificationReceived",
        options.onNotificationReceived,
      );
    }

    PushNotifications.register().catch((err) => {
      options?.onError?.(err);
      if (!settled) {
        settled = true;
        resolve(null);
      }
    });
  });
}

export async function clearPushBadge(): Promise<void> {
  if (!isNative()) return;
  try {
    const { PushNotifications } = await import(
      "@capacitor/push-notifications"
    );
    await PushNotifications.removeAllDeliveredNotifications();
  } catch {
    // noop
  }
}
