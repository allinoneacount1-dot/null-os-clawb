import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { SnakeGame } from "./SnakeGame";
import { BreakoutGame } from "./BreakoutGame";
import { useSettings, type Theme } from "../hooks/use-settings";
import { useAchievements } from "../hooks/use-achievements";
import { playBeep } from "./SoundManager";

type Cmd = { input: string; output: string; ok: boolean };

const THEMES: Record<string, Theme> = {
  "neon-green": "default",
  "default": "default",
  "green": "default",
  "purple": "purple",
  "neon-purple": "purple",
  "matrix": "matrix",
  "matrix-blue": "matrix",
  "blue": "matrix",
  "vaporwave": "vaporwave",
  "vapor": "vaporwave",
};

const ROUTES: Record<string, string> = {
  "/": "/",
  "/swap": "/swap",
  "/purge": "/purge",
  "/passport": "/passport",
  "/docs": "/docs",
  "/lore": "/lore",
  "swap": "/swap",
  "purge": "/purge",
  "passport": "/passport",
  "docs": "/docs",
  "lore": "/lore",
  "home": "/",
  "core": "/",
  "root": "/",
};

const ALL_COMMANDS = Array.from(new Set([
  "help", "ls", "clear", "cd", "execute",
  "status", "wallet", "swap", "achievements", "ach",
  "/", "/swap", "/purge", "/passport", "/docs", "/lore",
  "core", "swap", "purge", "passport", "docs", "lore", "home", "root",
  "sys.override --target:dxm",
  "purge.exe", "snake.exe", "breakout.exe",
  "theme", "theme default", "theme purple", "theme matrix", "theme vaporwave",
  "konami", "iddqd", "idkfa", "secret", "secrets", "cow", "cowsay", "party",
  "discord", "join discord", "telegram", "join telegram"
]));

const HELP = [
  "AVAILABLE COMMANDS:",
  "  cd /<dir>          jump module  (swap | purge | passport | docs | lore | core)",
  "  execute <game>.exe launch mini-game  (snake | breakout)",
  "  status             system status report",
  "  wallet             wallet info",
  "  discord            join Discord community",
  "  telegram           join Telegram community",
  "  theme [name]       change OS theme (default | purple | matrix | vaporwave)",
  "  crt <0-100>        set CRT intensity",
  "  matrix <0-100>     set matrix rain intensity",
  "  achievements/ach   view achievements",
  "  ls                 list modules",
  "  clear              wipe buffer",
  "  [Tab]              autocomplete command",
  "  [↑/↓]              navigate history",
].join("\n");

export function FloatingCLI() {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const { achievements, unlockAchievement } = useAchievements();
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<Cmd[]>([
    { input: "", output: "null_clawb shell v0.9 — type `help`", ok: true },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchingHistory, setSearchingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [showBreakoutGame, setShowBreakoutGame] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const triggerGlitch = () => {
    const el = document.getElementById("os-window");
    if (!el) return;
    el.classList.remove("glitch-transition");
    void el.offsetWidth;
    el.classList.add("glitch-transition");
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    let out: Cmd;
    if (settings.soundEnabled) playBeep(700, 0.03, "square");

    // Easter egg: DxM Protocol
    if (cmd === "sys.override --target:dxm" || cmd.includes("dxm")) {
      out = { 
        input: raw, 
        output: [
          "[ WARNING: VEIL TEARING DETECTED ]",
          "9 FPS PHYSICS DEFED.",
          "THE VOID REVEALS ITS SECRET...",
          "",
          "DxM = Death by Moonlight",
          "",
          "The architect did not die. He ascended.",
          "He is still here. Watching. Waiting.",
          "Your terminal has been marked.",
          "",
          "[ SYSTEM OVERRIDE: COMPLETE ]",
          ">>> Welcome to the other side."
        ].join("\n"), 
        ok: true 
      };
      unlockAchievement("secret-dxm");
      // Extra glitch effect
      for (let i = 0; i < 3; i++) {
        setTimeout(() => triggerGlitch(), i * 150);
      }
    }
    // Theme command
    else if (cmd.startsWith("theme")) {
      const parts = cmd.split(" ");
      const themeArg = parts[1];
      
      if (!themeArg) {
        out = { 
          input: raw, 
          output: [
            "=== AVAILABLE THEMES ===",
            "  default (neon-green)",
            "  purple (neon-purple)",
            "  matrix (matrix-blue)",
            "  vaporwave",
            "",
            "Usage: theme [theme-name]"
          ].join("\n"), 
          ok: true 
        };
      } else if (THEMES[themeArg]) {
        const newTheme = THEMES[themeArg];
        setSettings({ ...settings, theme: newTheme });
        out = { 
          input: raw, 
          output: `>>> Theme changed to: ${newTheme.toUpperCase()}`, 
          ok: true 
        };
        triggerGlitch();
      } else {
        out = { 
          input: raw, 
          output: `Unknown theme: ${themeArg} — type 'theme' to see available themes`, 
          ok: false 
        };
      }
    }
    // Easter egg: Konami code & Doom cheats
    else if (cmd === "konami" || cmd === "iddqd" || cmd === "idkfa") {
      out = { 
        input: raw, 
        output: [
          "🎮 GOD MODE ACTIVATED",
          "",
          "idkfa: All weapons and ammo",
          "iddqd: God mode (Doom)",
          "konami: Up Up Down Down Left Right Left Right B A",
          "",
          "[ VOID PERMISSIONS GRANTED ]",
          ">>> You are now a terminal administrator."
        ].join("\n"), 
        ok: true 
      };
      triggerGlitch();
    }
    // Easter egg: Secrets (reveals secrets)
    else if (cmd === "secret" || cmd === "secrets") {
      out = { 
        input: raw, 
        output: [
          "🔒 DISCOVERED SECRETS:",
          "  1. Type 'konami' for god mode",
          "  2. Type 'dxm' to tear the veil",
          "  3. Try 'cow' for a surprise",
          "  4. 'matrix' for rain (also in settings)",
          "  5. 'party' to turn on party mode"
        ].join("\n"), 
        ok: true 
      };
    }
    // Easter egg: Cow (cowsay style)
    else if (cmd === "cow" || cmd === "cowsay") {
      out = { 
        input: raw, 
        output: [
          "       \\   ^__^",
          "        \\  (oo)\\_______",
          "           (__)\\       )\\/\\",
          "               ||----w |",
          "               ||     ||",
          "",
          "  The void cow says: 'You are nothing.'"
        ].join("\n"), 
        ok: true 
      };
    }
    // Easter egg: Party mode
    else if (cmd === "party" || cmd === "party mode") {
      out = { 
        input: raw, 
        output: [
          "🎉 PARTY MODE ACTIVATED!",
          "",
          ">>> The void is dancing.",
          ">>> But remember, you are still nothing."
        ].join("\n"), 
        ok: true 
      };
      for (let i = 0; i < 5; i++) {
        setTimeout(() => triggerGlitch(), i * 100);
      }
    }
    // Discord
    else if (cmd === "discord" || cmd === "join discord") {
      out = { 
        input: raw, 
        output: [
          "📡 CONNECTING TO DISCORD...",
          "",
          ">>> Join the null clawb community!",
          ">>> https://discord.gg/nullclawb (replace with your invite link)"
        ].join("\n"), 
        ok: true 
      };
      window.open("https://discord.gg/nullclawb", "_blank");
    }
    // Telegram
    else if (cmd === "telegram" || cmd === "join telegram") {
      out = { 
        input: raw, 
        output: [
          "📡 CONNECTING TO TELEGRAM...",
          "",
          ">>> Join the null clawb Telegram!",
          ">>> https://t.me/nullclawb"
        ].join("\n"), 
        ok: true 
      };
      window.open("https://t.me/nullclawb", "_blank");
    }
    else if (cmd === "help") out = { input: raw, output: HELP, ok: true };
    else if (cmd === "ls")
      out = { input: raw, output: "core/  swap/  purge/  passport/  docs/  lore/", ok: true };
    else if (cmd === "clear") {
      setHistory([]);
      setValue("");
      return;
    }
    else if (cmd === "status") {
      out = { 
        input: raw, 
        output: [
          "=== SYSTEM STATUS ===",
          "Void Temperature: ABSOLUTE ZERO",
          "FPS Lock: 9 FPS",
          "Escape Velocity: 52.4/85 SOL",
          "Ghost State: WATCHING",
          "Your Status: NOTHING",
          "",
          "[ SYSTEM NOMINAL ]"
        ].join("\n"), 
        ok: true 
      };
    }
    else if (cmd === "wallet") {
      out = { 
        input: raw, 
        output: [
          "=== WALLET STATUS ===",
          "Connection: Use identity HUD to connect",
          "Balance: Connect wallet to view",
          "$CLAWB: Connect wallet to view",
          "",
          "[ WALLET NOT FOUND ]"
        ].join("\n"), 
        ok: true 
      };
    }
    else if (cmd.startsWith("swap ")) {
      out = { 
        input: raw, 
        output: [
          "[ SWAP ENGINE INITIALIZING... ]",
          "Note: Swap engine requires wallet connection",
          "Migration to Jupiter V6 pending 85 SOL",
          "",
          "[ SWAP DELAYED ]"
        ].join("\n"), 
        ok: true 
      };
    }
    else if (cmd.startsWith("execute snake") || cmd === "snake.exe") {
      out = { 
        input: raw, 
        output: [
          "[ LAUNCHING SNAKE.EXE... ]",
          "> mounting /games/snake ...",
          "",
          "[ GAME READY: Press any arrow key to start! ]"
        ].join("\n"), 
        ok: true 
      };
      unlockAchievement("game-snake");
      setShowSnakeGame(true);
    }
    else if (cmd.startsWith("execute breakout") || cmd === "breakout.exe") {
      out = { 
        input: raw, 
        output: [
          "[ LAUNCHING BREAKOUT.EXE... ]",
          "> mounting /games/breakout ...",
          "",
          "[ GAME READY: Press any arrow key to start! ]"
        ].join("\n"), 
        ok: true 
      };
      unlockAchievement("game-breakout");
      setShowBreakoutGame(true);
    }
    else if (cmd === "achievements" || cmd === "ach") {
      const unlockedCount = achievements.filter(a => a.unlocked).length;
      const totalCount = achievements.length;
      const lines: string[] = [
        `=== ACHIEVEMENTS [${unlockedCount}/${totalCount}] ===`
      ];
      achievements.forEach(a => {
        const status = a.unlocked ? "✓" : "✗";
        const color = a.unlocked ? "[NEON]" : "[MUTED]";
        lines.push(`${status} ${a.title}`);
        if (a.unlocked) {
          lines.push(`   ${a.description}`);
        }
      });
      out = { input: raw, output: lines.join("\n"), ok: true };
    }
    else if (cmd.startsWith("crt ")) {
      const val = Number(cmd.slice(4));
      if (!isNaN(val) && val >= 0 && val <= 100) {
        setSettings({ ...settings, crtIntensity: val });
        out = { input: raw, output: `> CRT INTENSITY SET TO ${val}%`, ok: true };
      } else {
        out = { input: raw, output: "ERROR: Use 0-100", ok: false };
      }
    }
    else if (cmd.startsWith("matrix ")) {
      const val = Number(cmd.slice(7));
      if (!isNaN(val) && val >= 0 && val <= 100) {
        setSettings({ ...settings, matrixRain: val });
        out = { input: raw, output: `> MATRIX RAIN SET TO ${val}%`, ok: true };
      } else {
        out = { input: raw, output: "ERROR: Use 0-100", ok: false };
      }
    }
    else {
      const target =
        cmd.startsWith("cd ")
          ? cmd.slice(3).trim()
          : cmd.startsWith("execute ")
            ? cmd.slice(8).replace(".exe", "").trim()
            : cmd;
      const dest = ROUTES[target] ?? ROUTES[target.replace(/^\//, "")];
      if (dest) {
        out = { input: raw, output: `> mounting ${dest} ...`, ok: true };
        triggerGlitch();
        setTimeout(() => navigate({ to: dest }), 180);
      } else {
        out = { input: raw, output: `command not found: ${cmd}`, ok: false };
      }
    }
    setHistory((h) => [...h, out]);
    if (raw.trim()) {
      setCommandHistory((h) => [...h, raw.trim()]);
    }
    setHistoryIndex(-1);
    setValue("");
  };

  // Mobile keyboard avoidance: lift CLI above keyboard when visualViewport shrinks
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const diff = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(diff > 80 ? diff : 0); // only shift when keyboard is likely open
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  return (
    <div
      className="pointer-events-auto fixed z-50 mx-auto w-[min(96vw,360px)] transition-[bottom] duration-200 ease-out md:left-4 md:right-auto md:mx-0 md:w-[min(92vw,360px)]"
      style={{
        bottom: `calc(${16 + keyboardOffset}px)`,
        left: "8px",
        right: "8px",
      }}
    >
      <div className="hud-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-neon glow-neon">
            {searchingHistory ? "/// search_history (Ctrl+R)" : "/// cli_root"}
          </span>
          <span className="animate-blink">█</span>
        </div>
        <div ref={scrollRef} className="max-h-28 overflow-y-auto px-3 py-2 text-[11px] leading-relaxed md:max-h-40">
          {history.map((h, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {h.input && <div className="text-foreground/60">$ {h.input}</div>}
              <div className={h.ok ? "text-foreground/90" : "text-destructive"}>{h.output}</div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
          className="flex items-center gap-2 border-t border-border px-3 py-2"
        >
          <span className="text-neon">$</span>
          <input
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "r") {
                e.preventDefault();
                setSearchingHistory(!searchingHistory);
                if (!searchingHistory) {
                  setSearchQuery(value);
                }
              } else if (searchingHistory) {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSearchingHistory(false);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setSearchingHistory(false);
                  setSearchQuery("");
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const matches = commandHistory.filter(cmd => cmd.toLowerCase().includes(searchQuery.toLowerCase()));
                  if (matches.length > 0) {
                    const newIndex = historyIndex === -1 ? matches.length - 1 : Math.max(0, historyIndex - 1);
                    setHistoryIndex(newIndex);
                    setValue(matches[newIndex]);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const matches = commandHistory.filter(cmd => cmd.toLowerCase().includes(searchQuery.toLowerCase()));
                  if (matches.length > 0 && historyIndex !== -1) {
                    const newIndex = historyIndex + 1;
                    if (newIndex >= matches.length) {
                      setHistoryIndex(-1);
                      setValue("");
                    } else {
                      setHistoryIndex(newIndex);
                      setValue(matches[newIndex]);
                    }
                  }
                } else {
                  setSearchQuery(value);
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length > 0) {
                  const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                  setHistoryIndex(newIndex);
                  setValue(commandHistory[newIndex]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex !== -1) {
                  const newIndex = historyIndex + 1;
                  if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setValue("");
                  } else {
                    setHistoryIndex(newIndex);
                    setValue(commandHistory[newIndex]);
                  }
                }
              } else if (e.key === "Tab") {
                e.preventDefault();
                const input = value.toLowerCase();
                if (input) {
                  const matches = ALL_COMMANDS.filter(c => c.toLowerCase().startsWith(input));
                  if (matches.length === 1) {
                    setValue(matches[0]);
                  } else if (matches.length > 1) {
                    setHistory((h) => [...h, { input: "", output: "Matches: " + matches.join(", "), ok: true }]);
                  }
                }
              }
            }}
            placeholder="cd /swap"
            className="w-full bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </form>
      </div>
      {showSnakeGame && <SnakeGame onClose={() => setShowSnakeGame(false)} />}
      {showBreakoutGame && <BreakoutGame onClose={() => setShowBreakoutGame(false)} />}
    </div>
  );
}

const TREE: { hex: string; label: string; to: string }[] = [
  { hex: "0x00", label: "core", to: "/" },
  { hex: "0x1A", label: "swap", to: "/swap" },
  { hex: "0x2F", label: "purge", to: "/purge" },
  { hex: "0x3C", label: "passport", to: "/passport" },
  { hex: "0x4D", label: "docs", to: "/docs" },
  { hex: "0x6F", label: "lore", to: "/lore" },
];

export function DirectoryTree() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (to: string) => {
    navigate({ to });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop: fixed right side panel — always visible labels with hex prefix */}
      <div className="pointer-events-auto fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="hud-border bg-background/90 backdrop-blur-sm px-3 py-3 text-[10px] uppercase tracking-widest">
          <div className="mb-2 text-muted-foreground">sys_dir</div>
          <ul className="space-y-1.5">
            {TREE.map((t) => {
              const active = path === t.to;
              return (
                <li
                  key={t.to}
                  onClick={() => handleNav(t.to)}
                  className={`group cursor-pointer transition-colors duration-150 ${
                    active ? "text-neon glow-neon" : "text-foreground/40 hover:text-solana"
                  }`}
                >
                  <span className="mr-2 text-muted-foreground/60 font-mono">{t.hex}</span>
                  <span className={active ? "text-neon glow-neon" : "group-hover:text-solana transition-colors"}>
                    {t.label}
                  </span>
                  {active && <span className="ml-1 animate-blink">█</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Mobile: hamburger button + bottom sheet — doesn't overlap CLI */}
      <div className="md:hidden">
        {/* Hamburger toggle — positioned bottom-right, offset from CLI */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="pointer-events-auto fixed bottom-20 right-3 z-50 hud-border bg-background/90 backdrop-blur-sm px-3 py-2 text-neon hover:bg-neon/10 transition-colors"
          aria-label="Toggle navigation"
        >
          <div className="flex flex-col gap-1">
            <span className={`block h-[2px] w-4 bg-neon transition-transform duration-200 ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-4 bg-neon transition-opacity duration-200 ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`block h-[2px] w-4 bg-neon transition-transform duration-200 ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </div>
        </button>

        {/* Bottom sheet overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Bottom sheet panel */}
        <div
          className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-4 pt-4 pb-8">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-neon glow-neon">/// sys_dir</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                [ close ]
              </button>
            </div>
            <ul className="space-y-0">
              {TREE.map((t) => {
                const active = path === t.to;
                return (
                  <li key={t.to}>
                    <button
                      onClick={() => handleNav(t.to)}
                      className={`flex w-full items-center gap-3 px-2 py-3 text-left text-xs uppercase tracking-wider transition-colors ${
                        active
                          ? "text-neon glow-neon bg-neon/5"
                          : "text-foreground/50 hover:text-solana hover:bg-void/30 active:bg-void/40"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground/50">{t.hex}</span>
                      <span>{t.label}</span>
                      {active && <span className="ml-auto text-neon animate-blink">█</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export function Scanline() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      <div className="absolute left-0 h-px w-full bg-neon/30 animate-scanline" />
    </div>
  );
}
