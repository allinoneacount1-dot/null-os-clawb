import { useMemo } from "react";

// GitHub-style "Void Graph" — neon contribution grid floating in black space.
export function VoidGraph() {
  const cells = useMemo(() => {
    const weeks = 26;
    const days = 7;
    return Array.from({ length: weeks * days }, (_, i) => {
      const r = Math.random();
      let level = 0;
      if (r > 0.86) level = 4;
      else if (r > 0.72) level = 3;
      else if (r > 0.55) level = 2;
      else if (r > 0.4) level = 1;
      return { i, level };
    });
  }, []);

  const opacity = [0.06, 0.25, 0.5, 0.75, 1];

  return (
    <div className="select-none">
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: "repeat(26, minmax(0, 1fr))", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)" }}
      >
        {cells.map((c) => (
          <div
            key={c.i}
            className="aspect-square w-2.5 md:w-3"
            style={{
              backgroundColor: "var(--color-neon)",
              opacity: opacity[c.level],
              boxShadow: c.level >= 3 ? "0 0 6px var(--color-neon)" : "none",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-widest text-muted-foreground">
        <span>void_activity.log</span>
        <span className="text-neon">+0 commits to existence</span>
      </div>
    </div>
  );
}
