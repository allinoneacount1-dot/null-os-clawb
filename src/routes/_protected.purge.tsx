import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ParticleExplosion } from "@/components/particle-explosion";

interface PurgeResult {
  id: string;
  contract_address: string;
  token_name: string | null;
  verdict: string | null;
  autopsy: string | null;
  cause_of_death: string | null;
  rug_score: number | null;
}

export const Route = createFileRoute("/_protected/purge")({
  head: () => ({
    meta: [
      { title: "null clawb // SOUL CLEANSER" },
      { name: "description", content: "Token autopsy. Purge your rug ghosts." },
    ],
  }),
  component: Purge,
});

function Purge() {
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurgeResult | null>(null);
  const [boom, setBoom] = useState(0);

  const run = async () => {
    setError(null);
    setResult(null);
    const trimmed = contract.trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
      setError("INVALID CONTRACT ADDRESS — must be base58 Solana mint.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contract: trimmed }),
      });
      const data = (await res.json()) as { purge?: PurgeResult; error?: string };
      if (!res.ok || !data.purge) {
        setError(data.error ?? "Autopsy failed.");
        return;
      }
      setResult(data.purge);
      setBoom((b) => b + 1); // detonate particles
    } catch {
      setError("CONNECTION SEVERED — autopsy machine offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-32 pt-16 md:px-24">
      <div className="hud-border max-w-2xl border-destructive/50 p-5">
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-destructive">
          <span className="animate-blink">⚠ malware_console // soul_cleanser</span>
          <span>PROTECTED 0x2F</span>
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-stark">AUTOPSY OF A DEAD TOKEN</h1>
        <p className="mb-4 text-xs text-muted-foreground">
          paste a rug contract address. the system performs the autopsi kematian
          token (Gemini AI) and detonates the remains.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            disabled={loading}
            placeholder="enter contract address..."
            className="w-full border border-destructive/60 bg-void px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => void run()}
            disabled={loading}
            className="shrink-0 border border-destructive px-4 py-2 text-xs font-bold uppercase tracking-widest text-destructive transition-colors duration-100 hover:bg-destructive hover:text-background disabled:opacity-50"
          >
            {loading ? "dissecting..." : "execute purge.exe"}
          </button>
        </div>

        {error && <p className="mt-4 text-[11px] text-destructive">{error}</p>}

        {loading && (
          <div className="mt-5 text-[11px] leading-relaxed text-foreground/70">
            <p className="animate-blink">&gt; opening corpse...</p>
            <p>&gt; querying gemini forensic core...</p>
          </div>
        )}

        {result && (
          <div className="mt-5 border border-border bg-void p-4 text-[12px] leading-relaxed">
            <div className="mb-3 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest">
              <div className="text-muted-foreground">
                subject <span className="text-stark">{result.token_name ?? "UNKNOWN"}</span>
              </div>
              <div className="text-right text-muted-foreground">
                verdict <span className="text-destructive glow-neon">{result.verdict ?? "—"}</span>
              </div>
              <div className="text-muted-foreground">
                cause <span className="text-foreground/80">{result.cause_of_death ?? "—"}</span>
              </div>
              <div className="text-right text-muted-foreground">
                rug_score{" "}
                <span className="text-neon glow-neon">{result.rug_score ?? "—"}/100</span>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-foreground/90">
              {result.autopsy}
            </pre>
          </div>
        )}
      </div>

      <ParticleExplosion trigger={boom} />
    </div>
  );
}
