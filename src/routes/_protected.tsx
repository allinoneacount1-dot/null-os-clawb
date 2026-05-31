import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/session.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_protected")({
  loader: () => getSessionUser(),
  component: ProtectedLayout,
  errorComponent: () => <AccessDenied />,
});

function ProtectedLayout() {
  const { user: ssrUser } = Route.useLoaderData();
  const { user: liveUser, loading } = useAuth();
  const user = liveUser ?? ssrUser;

  if (!user) {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground animate-blink">
            verifying wallet signature...
          </div>
        </div>
      );
    }
    return <AccessDenied />;
  }

  return <Outlet />;
}

function AccessDenied() {
  const router = useRouter();
  const { signIn, signingIn, error } = useAuth();

  const handle = async () => {
    await signIn();
    router.invalidate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="hud-border max-w-md border-destructive/60 p-6 animate-glitch-shift">
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-destructive">
          <span className="animate-blink">⚠ kernel_guard // 0x_LOCK</span>
          <span>403</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-destructive glow-neon">
          ACCESS DENIED: WALLET NOT FOUND
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          this module is a protected sector of the null clawb OS. authenticate
          with a Solana wallet (SIWS / CIP-0012) to mount.
        </p>
        <button
          onClick={() => void handle()}
          disabled={signingIn}
          className="mt-5 w-full border border-neon/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neon transition-colors duration-100 hover:bg-neon hover:text-background disabled:opacity-50"
        >
          {signingIn ? "signing..." : "connect wallet [ SIWS ]"}
        </button>
        {error && <p className="mt-3 text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
