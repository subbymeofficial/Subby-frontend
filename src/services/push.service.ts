/**
 * Push-token registration service.
 *
 * The frontend will POST the device token + platform to the backend so
 * the backend can target this device via APNs (iOS) / FCM (Android).
 * If the backend endpoint doesn't exist yet the call will fail silently
 * so shipping the mobile app isn't blocked on server work.
 */
import { apiClient } from "@/lib/api-client";

export type PushPlatform = "ios" | "android";

export interface RegisterPushTokenPayload {
  token: string;
  platform: PushPlatform;
}

export const pushService = {
  async registerToken(payload: RegisterPushTokenPayload): Promise<void> {
    try {
      await apiClient.post("/push-tokens", payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[push] registerToken failed:", err);
    }
  },

  async unregisterToken(token: string): Promise<void> {
    try {
      await apiClient.delete(`/push-tokens/${encodeURIComponent(token)}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[push] unregisterToken failed:", err);
    }
  },
};
