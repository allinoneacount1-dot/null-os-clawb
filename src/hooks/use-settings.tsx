import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "default" | "purple" | "matrix" | "vaporwave";

interface HighScores {
  snake: number;
  breakout: number;
}

interface Settings {
  crtIntensity: number;
  matrixRain: number;
  soundEnabled: boolean;
  theme: Theme;
  highScores: HighScores;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  crtIntensity: 50,
  matrixRain: 0,
  soundEnabled: false,
  theme: "default",
  highScores: {
    snake: 0,
    breakout: 0,
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("nullclawb-settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem("nullclawb-settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
