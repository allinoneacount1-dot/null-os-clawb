import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchSystemStats, fetchRecentAutopsies, subscribeToAutopsies, type TokenAutopsy } from "@/lib/supabase-data";
import { SkeletonCard, SkeletonText } from "@/components/loading-skeleton";

export const Route = createFileRoute("/swap")({
  head: () => ({
    meta: [
      { title: "null clawb // SWAP ENGINE" },
      { name: "description", content: "System monitor — migration progress and token analytics." },
    ],
  }),
  component: Swap,
});

interface Stats {
  totalAutopsies: number;
  totalUsers: number;
  totalValueDestroyed: number;
  topPurger: string | null;
}

// Fallback mock data when Supabase is not connected
const MOCK_STATS: Stats = {
  totalAutopsies: 0,
  totalUsers: 0,
  totalValueDestroyed: 0,
  topPurger: null,
};

function Swap() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAutopsies, setRecentAutopsies] = useState<TokenAutopsy[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        fetchSystemStats(),
        fetchRecentAutopsies(5),
      ]);
      if (s) setStats(s);
      if (a) setRecentAutopsies(a);
      setSupabaseConnected(true);
    } catch {
      setStats(MOCK_STATS);
      setRecentAutopsies([]);
      setSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData();
    return () => { mounted = false; };
  }, [loadData]);

  // Real-time subscription for new autopsies
  useEffect(() => {
    const unsubscribe = subscribeToAutopsies((newAutopsy) => {
      setRecentAutopsies((prev) => [newAutopsy, ...prev].slice(0, 5));
      setStats((prev => prev ? { ...prev, totalAutopsies: prev.totalAutopsies + 1 } : prev));
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen px-4 pb-32 pt-16 md:px-24">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="hud-border p-5 mb-4">
          <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="text-neon glow-neon">swap_engine // task_manager</span>
            <span>PID 0x1A</span>
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-stark">PRE-MIGRATION</h1>
          <p className="mb-4 text-xs text-muted-foreground">
            pump.fun bonding curve progress → target 85 SOL
          </p>
          <pre className="mb-2 text-[11px] text-solana glow-solana">
{`[████████████░░░░░░░░░░░░] 52.4 / 85.0 SOL`}
          </pre>
          <div className="h-2 w-full bg-void rounded-full overflow-hidden">
            <div className="h-full bg-neon animate-loadbar rounded-full" style={{ width: "62%" }} />
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground">
            program_id: 6EF8rrecth7LB5g2b8b7mA7p44m69aeP6A63B87g
          </p>
          <p className="mt-1 text-[10px] text-purple">
            post-migration: jupiter v6 swap api (wiring next).
          </p>
        </div>

        {/* System Stats */}
        <div className="hud-border p-5 mb-4">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="text-neon glow-neon">// system_analytics</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Total Autopsies" value={stats.totalAutopsies.toString()} color="text-neon" />
              <StatBox label="Active Users" value={stats.totalUsers.toString()} color="text-solana" />
              <StatBox label="Value Destroyed" value={supabaseConnected ? `$${stats.totalValueDestroyed.toLocaleString()}` : "—"} color="text-destructive" />
              <StatBox label="Top Purger" value={stats.topPurger ? `${stats.topPurger.slice(0, 6)}…` : "—"} color="text-purple" />
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">Loading analytics...</p>
          )}
        </div>

        {/* Recent Autopsies */}
        <div className="hud-border p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="text-neon glow-neon">// recent_autopsies</span>
          </div>
          {loading ? (
            <SkeletonText lines={3} />
          ) : recentAutopsies.length > 0 ? (
            <div className="space-y-2">
              {recentAutopsies.map((a) => (
                <div key={a.id} className="border border-border/50 p-2 text-[10px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-solana">{a.token_name || a.contract_address.slice(0, 8)}</span>
                    <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  {a.cause_of_death && <p className="text-foreground/60">{a.cause_of_death}</p>}
                  {a.rug_score !== null && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted-foreground">Rug Score:</span>
                      <div className="flex-1 h-1 bg-void rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.rug_score > 70 ? "bg-destructive" : a.rug_score > 40 ? "bg-yellow-500" : "bg-neon"}`}
                          style={{ width: `${a.rug_score}%` }}
                        />
                      </div>
                      <span className={a.rug_score > 70 ? "text-destructive" : "text-neon"}>{a.rug_score}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[10px] text-muted-foreground mb-2">
                {supabaseConnected ? "No autopsies recorded yet — be the first to purge" : "No local autopsies recorded"}
              </p>
              {user ? (
                <p className="text-[9px] text-muted-foreground/60">Use <span className="text-solana">cd /purge</span> to submit your first autopsy</p>
              ) : (
                <p className="text-[9px] text-muted-foreground/60">Connect wallet to submit autopsies</p>
              )}
              {!supabaseConnected && (
                <p className="text-[8px] text-yellow-500/60 mt-2">⚠ Supabase offline — data will sync when connected</p>
              )}
            </div>
          )}
        </div>

        {/* User-specific info */}
        {user && (
          <div className="mt-4 hud-border p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              <span className="text-neon glow-neon">// your_status</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-neon">{user.clawb_balance?.toLocaleString() || 0}</div>
                <div className="text-[9px] text-muted-foreground">$CLAWB</div>
              </div>
              <div>
                <div className="text-lg font-bold text-solana">{user.role || "ANOMALY"}</div>
                <div className="text-[9px] text-muted-foreground">ROLE</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple">ACTIVE</div>
                <div className="text-[9px] text-muted-foreground">STATUS</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-border/50 p-2">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
