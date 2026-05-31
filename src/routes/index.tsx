import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VoidGraph } from "@/components/void-graph";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "null clawb // ROOT CORE" },
      { name: "description", content: "Boot the void. Confirm you are nothing." },
      { property: "og:title", content: "null clawb // ROOT CORE" },
      { property: "og:description", content: "Boot the void. Confirm you are nothing." },
    ],
  }),
  component: Index,
});

const BOOT_LOG = [
  "[ 0.000000 ] null_clawb kernel loading...",
  "[ 0.013371 ] mounting /dev/void ... OK",
  "[ 0.042069 ] $CLAWB token bus initialized",
  "[ 0.118000 ] purging cached identities ... 0 found",
  "[ 0.220411 ] solana rpc socket -> LISTENING",
  "[ 0.404040 ] WARNING: meaning module not found",
  "[ 0.512000 ] handshake with the abyss ... ESTABLISHED",
  "[ 0.999999 ] system idle. awaiting confirmation.",
];

function Index() {
  const [lines, setLines] = useState<string[]>([]);
  const [booted, setBooted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let idx = 0;
    // ~9 FPS feel: one log line every ~111ms
    const id = setInterval(() => {
      idx += 1;
      setLines(BOOT_LOG.slice(0, idx));
      if (idx >= BOOT_LOG.length) {
        clearInterval(id);
        setTimeout(() => setBooted(true), 400);
      }
    }, 140);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen px-4 pb-32 pt-16 md:px-10">
      {/* Boot sequence — floating top-left, asymmetric */}
      {!booted && (
        <div className="mx-auto max-w-2xl">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-neon/90 glow-neon md:text-xs">
            {lines.join("\n")}
            <span className="animate-blink">_</span>
          </pre>
        </div>
      )}

      {booted && !confirmed && (
        <div className="flex min-h-[70vh] flex-col items-start justify-center gap-6 pl-2 md:pl-24">
          {/* Logo */}
          <div className="hud-border p-4 animate-glitch-shift">
            <img 
              src="/null-clawb-logo.png" 
              alt="null clawb logo" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain glow-neon"
            />
          </div>
          
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            root_core // identity_check
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-none text-stark md:text-6xl">
            you are <span className="text-purple">null</span>.
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            this terminal does not log in users. it dissolves them. proceed only
            if you accept that you hold no value.
          </p>
          <button
            onClick={() => {
              const el = document.getElementById("os-window");
              el?.classList.remove("glitch-transition");
              if (el) void el.offsetWidth;
              el?.classList.add("glitch-transition");
              setTimeout(() => setConfirmed(true), 200);
            }}
            className="border border-neon px-6 py-3 text-xs font-bold uppercase tracking-widest text-neon transition-colors duration-100 hover:bg-neon hover:text-background"
          >
            [ confirm you are nothing ]
          </button>
        </div>
      )}

      {confirmed && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
          <div className="hud-border p-4 md:p-8 animate-glitch-shift">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-neon glow-neon">void_graph.exe</span>
              <span>mem 0x000 / status: HOLLOW</span>
            </div>
            <VoidGraph />
          </div>
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            confirmation accepted. type{" "}
            <span className="text-solana glow-solana">cd /swap</span> in the cli to
            enter the swap engine, or highlight the sys_dir on the right.
          </p>
        </div>
      )}
    </div>
  );
}
