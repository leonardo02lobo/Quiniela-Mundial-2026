"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePredictionsStore } from "@/lib/store/predictions";
import { TileBand } from "@/components/layout/tile-band";
import { ScoreInput } from "./score-input";
import type { ResolvedMatch, ResolvedSide } from "@/lib/knockout";

interface MatchCardProps {
  resolved: ResolvedMatch;
  /** "default" for ordinary matches, "final" for the Final hero card. */
  variant?: "default" | "final";
}

/**
 * Match card. 3-band hairline + Panini tile cap.
 *
 *   [tile band]         signature visual
 *   [floodlight header] stage label + FIFA match number
 *   [paper body]        scoreline band (left team | scores | right team)
 *   [floodlight footer] status: ADVANCES / TIE — ADJUST / PENDING
 *
 * The Final renders bigger and gets a hero treatment (thicker tile band,
 * "World Champion" tag when resolved).
 */
export function MatchCard({ resolved, variant = "default" }: MatchCardProps) {
  const { match, home, away, pick } = resolved;
  const setKnockoutPick = usePredictionsStore((s) => s.setKnockoutPick);

  const bothTeamsKnown = home.kind === "team" && away.kind === "team";
  const homeScore = pick?.homeScore ?? null;
  const awayScore = pick?.awayScore ?? null;
  const isTie = homeScore != null && awayScore != null && homeScore === awayScore;
  const isComplete = resolved.hasValidWinner;
  const isFinal = variant === "final";

  // Trigger the winner animation on the transition into "complete".
  const [justResolved, setJustResolved] = useState(false);
  const prevWinnerRef = useRef<string | null>(null);
  useEffect(() => {
    const winner = resolved.winnerTeamId ?? null;
    if (winner && winner !== prevWinnerRef.current) {
      setJustResolved(true);
      const t = setTimeout(() => setJustResolved(false), 800);
      prevWinnerRef.current = winner;
      return () => clearTimeout(t);
    }
    if (!winner) prevWinnerRef.current = null;
  }, [resolved.winnerTeamId]);

  function commit(side: "home" | "away", value: number | null) {
    const current = pick ?? { homeScore: 0, awayScore: 0 };
    if (side === "home") {
      setKnockoutPick(match.id, {
        homeScore: value ?? 0,
        awayScore: current.awayScore,
      });
    } else {
      setKnockoutPick(match.id, {
        homeScore: current.homeScore,
        awayScore: value ?? 0,
      });
    }
  }

  const homeWinning =
    isComplete &&
    home.kind === "team" &&
    resolved.winnerTeamId === home.team.id;
  const awayWinning =
    isComplete &&
    away.kind === "team" &&
    resolved.winnerTeamId === away.team.id;

  return (
    <article
      className={cn(
        "border border-rule bg-paper",
        isFinal && "border-2 border-ink",
        isComplete && !isFinal && "border-l-2 border-l-pitch",
        isTie && !isFinal && "border-l-2 border-l-card-yellow",
      )}
      aria-label={`${match.label} match card`}
    >
      {/* Panini tile cap */}
      <TileBand className={isFinal ? "h-3" : "h-1.5"} />

      {/* Header band */}
      <header className="flex items-center justify-between border-b border-rule bg-floodlight px-3 py-1.5">
        <div className="flex items-baseline gap-2">
          {!isFinal && <span
            className={cn(
              "font-display font-medium uppercase tracking-[0.22em] text-ink-faint",
              isFinal ? "text-xs" : "text-[10px]",
            )}
          >
            {stageLabel(match.stage)}
          </span>}
          <span
            className={cn(
              "font-display font-semibold uppercase tracking-[0.16em] text-ink",
              isFinal ? "text-sm" : "text-xs",
            )}
          >
            {localLabel(match.label)}
          </span>
        </div>
        <span
          className={cn(
            "font-display nums font-medium uppercase tracking-[0.16em] text-ink-faint",
            isFinal ? "text-xs" : "text-[10px]",
          )}
        >
          FIFA · P-{match.fifaNumber}
        </span>
      </header>

      {/* Body — the scoreline band. Signature element. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        <TeamPanel
          side="home"
          side_={home}
          winning={homeWinning}
          losing={isComplete && !homeWinning}
          justResolved={justResolved && homeWinning}
          variant={variant}
        />

        <div
          className={cn(
            "flex items-center justify-center",
            isFinal ? "px-4 py-6 sm:px-8 sm:py-10" : "px-2 py-3 sm:px-4",
          )}
        >
          <ScoreInput
            value={homeScore}
            side="home"
            disabled={!bothTeamsKnown}
            onCommit={(v) => commit("home", v)}
            ariaLabel={`${labelFor(home)} score`}
            size={isFinal ? "lg" : "md"}
          />
          <div
            aria-hidden
            className={cn(
              "flex items-center justify-center font-display font-light text-ink-faint",
              isFinal
                ? "h-24 w-6 text-3xl sm:h-32 sm:w-8 sm:text-4xl"
                : "h-14 w-5 text-xl sm:h-16",
            )}
          >
            –
          </div>
          <ScoreInput
            value={awayScore}
            side="away"
            disabled={!bothTeamsKnown}
            onCommit={(v) => commit("away", v)}
            ariaLabel={`${labelFor(away)} score`}
            size={isFinal ? "lg" : "md"}
          />
        </div>

        <TeamPanel
          side="away"
          side_={away}
          winning={awayWinning}
          losing={isComplete && !awayWinning}
          justResolved={justResolved && awayWinning}
          variant={variant}
        />
      </div>

      {/* Footer band — status microcopy */}
      <footer
        className={cn(
          "flex items-center justify-between border-t border-rule bg-floodlight px-3 py-1.5",
        )}
      >
        <StatusBadge
          state={
            !bothTeamsKnown
              ? "waiting"
              : isTie
                ? "tie"
                : isComplete
                  ? "complete"
                  : "pending"
          }
          isFinal={isFinal}
        />
        {isComplete && resolved.winnerTeamId && (
          <WinnerTag
            code={
              homeWinning && home.kind === "team"
                ? home.team.code
                : awayWinning && away.kind === "team"
                  ? away.team.code
                  : "—"
            }
            isFinal={isFinal}
            justResolved={justResolved}
          />
        )}
      </footer>

      {isFinal && <TileBand className="h-3" />}
    </article>
  );
}

/* -------- subcomponents ------------------------------------------------- */

function TeamPanel({
  side,
  side_,
  winning,
  losing,
  justResolved,
  variant,
}: {
  side: "home" | "away";
  side_: ResolvedSide;
  winning: boolean;
  losing: boolean;
  justResolved: boolean;
  variant: "default" | "final";
}) {
  const isLeft = side === "home";
  const isFinal = variant === "final";

  if (side_.kind === "placeholder") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-3 sm:px-4",
          isLeft ? "justify-end text-right" : "justify-start text-left",
        )}
      >
        <div className={cn("flex flex-col leading-tight", isLeft ? "items-end" : "items-start")}>
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            Por definir
          </span>
          <span className="max-w-[12ch] truncate text-[11px] text-ink-faint sm:max-w-[20ch]">
            {side_.label}
          </span>
        </div>
        <span
          aria-hidden
          className="size-7 shrink-0 rounded-full border border-dashed border-rule bg-floodlight"
        />
      </div>
    );
  }

  const t = side_.team;
  return (
    <div
      className={cn(
        "flex items-center gap-3 transition-all duration-300 ease-out",
        isFinal ? "px-4 py-5 gap-4 sm:px-6 sm:py-8" : "px-3 py-3 sm:px-4",
        isLeft
          ? "justify-end text-right flex-row"
          : "justify-start text-left flex-row-reverse",
        losing && "opacity-55",
        justResolved && "animate-winner-flash",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col leading-tight",
          isLeft ? "items-end" : "items-start",
        )}
      >
        <span
          className={cn(
            "font-display font-bold uppercase tracking-[0.10em] transition-colors duration-300",
            isFinal
              ? "text-2xl sm:text-3xl"
              : "text-base sm:text-lg",
            winning ? "text-pitch" : losing ? "text-ink-faint" : "text-ink",
          )}
        >
          {t.code}
        </span>
        <span
          className={cn(
            "truncate transition-colors duration-300",
            isFinal ? "text-sm sm:text-base" : "text-[11px] sm:text-xs",
            winning ? "text-pitch" : losing ? "text-ink-faint" : "text-ink-muted",
          )}
        >
          {t.name}
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.flagUrl}
        alt=""
        width={isFinal ? 56 : 28}
        height={isFinal ? 56 : 28}
        loading="lazy"
        className={cn(
          "shrink-0 rounded-full border bg-floodlight transition-all duration-300",
          isFinal ? "size-14 border-2" : "size-7 border",
          winning ? "border-pitch" : "border-rule",
        )}
      />
    </div>
  );
}

function StatusBadge({
  state,
  isFinal,
}: {
  state: "waiting" | "pending" | "tie" | "complete";
  isFinal: boolean;
}) {
  const text =
    state === "waiting"
      ? "Esperando ronda anterior"
      : state === "tie"
        ? "Empate · ajusta el marcador"
        : state === "complete"
          ? isFinal
            ? "Pitazo final"
            : "Resultado confirmado"
          : "Marcador requerido";
  const cls =
    state === "waiting"
      ? "text-ink-faint"
      : state === "tie"
        ? "text-card-yellow"
        : state === "complete"
          ? "text-pitch"
          : "text-ink-muted";
  return (
    <span
      className={cn(
        "font-display font-semibold uppercase tracking-[0.18em]",
        isFinal ? "text-xs" : "text-[10px]",
        cls,
      )}
    >
      {text}
    </span>
  );
}

function WinnerTag({
  code,
  isFinal,
  justResolved,
}: {
  code: string;
  isFinal: boolean;
  justResolved: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-baseline gap-1.5",
        justResolved && "animate-winner-stamp",
      )}
    >
      <span
        className={cn(
          "font-display font-medium uppercase tracking-[0.22em] text-ink-faint",
          isFinal ? "text-[10px]" : "text-[9px]",
        )}
      >
        {isFinal ? "Campeón del Mundo" : "Avanza"}
      </span>
      <span
        className={cn(
          "font-display font-bold uppercase tracking-[0.14em]",
          isFinal ? "text-base text-gold" : "text-xs text-pitch",
        )}
      >
        {code}
      </span>
    </span>
  );
}

/* -------- label helpers -------------------------------------------------- */

function stageLabel(s: string) {
  switch (s) {
    case "R32":
      return "Dieciseisavos";
    case "R16":
      return "Octavos";
    case "QF":
      return "Cuartos";
    case "SF":
      return "Semifinal";
    case "3RD":
      return "Tercer puesto";
    case "FINAL":
      return "Final";
    default:
      return s;
  }
}

function localLabel(label: string) {
  const idx = label.indexOf("·");
  if (idx < 0) return label;
  return label.slice(idx + 1).trim();
}

function labelFor(side: ResolvedSide): string {
  return side.kind === "team" ? side.team.name : side.label;
}
