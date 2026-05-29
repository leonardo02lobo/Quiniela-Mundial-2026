"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { teamsByGroup } from "@/data/tournament";
import { usePredictionsStore } from "@/lib/store/predictions";
import { cn } from "@/lib/utils";
import type { GroupId } from "@/types/domain";
import type { GroupSelection } from "./groups-grid";
import { SortableTeamRow } from "./sortable-team-row";

interface GroupCardProps {
  groupId: GroupId;
  selected: GroupSelection | null;
  setSelected: (s: GroupSelection | null) => void;
}

/**
 * One group card. 3-band hairline structure:
 *   floodlight header  → group label + "ordered" status
 *   paper body         → 4 sortable team rows
 *   floodlight footer  → leg captions (advance / best-third / out)
 */
export function GroupCard({ groupId, selected, setSelected }: GroupCardProps) {
  const groups = useMemo(() => teamsByGroup(), []);
  const groupTeams = groups[groupId];

  const stored = usePredictionsStore((s) => s.groupOrder[groupId]);
  const setGroupOrder = usePredictionsStore((s) => s.setGroupOrder);

  // Resolve the current ordering: stored ids, or FIFA-natural fallback.
  const orderedTeams = useMemo(() => {
    if (stored && stored.length === 4) {
      const byId = new Map(groupTeams.map((t) => [t.id, t]));
      const resolved = stored
        .map((id) => byId.get(id))
        .filter((x): x is (typeof groupTeams)[number] => !!x);
      if (resolved.length === 4) return resolved;
    }
    return groupTeams;
  }, [stored, groupTeams]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const isOrdered = !!stored && stored.length === 4;
  const isActiveGroup = selected?.groupId === groupId;
  const isDimmed = selected !== null && !isActiveGroup;

  function commitOrder(teams: typeof orderedTeams) {
    setGroupOrder(
      groupId,
      teams.map((t) => t.id),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      // Even on no-op, ensure the group is marked as ordered the first time
      // the user interacts. (Confirms current arrangement.)
      if (!isOrdered) {
        commitOrder(orderedTeams);
      }
      return;
    }
    const oldIndex = orderedTeams.findIndex((t) => t.id === active.id);
    const newIndex = orderedTeams.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    commitOrder(arrayMove(orderedTeams, oldIndex, newIndex));
  }

  function handleTeamTap(teamId: string) {
    // Nothing selected yet → pick this team.
    if (!selected) {
      setSelected({ groupId, teamId });
      return;
    }
    // Tap the already-selected team → cancel selection.
    if (selected.groupId === groupId && selected.teamId === teamId) {
      setSelected(null);
      return;
    }
    // Different group → move the selection there instead of swapping across groups.
    if (selected.groupId !== groupId) {
      setSelected({ groupId, teamId });
      return;
    }
    // Same group, different team → swap positions and clear the selection.
    const a = orderedTeams.findIndex((t) => t.id === selected.teamId);
    const b = orderedTeams.findIndex((t) => t.id === teamId);
    if (a < 0 || b < 0) {
      setSelected(null);
      return;
    }
    const next = orderedTeams.slice();
    [next[a], next[b]] = [next[b], next[a]];
    commitOrder(next);
    setSelected(null);
  }

  const statusLabel = isActiveGroup
    ? "Toca otro equipo"
    : isOrdered
      ? "Ordenado"
      : "Arrastra o toca para ordenar";

  return (
    <article
      className={cn(
        "border border-rule bg-paper transition-opacity duration-150",
        isDimmed && "opacity-40",
        isActiveGroup && "border-ink/40",
      )}
    >
      {/* Header band */}
      <header className="flex items-center justify-between border-b border-rule bg-floodlight px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Grupo
          </span>
          <span className="font-display text-lg font-bold uppercase leading-none text-ink">
            {groupId}
          </span>
        </div>
        <span
          className={cn(
            "font-display text-[10px] uppercase",
            isActiveGroup
              ? "font-semibold tracking-[0.18em] text-pitch"
              : isOrdered
                ? "font-semibold tracking-[0.18em] text-pitch"
                : "font-medium tracking-[0.18em] text-ink-faint",
          )}
        >
          {statusLabel}
        </span>
      </header>

      {/* Body — 4 sortable rows */}
      <DndContext
        id={`dnd-group-${groupId}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedTeams.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col gap-1 p-2">
            {orderedTeams.map((team, idx) => (
              <SortableTeamRow
                key={team.id}
                team={team}
                position={idx + 1}
                isSelected={isActiveGroup && selected?.teamId === team.id}
                isSwapCandidate={isActiveGroup && selected?.teamId !== team.id}
                onTap={() => handleTeamTap(team.id)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {/* Footer band — legend reads like a key on a printed sheet */}
      <footer className="grid grid-cols-3 border-t border-rule bg-floodlight">
        <LegendCell label="1–2" caption="Avanzan" tone="pitch" />
        <LegendCell label="3" caption="Mejor 3ro" tone="gold" mid />
        <LegendCell label="4" caption="Fuera" tone="faint" />
      </footer>
    </article>
  );
}

function LegendCell({
  label,
  caption,
  tone,
  mid = false,
}: {
  label: string;
  caption: string;
  tone: "pitch" | "gold" | "faint";
  mid?: boolean;
}) {
  const toneClass =
    tone === "pitch"
      ? "text-pitch"
      : tone === "gold"
        ? "text-gold"
        : "text-ink-faint";

  return (
    <div
      className={
        "flex items-baseline justify-center gap-1.5 px-2 py-1.5 " +
        (mid ? "border-x border-rule" : "")
      }
    >
      <span className={`nums font-display text-[11px] font-semibold tabular-nums ${toneClass}`}>
        {label}
      </span>
      <span className="font-display text-[9px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        {caption}
      </span>
    </div>
  );
}
