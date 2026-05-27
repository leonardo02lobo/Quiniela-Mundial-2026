"use client";

import { TOTAL_MATCHES } from "@/data/bracket";

interface BracketProgressProps {
  predicted: number;
}

/**
 * Top-of-page tally. Same printed-scoreboard cadence as the group
 * progress indicator but tuned to 32 segments and broken into stage
 * groupings (16 / 8 / 4 / 2 / 1 / 1).
 */
export function BracketProgress({ predicted }: BracketProgressProps) {
  const total = TOTAL_MATCHES;
  const allDone = predicted === total;

  return (
    <div className="border border-rule bg-paper">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule bg-floodlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Progreso
          </span>
          <span className="font-display nums text-2xl font-bold tabular-nums leading-none text-ink">
            {predicted}
            <span className="text-ink-faint"> / {total}</span>
          </span>
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Partidos pronosticados
          </span>
        </div>
        <span
          className={
            allDone
              ? "font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-pitch"
              : "font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint"
          }
        >
          {allDone ? "Cuadro completo" : "Ingresa un marcador para cada partido"}
        </span>
      </div>
    </div>
  );
}
