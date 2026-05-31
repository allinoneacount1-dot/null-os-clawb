import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "null clawb // DOCS" },
      {
        name: "description",
        content:
          "System manual for the null clawb OS — modules, commands, tokenomics and protocol.",
      },
      { property: "og:title", content: "null clawb // DOCS" },
      {
        property: "og:description",
        content: "System manual for the null clawb OS.",
      },
    ],
  }),
  component: Docs,
});

const SECTIONS: { hex: string; title: string; body: string[] }[] = [
  {
    hex: "0x00",
    title: "// what is null clawb",
    body: [
      "null clawb ($CLAWB) is an underground OS — not a website.",
      "Every module is a window inside an abandoned terminal.",
      "You are nothing. The system confirms it on boot.",
    ],
  },
  {
    hex: "0x1A",
    title: "// navigation protocol",
    body: [
      "There is no menu. Use the floating CLI (bottom-left).",
      "  cd /swap          mount swap engine",
      "  execute purge.exe -> mount soul cleanser",
      "  ls                list modules",
      "  help              command reference",
      "Or decrypt the sys_dir tree on the right edge.",
    ],
  },
  {
    hex: "0x2F",
    title: "// modules",
    body: [
      "core      ( / )        boot sequence + void graph.",
      "swap      ( /swap )    task-manager view of migration to 85 SOL.",
      "purge     ( /purge )   AI autopsy of rugged tokens. [protected]",
      "passport  ( /passport) 3D criminal ID generator. [protected]",
    ],
  },
  {
    hex: "0x3C",
    title: "// access control",
    body: [
      "Protected modules require a connected Solana wallet (SIWS).",
      "No wallet -> ACCESS DENIED: WALLET NOT FOUND.",
      "Connect via the identity HUD (top-right), then retry.",
    ],
  },
  {
    hex: "0x4D",
    title: "// tokenomics",
    body: [
      "ticker:   $CLAWB",
      "chain:    solana",
      "launch:   pump.fun bonding curve",
      "migrate:  85 SOL -> jupiter v6 liquidity",
      "supply:   1,000,000,000 (fixed)",
    ],
  },
  {
    hex: "0x5E",
    title: "// disclaimer",
    body: [
      "$CLAWB is a meme. It has no intrinsic value.",
      "Nothing here is financial advice. You are nothing.",
      "Trade only what you can afford to lose to the void.",
    ],
  },
];

function Docs() {
  return (
    <div className="min-h-screen px-4 pb-32 pt-16 md:px-24">
      <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="text-neon glow-neon">docs // system_manual</span>
        <span>PID 0x4D</span>
      </div>

      <h1 className="mb-2 text-3xl font-extrabold text-stark animate-glitch-shift">
        null clawb // MANUAL
      </h1>
      <p className="mb-8 max-w-xl text-xs text-muted-foreground">
        cat /sys/manual.txt — everything you need to operate this terminal.
      </p>

      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.hex} className="hud-border p-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <span className="text-muted-foreground/60">{s.hex}</span>
              <span className="text-solana glow-solana">{s.title}</span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/85">
              {s.body.join("\n")}
            </pre>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[10px] uppercase tracking-widest text-purple">
        run `help` in the cli for live commands.
      </p>
    </div>
  );
}
