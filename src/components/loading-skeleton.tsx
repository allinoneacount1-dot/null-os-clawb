// src/components/loading-skeleton.tsx — Cyberpunk loading states (CSS only, no framer-motion)

export function BootScreen({ message = "null clawb kernel loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <div className="text-center">
        <pre className="text-[11px] leading-relaxed text-neon/90 glow-neon md:text-xs whitespace-pre-wrap animate-pulse">
          {message}{"\n"}█
        </pre>
        <div className="mt-4 h-1 bg-void rounded-full overflow-hidden w-48 mx-auto">
          <div className="h-full bg-neon rounded-full animate-loadbar" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`hud-border p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-2 w-16 rounded shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full rounded shimmer" />
        <div className="h-2 w-3/4 rounded shimmer" />
        <div className="h-2 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded shimmer"
          style={{ width: `${Math.max(40, 100 - i * 15)}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded shimmer" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-3 py-2" style={{ animationDelay: `${ri * 0.05}s` }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className="h-2.5 flex-1 rounded shimmer" style={{ width: `${Math.max(30, 80 - ci * 10)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCircle() {
  return <div className="w-16 h-16 rounded-full shimmer animate-pulse" />;
}

export function InlineLoader() {
  return (
    <span className="inline-block text-neon animate-blink">█</span>
  );
}
