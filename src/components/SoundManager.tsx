import { useEffect, useRef } from "react";
import { useSettings } from "../hooks/use-settings";

// Reuse single AudioContext instance
let audioCtx: AudioContext | null = null;

export function playBeep(frequency = 800, duration = 0.1, type: OscillatorType = "square") {
  try {
    // Initialize AudioContext if not already created
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    // Resume if suspended (required for some browsers)
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function SoundManager() {
  const { settings } = useSettings();
  const hasPlayed = useRef(false);

  // Play a startup beep when sound is enabled
  useEffect(() => {
    if (settings.soundEnabled && !hasPlayed.current) {
      hasPlayed.current = true;
      playBeep(600, 0.05, "square");
      setTimeout(() => playBeep(800, 0.05, "square"), 50);
    }
  }, [settings.soundEnabled]);

  return null;
}
