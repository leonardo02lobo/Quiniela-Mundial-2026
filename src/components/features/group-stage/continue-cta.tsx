"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { groupIds, teamsByGroup } from "@/data/tournament";
import { usePredictionsStore } from "@/lib/store/predictions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TileBand } from "@/components/layout/tile-band";
import { cn } from "@/lib/utils";

const NEXT_HREF = "/predictions/best-thirds";

/**
 * Bottom CTA. Always active. If groups remain unordered, clicking opens
 * an alert dialog with the missing groups and lets the user pick "continue
 * anyway" or "order groups" (dismiss + scroll back).
 */
export function ContinueCta() {
  const groupOrder = usePredictionsStore((s) => s.groupOrder);
  const setGroupOrder = usePredictionsStore((s) => s.setGroupOrder);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const missing = groupIds.filter(
    (id) => !Array.isArray(groupOrder[id]) || groupOrder[id]!.length !== 4,
  );
  const done = groupIds.length - missing.length;
  const total = groupIds.length;
  const ready = missing.length === 0;

  function handleContinue() {
    if (ready) {
      router.push(NEXT_HREF);
    } else {
      setOpen(true);
    }
  }

  function handleContinueAnyway() {
    // Lock in the natural FIFA order for every still-unordered group,
    // so the user's implicit acceptance of the default becomes their pick.
    const groups = teamsByGroup();
    for (const id of missing) {
      setGroupOrder(
        id,
        groups[id].map((t) => t.id),
      );
    }
    router.push(NEXT_HREF);
  }

  return (
    <div className="border border-rule bg-paper">
      <div className="flex flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Paso 1 de 3
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.10em] text-ink">
            {ready
              ? "Todos los grupos ordenados"
              : `${done} de ${total} grupos ordenados`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className={cn(
            "border-2 border-ink bg-ink px-5 py-2.5 text-center",
            "font-display text-xs font-bold uppercase tracking-[0.18em] text-chalk",
            "transition-colors hover:bg-card-red hover:border-card-red",
          )}
        >
          Continuar a Mejores Terceros →
        </button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-sm border-2 border-ink p-0 sm:max-w-md ring-0">
          <TileBand className="h-2" />
          <div className="p-5">
            <AlertDialogHeader className="!place-items-start text-left">
              <AlertDialogTitle className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                {missing.length} grupo{missing.length === 1 ? "" : "s"} sin ordenar
              </AlertDialogTitle>
              <AlertDialogDescription className="text-ink-muted">
                No has definido el orden para estos grupos. Puedes continuar de todas
                formas y volver luego, u ordenarlos ahora.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mt-4 flex flex-wrap gap-2">
              {missing.map((id) => (
                <span
                  key={id}
                  className="inline-flex h-8 min-w-8 items-center justify-center border-2 border-ink bg-card-yellow px-2 font-display text-sm font-bold uppercase text-ink"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>

          <AlertDialogFooter className="m-0 border-t-2 border-ink bg-paper-hover p-3 sm:!justify-between">
            <AlertDialogCancel
              className={cn(
                "border-2 border-ink bg-paper text-ink",
                "font-display text-xs font-bold uppercase tracking-[0.14em]",
                "hover:bg-paper-hover",
              )}
            >
              Ordenar grupos
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinueAnyway}
              className={cn(
                "border-2 border-ink bg-ink text-chalk",
                "font-display text-xs font-bold uppercase tracking-[0.14em]",
                "hover:bg-card-red hover:border-card-red",
              )}
            >
              Continuar de todas formas →
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
