import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchSession,
  signInWithSolana,
  signOut as doSignOut,
  WalletError,
  type SessionUser,
} from "@/lib/auth-client";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await fetchSession());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async () => {
    setSigningIn(true);
    setError(null);
    try {
      const u = await signInWithSolana();
      setUser(u);
    } catch (e) {
      const msg =
        e instanceof WalletError
          ? e.message
          : e instanceof Error && e.message.includes("User rejected")
            ? "SIGNATURE REJECTED BY OPERATOR"
            : "AUTH FAILURE — connection severed";
      setError(msg);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await doSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signingIn, error, signIn, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
