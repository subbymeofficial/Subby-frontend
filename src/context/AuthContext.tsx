import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import type { User, UserRole } from "@/lib/types";
import { isAxiosError } from "axios";

export type { UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  registerWithGoogle: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  switchRole: (target: "client" | "contractor") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function storeAuth(user: User, tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.getProfile();
      const id =
        (profile as unknown as { sub?: string }).sub ??
        (profile as unknown as { _id: string })._id ??
        (profile as unknown as { id: string }).id;

      let fullUser: User = profile as unknown as User;
      try {
        fullUser = await usersService.getUserById(id);
      } catch (innerErr) {
        // getUserById can fail for transient reasons (rate-limit, 5xx,
        // caching). Do NOT log the user out on this path â we still
        // have a valid profile from /auth/me.
        console.warn("getUserById failed, using profile fallback", innerErr);
      }

      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // Only clear auth on explicit auth failures.
      if (status === 401 || status === 403) {
        clearAuth();
        setUser(null);
      } else {
        // Transient failure â keep whatever user we already have cached.
        console.warn("refreshUser transient failure, keeping cached user", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState({}, "", window.location.pathname);
      refreshUser();
    }
  }, [refreshUser]);

  // Listen for the api-client's hard-eviction event so we don't have to
  // hard-reload the page to log a user out when the refresh endpoint 401s.
  useEffect(() => {
    const onExpired = () => {
      clearAuth();
      setUser(null);
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    storeAuth(response.user, response.tokens);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const response = await authService.register({ name, email, password, role });
    storeAuth(response.user, response.tokens);
    setUser(response.user);
  };

  const loginWithGoogle = (role: UserRole) => {
    window.location.href = authService.getGoogleAuthUrl(role, 'login');
  };

  const registerWithGoogle = (role: UserRole) => {
    window.location.href = authService.getGoogleAuthUrl(role, 'register');
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const switchRole = useCallback(
    (target: "client" | "contractor") => {
      if (!user) return;
      // Optimistic local flip; backend role is unchanged â this is just a view mode.
      const next = { ...user, activeView: target };
      setUser(next);
      localStorage.setItem("user", JSON.stringify(next));
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        registerWithGoogle,
        logout,
        isAuthenticated: !!user,
        refreshUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function getApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return error.message;
  }
  if (error instanceof Error) return "An unexpected error occurred";
  return "An unexpected error occurred";
}
