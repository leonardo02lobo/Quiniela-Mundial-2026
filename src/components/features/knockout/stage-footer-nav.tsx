"use client";

import { stages, type Stage } from "@/data/bracket";
import { cn } from "@/lib/utils";

interface StageFooterNavProps {
  active: Stage;
  onSelect: (stage: Stage) => void;
}

/**
 * Bottom-of-page navigation for the knockout stages.
 * - "Go back" hidden on R32 (the first stage).
 * - "Continue" hides on FINAL (the last stage).
 * - Wraps to top on stage change so the user lands at the new stage header.
 */
export function StageFooterNav({ active, onSelect }: StageFooterNavProps) {
  const idx = stages.findIndex((s) => s.id === active);
  const prev = idx > 0 ? stages[idx - 1] : null;
  const next = idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : null;

  function go(stage: Stage) {
    onSelect(stage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <nav className="mt-8 flex flex-col items-stretch gap-3 border border-rule bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col">
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          Viendo actualmente
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.10em] text-ink">
          {stages[idx]?.label}
        </span>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
        {prev ? (
          <button
            type="button"
            onClick={() => go(prev.id)}
            className={cn(
              "border-2 border-ink bg-paper px-5 py-2.5 text-center",
              "font-display text-xs font-bold uppercase tracking-[0.16em] text-ink",
              "transition-colors hover:bg-paper-hover",
            )}
          >
            ← {prev.label}
          </button>
        ) : (
          <span
            aria-hidden
            className="hidden sm:block"
          />
        )}

        {next && (
          <button
            type="button"
            onClick={() => go(next.id)}
            className={cn(
              "border-2 border-ink bg-ink px-5 py-2.5 text-center",
              "font-display text-xs font-bold uppercase tracking-[0.16em] text-chalk",
              "transition-colors hover:bg-card-red hover:border-card-red",
            )}
          >
            {next.label} →
          </button>
        )}
      </div>
    </nav>
  );
}
