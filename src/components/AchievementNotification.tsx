import { useEffect } from "react";
import { useAchievements } from "../hooks/use-achievements";
import { useSettings } from "../hooks/use-settings";
import { playBeep } from "./SoundManager";

export function AchievementNotification() {
  const { newUnlock, clearNewUnlock } = useAchievements();
  const { settings } = useSettings();

  useEffect(() => {
    if (newUnlock) {
      if (settings.soundEnabled) {
        playBeep(880, 0.1, "square");
        setTimeout(() => playBeep(1100, 0.15, "square"), 100);
        setTimeout(() => playBeep(1320, 0.2, "square"), 200);
      }
      const timer = setTimeout(() => {
        clearNewUnlock();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [newUnlock, clearNewUnlock, settings.soundEnabled]);

  if (!newUnlock) return null;

  return (
    <div className="pointer-events-auto fixed top-20 right-3 z-[100] hud-border p-4 animate-glitch-shift max-w-xs">
      <div className="text-xs uppercase tracking-widest text-neon glow-neon mb-1">
        ACHIEVEMENT UNLOCKED
      </div>
      <div className="text-stark font-bold mb-1">{newUnlock.title}</div>
      <div className="text-muted-foreground text-xs">{newUnlock.description}</div>
    </div>
  );
}
