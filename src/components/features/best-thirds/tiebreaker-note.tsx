"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const criteria = [
  { n: "01", label: "Puntos", detail: "3 por victoria, 1 por empate, 0 por derrota." },
  { n: "02", label: "Diferencia de goles", detail: "Goles a favor menos goles en contra en los tres partidos." },
  { n: "03", label: "Goles a favor", detail: "El equipo que marcó más en la fase de grupos avanza." },
  { n: "04", label: "Conducta", detail: "Puntos negativos netos por tarjetas amarillas/rojas (Juego Limpio FIFA)." },
  { n: "05", label: "Ranking FIFA", detail: "Posición en el Ranking Mundial FIFA / Coca-Cola como desempate final." },
];

export function TiebreakerNote() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="border border-rule bg-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 bg-floodlight px-4 py-2.5 text-left transition-colors hover:bg-paper-hover"
      >
        <span className="flex items-baseline gap-3">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-pitch">
            FIFA · Desempates
          </span>
          <span className="font-display text-xs font-medium uppercase tracking-[0.16em] text-ink">
            ¿Por qué estos 8?
          </span>
        </span>
        <span
          className={cn(
            "font-display text-xs font-medium uppercase tracking-[0.16em] text-ink-faint",
            open && "text-ink",
          )}
          aria-hidden="true"
        >
          {open ? "Ocultar" : "Mostrar"}
        </span>
      </button>

      {open && (
        <ol className="divide-y divide-rule border-t border-rule">
          {criteria.map((c) => (
            <li key={c.n} className="flex items-start gap-4 px-4 py-3">
              <span className="font-display nums text-xs font-bold text-ink-faint tracking-[0.10em]">
                {c.n}
              </span>
              <span className="flex-1">
                <span className="block font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                  {c.label}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">{c.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="border-t border-rule bg-floodlight px-4 py-2 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
        El torneo real los aplica en este orden · Tus picks solo deben coincidir con el resultado
      </p>
    </aside>
  );
}
