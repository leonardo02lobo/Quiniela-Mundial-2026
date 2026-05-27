"use client";

import { cn } from "@/lib/utils";
import { stages, type Stage } from "@/data/bracket";

interface StageNavProps {
  active: Stage;
  onSelect: (s: Stage) => void;
  /** Map of stage -> { predicted, total } */
  counts: Partial<Record<Stage, { predicted: number; total: number }>>;
}

/**
 * Horizontal stage selector. A ledger row of stage tabs with a numeric
 * ratio underneath each — feels like a printed scoresheet's column
 * headers. NOT pill tabs. Sharp underline accent when active.
 */
export function StageNav({ active, onSelect, counts }: StageNavProps) {
  return (
    <nav
      aria-label="Fases eliminatorias"
      className="border border-rule bg-paper"
    >
      <div className="grid grid-cols-6">
        {stages.map((stage, idx) => {
          const isActive = stage.id === active;
          const c = counts[stage.id];
          const done = c?.predicted ?? 0;
          const total = c?.total ?? 0;
          const allDone = total > 0 && done === total;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelect(stage.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group/tab relative flex flex-col items-center justify-center gap-1 py-3 px-1 text-center transition-colors",
                idx > 0 && "border-l border-rule",
                isActive ? "bg-paper" : "bg-floodlight hover:bg-paper-hover",
              )}
            >
              <span
                className={cn(
                  "font-display text-[10px] font-medium uppercase tracking-[0.18em] sm:text-xs",
                  isActive ? "text-ink" : "text-ink-muted",
                )}
              >
                {shortLabel(stage.id)}
              </span>
              <span
                className={cn(
                  "font-display nums text-[11px] font-semibold tabular-nums sm:text-xs",
                  allDone ? "text-pitch" : isActive ? "text-ink" : "text-ink-faint",
                )}
              >
                {done}
                <span className="text-ink-faint">/{total}</span>
              </span>
              {/* underline accent for active */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[2px]",
                  isActive ? "bg-ink" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function shortLabel(s: Stage): string {
  switch (s) {
    case "R32":
      return "16avos";
    case "R16":
      return "Octavos";
    case "QF":
      return "Cuartos";
    case "SF":
      return "Semis";
    case "3RD":
      return "3°";
    case "FINAL":
      return "Final";
  }
}
