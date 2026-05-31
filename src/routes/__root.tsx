import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FloatingCLI, DirectoryTree, Scanline } from "../components/os-hud";
import { WalletHUD } from "../components/wallet-hud";
import { AuthProvider } from "../hooks/use-auth";
import { MatrixRain } from "../components/MatrixRain";
import { SettingsHUD } from "../components/SettingsHUD";
import { SoundManager } from "../components/SoundManager";
import { AchievementNotification } from "../components/AchievementNotification";
import { SettingsProvider, useSettings } from "../hooks/use-settings";
import { AchievementsProvider, useAchievements } from "../hooks/use-achievements";
import { useRouterState } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  // Extract error code from ApiError or fallback
  const errorCode =
    error instanceof Error && "statusCode" in error
      ? `ERR_${(error as unknown as { statusCode: number }).statusCode}`
      : "ERR_UNKNOWN";

  const [glitching, setGlitching] = useState(false);

  const triggerRetry = () => {
    setGlitching(true);
    setTimeout(() => {
      router.invalidate();
      reset();
      setGlitching(false);
    }, 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
        <div className="absolute left-0 h-px w-full bg-destructive/30 animate-scanline" />
      </div>

      <div className={`max-w-md text-center ${glitching ? "glitch-transition" : ""}`}>
        {/* Error code stamp */}
        <div className="mb-4 inline-block border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-destructive/70">
          {errorCode}
        </div>

        {/* Glitch title */}
        <h1 className="relative text-2xl font-bold tracking-tight text-destructive md:text-3xl">
          <span className="relative inline-block">
            SYSTEM FAILURE
            <span className="absolute -left-[2px] top-[1px] text-neon/30 blur-[1px]">SYSTEM FAILURE</span>
            <span className="absolute left-[2px] top-[-1px] text-solana/20 blur-[1px]">SYSTEM FAILURE</span>
          </span>
        </h1>

        {/* Error message */}
        <p className="mt-3 text-sm text-muted-foreground">
          {error.message ?? "The void rejected this request."}
        </p>

        {/* Decorative broken terminal line */}
        <div className="mx-auto mt-4 max-w-xs border border-destructive/30 bg-void/40 px-3 py-2 text-left text-[10px] text-destructive/60">
          <span className="text-destructive/40">$</span> kernel.panic --reason=&quot;unhandled exception&quot;
          <br />
          <span className="text-destructive/40">&gt;</span> stack trace: {error.stack?.split("\n")[1]?.trim() ?? "unknown"}
          <br />
          <span className="animate-blink text-destructive">█</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={triggerRetry}
            className="inline-flex items-center justify-center border border-neon/60 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neon transition-colors duration-100 hover:bg-neon hover:text-background"
          >
            [ retry ]
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-muted-foreground/40 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            [ return to core ]
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "null clawb // $CLAWB OS" },
      { name: "description", content: "null clawb — an abandoned underground OS. Confirm you are nothing." },
      { name: "author", content: "null clawb" },
      { property: "og:title", content: "null clawb // $CLAWB OS" },
      { property: "og:description", content: "null clawb — an abandoned underground OS. Confirm you are nothing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@nullclawb" },
      { name: "twitter:title", content: "null clawb // $CLAWB OS" },
      { name: "twitter:description", content: "null clawb — an abandoned underground OS. Confirm you are nothing." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de2fba57-0369-4251-b1a7-cf27e8c684f6/id-preview-2c016e7c--73acdf0c-8e98-43f8-8197-201ca7dd1daf.lovable.app-1780154773792.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de2fba57-0369-4251-b1a7-cf27e8c684f6/id-preview-2c016e7c--73acdf0c-8e98-43f8-8197-201ca7dd1daf.lovable.app-1780154773792.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootContent() {
  const { settings, setSettings } = useSettings();
  const { checkAndUnlockRoute } = useAchievements();
  const routeState = useRouterState();

  // Check route for achievements
  useEffect(() => {
    checkAndUnlockRoute(routeState.location.pathname);
  }, [routeState.location.pathname, checkAndUnlockRoute]);

  // Apply theme class to document body
  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-purple", "theme-matrix", "theme-vaporwave");
    if (settings.theme !== "default") {
      body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme]);

  return (
    <div 
      className={`relative min-h-screen overflow-hidden bg-background grid-bg ${settings.theme !== "default" ? `theme-${settings.theme}` : ""}`}
      style={{ "--crt-intensity": settings.crtIntensity / 100 } as React.CSSProperties}
    >
      {/* Matrix Rain Background */}
      <MatrixRain intensity={settings.matrixRain} />

      {/* Achievement Notification */}
      <AchievementNotification />

      {/* Top-left persistent system stamp (no conventional navbar) */}
      <div className="pointer-events-none fixed left-4 top-3 z-40 select-none text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="text-neon glow-neon">null clawb</span>
        <span className="ml-2">$CLAWB // os.kernel</span>
      </div>

      {/* The active module renders as a floating window inside the OS */}
      <main id="os-window" className="relative z-10 min-h-screen">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>

      {/* Global persistent HUD layers */}
      <SoundManager />
      <Scanline />
      <WalletHUD />
      <DirectoryTree />
      <FloatingCLI />
      <SettingsHUD />
      <div className="crt-overlay" />
      <div className="crt-flicker" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <AchievementsProvider>
            <RootContent />
          </AchievementsProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

