"use client";

import { groupIds } from "@/data/tournament";
import { usePredictionsStore } from "@/lib/store/predictions";

/**
 * "X of 12 groups ordered" — printed-scoreboard tally with a 12-segment
 * horizontal rule underneath. Each lit segment is a completed group.
 */
export function ProgressIndicator() {
  const groupOrder = usePredictionsStore((s) => s.groupOrder);

  const completed = groupIds.filter((id) => {
    const arr = groupOrder[id];
    return Array.isArray(arr) && arr.length === 4;
  });
  const done = completed.length;
  const total = groupIds.length;
  const allDone = done === total;

  return (
    <div className="border border-rule bg-paper">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule bg-floodlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Progreso
          </span>
          <span className="font-display nums text-2xl font-bold tabular-nums leading-none text-ink">
            {done}
            <span className="text-ink-faint"> / {total}</span>
          </span>
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Grupos Ordenados
          </span>
        </div>
        <span
          className={
            allDone
              ? "font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-pitch"
              : "font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint"
          }
        >
          {allDone ? "Listo · Continuar" : "Arrastra los equipos para ordenar"}
        </span>
      </div>
      {/* 12-segment ledger rule */}
      <div className="grid grid-cols-12 gap-px bg-rule">
        {groupIds.map((id) => {
          const isDone = !!groupOrder[id] && groupOrder[id]!.length === 4;
          return (
            <div
              key={id}
              className={
                "flex items-center justify-center bg-paper py-1.5 font-display text-[10px] font-semibold uppercase " +
                (isDone ? "text-pitch" : "text-ink-faint")
              }
              aria-label={`Grupo ${id} ${isDone ? "ordenado" : "pendiente"}`}
            >
              {id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
