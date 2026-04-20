import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No config means we can't retry â just bubble up
    if (!originalRequest) return Promise.reject(error);

    // Do not attempt refresh on the refresh endpoint itself to avoid loops
    const isAuthEndpoint =
      typeof originalRequest.url === "string" &&
      (originalRequest.url.includes("/auth/refresh") ||
        originalRequest.url.includes("/auth/login"));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
          );

          const tokens = data?.data ?? data;
          const newAccess = tokens?.accessToken ?? tokens?.access_token;
          const newRefresh = tokens?.refreshToken ?? tokens?.refresh_token;

          if (newAccess) {
            localStorage.setItem("accessToken", newAccess);
            if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr: unknown) {
          // Only nuke auth if the refresh endpoint itself explicitly
          // rejected the token. Network errors, 5xx, CORS failures etc.
          // should NOT log the user out.
          const status =
            (refreshErr as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            // Let the app react via AuthContext instead of a hard reload.
            window.dispatchEvent(new Event("auth:expired"));
          }
          // Otherwise: keep the user signed in, just reject this one call.
        }
      }
    }

    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: { data?: T } & T }): T {
  return response.data.data !== undefined ? response.data.data : response.data;
}

export default apiClient;
