"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { groupIds, teamById } from "@/data/tournament";
import { usePredictionsStore } from "@/lib/store/predictions";
import { PickRow } from "@/components/features/best-thirds/pick-row";
import { TiebreakerNote } from "@/components/features/best-thirds/tiebreaker-note";
import { cn } from "@/lib/utils";
import type { GroupId } from "@/types/domain";

const TARGET = 8;
const TOTAL_GROUPS = 12;

interface Candidate {
  group: GroupId;
  teamId: string;
  code: string;
  name: string;
  flagUrl: string;
}

export default function BestThirdsPage() {
  // Hydration guard — Zustand persist needs the client to be mounted before reading.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const groupOrder = usePredictionsStore((s) => s.groupOrder);
  const storedBestThirds = usePredictionsStore((s) => s.bestThirds);
  const setBestThirds = usePredictionsStore((s) => s.setBestThirds);

  // Local selection mirrors the store but updates instantly per click.
  const [selected, setSelected] = useState<string[]>([]);

  // Hydrate selection on mount.
  useEffect(() => {
    if (hydrated) {
      setSelected(storedBestThirds);
    }
    // We deliberately depend only on hydrated to seed once from the persisted value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Build the candidate list: index 2 of each ordered group.
  const { candidates, completedGroups } = useMemo(() => {
    const list: Candidate[] = [];
    let completed = 0;
    for (const g of groupIds) {
      const order = groupOrder[g];
      if (order && order.length >= 4) {
        completed += 1;
        const t = teamById(order[2]);
        if (t) {
          list.push({
            group: g,
            teamId: t.id,
            code: t.code,
            name: t.name,
            flagUrl: t.flagUrl,
          });
        }
      }
    }
    return { candidates: list, completedGroups: completed };
  }, [groupOrder]);

  const isComplete = candidates.length === TOTAL_GROUPS;
  const count = selected.length;
  const atLimit = count >= TARGET;

  const onToggle = (teamId: string) => {
    setSelected((curr) => {
      if (curr.includes(teamId)) {
        const next = curr.filter((id) => id !== teamId);
        setBestThirds(next);
        return next;
      }
      if (curr.length >= TARGET) return curr;
      const next = [...curr, teamId];
      setBestThirds(next);
      return next;
    });
  };

  // Avoid SSR/CSR mismatch — render a stable skeleton until store is hydrated.
  if (!hydrated) {
    return <PageShell><HeaderBlock counter={0} /></PageShell>;
  }

  if (!isComplete) {
    return (
      <PageShell>
        <HeaderBlock counter={count} />
        <EmptyState completedGroups={completedGroups} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeaderBlock counter={count} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c) => {
          const isSelected = selected.includes(c.teamId);
          const isDisabled = !isSelected && atLimit;
          return (
            <PickRow
              key={c.teamId}
              group={c.group}
              teamId={c.teamId}
              teamCode={c.code}
              teamName={c.name}
              flagUrl={c.flagUrl}
              selected={isSelected}
              disabled={isDisabled}
              onToggle={onToggle}
            />
          );
        })}
      </div>

      {atLimit && (
        <p className="mt-4 font-display text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Ocho seleccionados · Deselecciona uno para elegir otro
        </p>
      )}

      <div className="mt-8">
        <TiebreakerNote />
      </div>

      <CtaFooter ready={count === TARGET} count={count} />
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</section>
  );
}

function HeaderBlock({ counter }: { counter: number }) {
  const reached = counter === TARGET;
  return (
    <header className="mb-8 border-b border-rule pb-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-pitch">
            Paso 2 de 3 · Mejores Terceros
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            Elige los ocho que avanzan
          </h1>
          <p className="mt-2 max-w-prose text-sm text-ink-muted">
            Doce grupos, doce terceros lugares. Solo ocho llegan a los dieciseisavos
            de final. Elige los ocho en los que confías por desempate.
          </p>
        </div>

        {/* Counter — broadcast scoreline framing */}
        <div className="border border-rule bg-paper">
          <div className="border-b border-rule bg-floodlight px-3 py-1 text-center font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Seleccionados
          </div>
          <div className="flex items-baseline gap-1 px-4 py-2">
            <span
              className={cn(
                "font-display nums text-3xl font-bold leading-none transition-colors",
                reached ? "text-pitch" : "text-ink",
              )}
              aria-live="polite"
            >
              {counter}
            </span>
            <span className="font-display nums text-base font-medium text-ink-faint">/</span>
            <span className="font-display nums text-base font-medium text-ink-faint">
              {TARGET}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ completedGroups }: { completedGroups: number }) {
  return (
    <div className="border border-rule bg-paper">
      <div className="border-b border-rule bg-floodlight px-5 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        Pendiente · Fase de Grupos
      </div>

      <div className="px-5 py-10 sm:px-8 sm:py-12">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
          Completa primero la fase de grupos
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          Los terceros lugares se toman del orden que diste a la fase de grupos. Una
          vez que cada grupo tenga su orden 1-2-3-4, podrás elegir los ocho mejores
          terceros.
        </p>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-display nums text-4xl font-bold leading-none text-ink">
            {completedGroups}
          </span>
          <span className="font-display text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            de {TOTAL_GROUPS} grupos ordenados
          </span>
        </div>

        {/* Progress bars: one per group, hairline filled vs empty */}
        <div className="mt-3 grid grid-cols-12 gap-1" aria-hidden="true">
          {Array.from({ length: TOTAL_GROUPS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 border",
                i < completedGroups
                  ? "border-pitch bg-pitch"
                  : "border-rule bg-floodlight",
              )}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-rule bg-floodlight px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Paso 1 — Ordena cada grupo
        </span>
        <Link
          href="/predictions/groups"
          className="border border-ink bg-ink px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-chalk hover:bg-card-red hover:border-card-red"
        >
          Ir a Fase de Grupos
        </Link>
      </div>
    </div>
  );
}

function CtaFooter({ ready, count }: { ready: boolean; count: number }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
      <p className="font-display text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        {ready ? (
          <>Ocho confirmados · Continúa cuando quieras</>
        ) : (
          <>
            <span className="text-ink">{TARGET - count}</span> más por seleccionar
          </>
        )}
      </p>

      {ready ? (
        <Link
          href="/predictions/knockout"
          className="border border-ink bg-ink px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-chalk hover:bg-card-red hover:border-card-red"
        >
          Continuar a Eliminatorias
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="cursor-not-allowed border border-rule bg-paper px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-faint"
        >
          Continuar a Eliminatorias
        </span>
      )}
    </div>
  );
}
