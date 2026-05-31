// src/components/wallet-hud.tsx — Enhanced wallet HUD with better UX
import { useAuth } from "@/hooks/use-auth";

function short(wallet: string) {
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

export function WalletHUD() {
  const { user, loading, signingIn, error, signIn, signOut } = useAuth();

  return (
    <div className="pointer-events-auto fixed right-2 top-2 z-50 w-[min(92vw,240px)] md:right-3 md:top-3 md:w-[min(88vw,260px)]">
      <div className="hud-border px-2.5 py-1.5 text-[9px] uppercase tracking-widest md:px-3 md:py-2 md:text-[10px]">
        <div className="mb-1 flex items-center justify-between text-muted-foreground md:mb-1.5">
          <span className="text-neon glow-neon">/// identity</span>
          <span className={user ? "text-neon" : "text-destructive"}>
            {loading ? "○ ..." : user ? "● linked" : "○ null"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-1.5 text-foreground/50">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-neon/60" />
            <span className="animate-pulse">scanning wallet...</span>
          </div>
        ) : user ? (
          <div className="space-y-1 md:space-y-1.5">
            <div className="text-foreground/80">
              <span className="text-muted-foreground/60">addr </span>
              <span className="text-solana glow-solana">{short(user.wallet)}</span>
            </div>
            <div className="text-foreground/80">
              <span className="text-muted-foreground/60">role </span>
              <span className="text-purple">{user.role}</span>
            </div>
            {user.clawb_balance !== undefined && (
              <div className="text-foreground/80">
                <span className="text-muted-foreground/60">$clawb </span>
                <span className="text-neon">{user.clawb_balance.toLocaleString()}</span>
              </div>
            )}
            {user.discord_username && (
              <div className="text-foreground/60">
                <span className="text-muted-foreground/60">discord </span>
                <span className="text-foreground/70">{user.discord_username}</span>
              </div>
            )}
            <button
              onClick={() => void signOut()}
              className="mt-1 w-full border border-destructive/60 px-2 py-1 text-destructive transition-colors duration-100 hover:bg-destructive hover:text-background"
            >
              sever link
            </button>
          </div>
        ) : (
          <div className="space-y-1 md:space-y-1.5">
            <div className="text-foreground/40 text-[8px] md:text-[9px]">
              Connect a Solana wallet to access protected modules
            </div>
            <button
              onClick={() => void signIn()}
              disabled={signingIn}
              className="w-full border border-neon/60 px-2 py-1.5 text-neon transition-colors duration-100 hover:bg-neon hover:text-background disabled:opacity-50 text-[9px] md:text-[10px] uppercase tracking-wider"
            >
              {signingIn ? "signing..." : "connect wallet [ SIWS ]"}
            </button>
            <div className="text-foreground/30 text-[8px] leading-tight">
              Supports: Phantom | Solflare | Backpack | Glow
            </div>
            {error && <div className="text-destructive break-words text-[9px]">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
