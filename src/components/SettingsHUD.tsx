import { useState } from "react";
import { useSettings, type Theme } from "../hooks/use-settings";

const themes: { value: Theme; label: string }[] = [
  { value: "default", label: "NEON GREEN" },
  { value: "purple", label: "NEON PURPLE" },
  { value: "matrix", label: "MATRIX BLUE" },
  { value: "vaporwave", label: "VAPORWAVE" },
];

export function SettingsHUD() {
  const { settings, setSettings } = useSettings();
  const [show, setShow] = useState(false);

  return (
    <>
      {/* Toggle button — desktop: bottom-left above CLI, mobile: top-right to avoid CLI overlap */}
      <button
        onClick={() => setShow(!show)}
        className="pointer-events-auto fixed z-50 hud-border bg-background/90 backdrop-blur-sm px-3 py-2 text-[10px] uppercase tracking-widest text-neon hover:bg-neon/10 transition-colors left-4 bottom-14 md:bottom-14"
      >
        {show ? "[ HIDE SETTINGS ]" : "[ SETTINGS ]"}
      </button>

      {/* Settings panel — responsive positioning */}
      {show && (
        <>
          {/* Mobile overlay to dismiss */}
          <div
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setShow(false)}
          />
          <div className="pointer-events-auto fixed z-50 hud-border bg-background/95 backdrop-blur-sm p-4 w-[min(92vw,288px)] left-4 bottom-20 md:bottom-20">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-neon glow-neon">
              OS.SETTINGS
            </div>

            {/* Theme Selector */}
            <div className="mb-4">
              <div className="text-[10px] text-muted-foreground mb-2">
                THEME
              </div>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSettings({ ...settings, theme: theme.value })}
                    className={`px-2 py-1.5 text-[9px] uppercase border transition-all ${
                      settings.theme === theme.value
                        ? "border-neon text-neon bg-neon/10"
                        : "border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CRT Intensity */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>CRT INTENSITY</span>
                <span>{settings.crtIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.crtIntensity}
                onChange={(e) =>
                  setSettings({ ...settings, crtIntensity: Number(e.target.value) })
                }
                className="w-full h-2 bg-void accent-neon cursor-pointer"
              />
            </div>

            {/* Matrix Rain */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>MATRIX RAIN</span>
                <span>{settings.matrixRain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.matrixRain}
                onChange={(e) =>
                  setSettings({ ...settings, matrixRain: Number(e.target.value) })
                }
                className="w-full h-2 bg-void accent-neon cursor-pointer"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">SOUND FX</span>
              <button
                onClick={() =>
                  setSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                }
                className={`px-3 py-1 text-[10px] uppercase border transition-colors ${
                  settings.soundEnabled
                    ? "border-neon text-neon"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {settings.soundEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
