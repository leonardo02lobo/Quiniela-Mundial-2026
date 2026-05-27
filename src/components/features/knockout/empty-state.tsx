import Link from "next/link";
import { groupIds } from "@/data/tournament";

interface EmptyStateProps {
  groupsComplete: boolean;
  groupsDone: number;
  groupsTotal: number;
  bestThirdsComplete: boolean;
  bestThirdsCount: number;
}

/**
 * Pre-bracket deferral state — read like the standings panel on a
 * printed quiniela: "before you can fill the knockout column, finish
 * sections 1 and 2." Tone is matter-of-fact, not apologetic.
 */
export function EmptyState({
  groupsComplete,
  groupsDone,
  groupsTotal,
  bestThirdsComplete,
  bestThirdsCount,
}: EmptyStateProps) {
  return (
    <section className="border border-rule bg-paper" aria-live="polite">
      <header className="border-b border-rule bg-floodlight px-5 py-4">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-card-yellow">
          Sección bloqueada
        </p>
        <h2 className="mt-1 font-display text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
          Completa los pasos previos para desbloquear las eliminatorias
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          Los dieciseisavos están compuestos por los doce ganadores de grupo, los
          doce segundos y los ocho mejores terceros. No podemos formar un solo
          partido hasta que estén definidos.
        </p>
      </header>

      <ol className="divide-y divide-rule">
        <Step
          n={1}
          title="Ordena cada grupo"
          ratio={`${groupsDone}/${groupsTotal}`}
          state={groupsComplete ? "done" : groupsDone === 0 ? "todo" : "in-progress"}
          detail={
            groupsComplete
              ? "Los 12 grupos están ordenados."
              : `Aún faltan ${groupsTotal - groupsDone} de ${groupsTotal} grupos.`
          }
          href="/predictions/groups"
          cta={groupsComplete ? "Revisar grupos" : "Abrir fase de grupos"}
        />
        <Step
          n={2}
          title="Elige ocho mejores terceros"
          ratio={`${bestThirdsCount}/8`}
          state={
            !groupsComplete
              ? "todo"
              : bestThirdsComplete
                ? "done"
                : bestThirdsCount === 0
                  ? "todo"
                  : "in-progress"
          }
          detail={
            !groupsComplete
              ? "Disponible cuando todos los grupos estén ordenados."
              : bestThirdsComplete
                ? "Ocho terceros lugares seleccionados."
                : `${8 - bestThirdsCount} más por seleccionar.`
          }
          href="/predictions/best-thirds"
          cta={bestThirdsComplete ? "Revisar mejores terceros" : "Abrir mejores terceros"}
          disabled={!groupsComplete}
        />
      </ol>

      <footer className="border-t border-rule bg-floodlight px-5 py-3">
        <p className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          {groupIds.length} grupos · 8 mejores terceros · 32 partidos eliminatorios
        </p>
      </footer>
    </section>
  );
}

function Step({
  n,
  title,
  ratio,
  state,
  detail,
  href,
  cta,
  disabled,
}: {
  n: number;
  title: string;
  ratio: string;
  state: "todo" | "in-progress" | "done";
  detail: string;
  href: string;
  cta: string;
  disabled?: boolean;
}) {
  const stateClass =
    state === "done"
      ? "text-pitch"
      : state === "in-progress"
        ? "text-gold"
        : "text-ink-faint";
  const stateLabel =
    state === "done" ? "Hecho" : state === "in-progress" ? "En curso" : "Pendiente";

  return (
    <li className="flex items-stretch gap-0 px-5 py-4">
      <div className="flex w-14 shrink-0 items-start justify-start">
        <span className="font-display nums text-2xl font-bold leading-none tabular-nums text-ink-faint">
          {String(n).padStart(2, "0")}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-base font-semibold uppercase tracking-[0.10em] text-ink">
            {title}
          </span>
          <span className="font-display nums text-xs font-semibold tabular-nums text-ink">
            {ratio}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="text-xs text-ink-muted">{detail}</span>
          <span className={`font-display text-[10px] font-semibold uppercase tracking-[0.18em] ${stateClass}`}>
            {stateLabel}
          </span>
        </div>
        <div className="mt-3">
          {disabled ? (
            <span className="inline-flex cursor-not-allowed items-center border border-rule bg-floodlight px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {cta}
            </span>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center border border-ink bg-ink px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk transition-colors hover:bg-pitch-deep hover:border-pitch-deep"
            >
              {cta}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
