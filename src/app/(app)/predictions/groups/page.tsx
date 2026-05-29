import { auth } from "@/auth";
import { ContinueCta } from "@/components/features/group-stage/continue-cta";
import { GroupsGrid } from "@/components/features/group-stage/groups-grid";
import { ProgressIndicator } from "@/components/features/group-stage/progress-indicator";

export default async function GroupsPredictionPage() {
  const session = await auth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header — printed-sheet title block */}
      <header className="mb-6 border-b border-rule pb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-pitch">
          Paso 1 de 3 · Fase de Grupos
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Ordena cada grupo
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          Arrastra los cuatro equipos de cada grupo según el orden de finalización que predigas.
          Las posiciones 1 y 2 avanzan, la 3 entra a la carrera por mejor tercero, la 4 queda
          eliminada.
        </p>
        {session?.user?.name && (
          <p className="mt-3 text-xs text-ink-faint">
            Sesión iniciada como <span className="text-ink">{session.user.name}</span>
          </p>
        )}
      </header>

      {/* Progress card */}
      <div className="mb-6">
        <ProgressIndicator />
      </div>

      {/* 12 group cards. Each card owns its own DndContext — drag is internal.
          Shared tap-to-swap selection lives in GroupsGrid. */}
      <GroupsGrid />

      {/* Continue CTA */}
      <div className="mt-8">
        <ContinueCta />
      </div>
    </section>
  );
}
