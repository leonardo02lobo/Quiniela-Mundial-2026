"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePredictionsStore } from "@/lib/store/predictions";
import { groupIds } from "@/data/tournament";
import {
  allMatches,
  stages,
  type Stage,
  TOTAL_MATCHES,
} from "@/data/bracket";
import {
  countPredictedMatches,
  isBestThirdsComplete,
  isGroupOrderComplete,
  resolveAllMatches,
} from "@/lib/knockout";
import { MatchCard } from "@/components/features/knockout/match-card";
import { StageNav } from "@/components/features/knockout/stage-nav";
import { StageFooterNav } from "@/components/features/knockout/stage-footer-nav";
import { EmptyState } from "@/components/features/knockout/empty-state";
import { BracketProgress } from "@/components/features/knockout/bracket-progress";

export default function KnockoutPredictionPage() {
  const groupOrder = usePredictionsStore((s) => s.groupOrder);
  const bestThirds = usePredictionsStore((s) => s.bestThirds);
  const knockoutPicks = usePredictionsStore((s) => s.knockoutPicks);

  const groupsDone = useMemo(
    () =>
      groupIds.filter((g) => {
        const arr = groupOrder[g];
        return Array.isArray(arr) && arr.length === 4;
      }).length,
    [groupOrder],
  );
  const groupsComplete = isGroupOrderComplete(groupOrder);
  const bestThirdsCount = bestThirds.length;
  const bestThirdsOk = isBestThirdsComplete(bestThirds);

  const prereqMet = groupsComplete && bestThirdsOk;

  // Resolve only when prerequisites are met. Otherwise the page renders the
  // deferral panel and we don't need (or want) to compute a partial bracket.
  const resolved = useMemo(
    () =>
      prereqMet
        ? resolveAllMatches({ groupOrder, bestThirds, knockoutPicks })
        : [],
    [prereqMet, groupOrder, bestThirds, knockoutPicks],
  );

  const predicted = useMemo(
    () => countPredictedMatches(knockoutPicks),
    [knockoutPicks],
  );

  // Per-stage counts for the StageNav badge.
  const counts = useMemo(() => {
    const result: Partial<Record<Stage, { predicted: number; total: number }>> = {};
    for (const s of stages) {
      const stageMatches = allMatches.filter((m) => m.stage === s.id);
      const total = stageMatches.length;
      let done = 0;
      for (const m of stageMatches) {
        const p = knockoutPicks[m.id];
        if (
          p &&
          Number.isFinite(p.homeScore) &&
          Number.isFinite(p.awayScore) &&
          p.homeScore !== p.awayScore
        ) {
          done += 1;
        }
      }
      result[s.id] = { predicted: done, total };
    }
    return result;
  }, [knockoutPicks]);

  const [activeStage, setActiveStage] = useState<Stage>("R32");

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="mb-6 border-b border-rule pb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-pitch">
          Paso 3 de 3 · Eliminatorias
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Predice cada partido
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          Elige un marcador sin empate para los {TOTAL_MATCHES} partidos eliminatorios.
          Los ganadores avanzan; los perdedores de las semifinales se enfrentan en el
          partido por el tercer puesto.
        </p>
      </header>

      {!prereqMet ? (
        <EmptyState
          groupsComplete={groupsComplete}
          groupsDone={groupsDone}
          groupsTotal={groupIds.length}
          bestThirdsComplete={bestThirdsOk}
          bestThirdsCount={bestThirdsCount}
        />
      ) : (
        <>
          {/* Progress + stage nav stacked. Stage nav owns its own border so
              the two read as adjacent ledger blocks. */}
          <div className="space-y-3">
            <BracketProgress predicted={predicted} />
            <StageNav
              active={activeStage}
              onSelect={setActiveStage}
              counts={counts}
            />
          </div>

          {/* Active stage detail */}
          <StageDetail stage={activeStage} resolved={resolved} />

          {/* Bottom stage navigation — prev/next, Go back hidden on R32 */}
          <StageFooterNav active={activeStage} onSelect={setActiveStage} />
        </>
      )}
    </section>
  );
}

/* -------- Stage detail rendering --------------------------------------- */

function StageDetail({
  stage,
  resolved,
}: {
  stage: Stage;
  resolved: ReturnType<typeof resolveAllMatches>;
}) {
  const matches = resolved.filter((r) => r.match.stage === stage);
  const meta = stages.find((s) => s.id === stage);

  // Final + 3rd-place are single matches — give them a roomier, hero-style
  // layout. Other stages render a 2-column grid that breathes on desktop.
  const isSingleMatch = stage === "FINAL" || stage === "3RD";

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Fase
          </span>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
            {meta?.label}
          </h2>
        </div>
        <span className="hidden font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint sm:inline">
          {meta?.subtitle}
        </span>
      </div>

      {isSingleMatch ? (
        <div className={stage === "FINAL" ? "mx-auto max-w-3xl" : "max-w-2xl"}>
          {matches.map((r) => (
            <MatchCard
              key={r.match.id}
              resolved={r}
              variant={stage === "FINAL" ? "final" : "default"}
            />
          ))}
          {stage === "FINAL" && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  toast.success("¡Quiniela guardada!", {
                    description: "Tus pronósticos están a salvo.",
                  })
                }
                className="border-2 border-ink bg-gold px-10 py-4 font-display text-base font-bold uppercase tracking-[0.18em] text-ink transition-all hover:brightness-95 active:brightness-90"
              >
                Guardar Quiniela
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {matches.map((r) => (
            <MatchCard key={r.match.id} resolved={r} />
          ))}
        </div>
      )}
    </div>
  );
}
