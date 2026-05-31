import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const initialAchievements: Achievement[] = [
  {
    id: "explorer-core",
    title: "Boot Complete",
    description: "Accessed the core root",
    unlocked: false,
  },
  {
    id: "explorer-swap",
    title: "Swap Engineer",
    description: "Visited the swap module",
    unlocked: false,
  },
  {
    id: "explorer-docs",
    title: "Manual Reader",
    description: "Read the system docs",
    unlocked: false,
  },
  {
    id: "explorer-lore",
    title: "Historian",
    description: "Discovered the lore book",
    unlocked: false,
  },
  {
    id: "game-snake",
    title: "Gamer",
    description: "Launched snake.exe",
    unlocked: false,
  },
  {
    id: "game-breakout",
    title: "Breaker",
    description: "Launched breakout.exe",
    unlocked: false,
  },
  {
    id: "secret-dxm",
    title: "The Architect",
    description: "Discovered the DxM Protocol",
    unlocked: false,
  },
];

interface AchievementsContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAndUnlockRoute: (route: string) => void;
  newUnlock: Achievement | null;
  clearNewUnlock: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem("nullclawb-achievements");
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch {
      return initialAchievements;
    }
  });
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    localStorage.setItem("nullclawb-achievements", JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        const updated = prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
        const unlockedAchievement = updated.find(a => a.id === id);
        if (unlockedAchievement) {
          setNewUnlock(unlockedAchievement);
        }
        return updated;
      }
      return prev;
    });
  };

  const checkAndUnlockRoute = (route: string) => {
    if (route === "/" || route === "") unlockAchievement("explorer-core");
    if (route.includes("swap")) unlockAchievement("explorer-swap");
    if (route.includes("docs")) unlockAchievement("explorer-docs");
    if (route.includes("lore")) unlockAchievement("explorer-lore");
  };

  const clearNewUnlock = () => setNewUnlock(null);

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement, checkAndUnlockRoute, newUnlock, clearNewUnlock }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error("useAchievements must be used within an AchievementsProvider");
  }
  return context;
}
