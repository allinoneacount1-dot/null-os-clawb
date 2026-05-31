import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_protected/passport")({
  head: () => ({
    meta: [
      { title: "null clawb // PASSPORT GENERATOR" },
      { name: "description", content: "Criminal ID printing for $CLAWB holders." },
    ],
  }),
  component: Passport,
});

const REQUIRED_BALANCE = 1;

function Passport() {
  const { user } = useAuth();
  const balance = user?.clawb_balance ?? 0;
  const eligible = balance >= REQUIRED_BALANCE;
  const idCode = user ? user.wallet.slice(0, 4).toUpperCase() + "-" + user.wallet.slice(-4).toUpperCase() : "████-████";

  return (
    <div className="min-h-screen px-4 pb-32 pt-16 md:px-24">
      <div className="hud-border max-w-md p-5 animate-glitch-shift">
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-purple">passport_gen // id_print</span>
          <span>PROTECTED 0x3C</span>
        </div>
        <div className="border border-border bg-void p-4">
          <div className="text-[10px] uppercase tracking-widest text-neon glow-neon">
            null clawb — criminal id
          </div>

          {eligible ? (
            <div className="mt-3 flex items-center gap-3">
              <svg viewBox="0 0 64 64" className="h-20 w-20 shrink-0" aria-hidden>
                <defs>
                  <linearGradient id="clawbFace" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#C6FF00" />
                    <stop offset="100%" stopColor="#8B3DFF" />
                  </linearGradient>
                </defs>
                <rect x="6" y="6" width="52" height="52" fill="none" stroke="url(#clawbFace)" strokeWidth="1.5" />
                <polygon points="32,14 50,44 14,44" fill="none" stroke="#00A3FF" strokeWidth="1.5" />
                <circle cx="32" cy="34" r="6" fill="url(#clawbFace)" />
                <line x1="14" y1="50" x2="50" y2="50" stroke="#C6FF00" strokeWidth="1" />
              </svg>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div>ID: <span className="text-stark">{idCode}</span></div>
                <div>RANK: <span className="text-neon">CERTIFIED NOTHING</span></div>
                <div>BAL: <span className="text-solana">{balance} $CLAWB</span></div>
                <div>ROLE: <span className="text-purple">{user?.role ?? "CITIZEN"}</span></div>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-3 text-[11px]">
              <div className="col-span-1 aspect-square border border-border bg-background" />
              <div className="col-span-2 space-y-1 text-muted-foreground">
                <div>ID: {idCode}</div>
                <div>RANK: <span className="text-stark">UNVERIFIED</span></div>
                <div>BAL: <span className="text-solana">{balance} $CLAWB</span></div>
                <div>ROLE: <span className="text-purple">[ pending ]</span></div>
              </div>
            </div>
          )}
        </div>

        {!eligible && (
          <p className="mt-3 text-[10px] text-destructive">
            INSUFFICIENT $CLAWB — hold at least {REQUIRED_BALANCE} $CLAWB to print
            your 3D criminal ID.
          </p>
        )}

        <button className="mt-4 w-full border border-[#5865F2] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#5865F2] transition-colors duration-100 hover:bg-[#5865F2] hover:text-background">
          {user?.discord_username
            ? `discord: ${user.discord_username}`
            : "link discord for [ SYS_ADMIN ]"}
        </button>
      </div>
    </div>
  );
}
