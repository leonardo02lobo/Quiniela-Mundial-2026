"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { GroupId } from "@/types/domain";

export interface SortableTeamRowProps {
  team: {
    id: string;
    name: string;
    code: string;
    flagUrl: string;
    group: GroupId;
  };
  position: number; // 1..4
}

type Status = "advance" | "candidate" | "eliminated";

function statusFor(position: number): Status {
  if (position <= 2) return "advance";
  if (position === 3) return "candidate";
  return "eliminated";
}

const statusLabel: Record<Status, string> = {
  advance: "Avanza",
  candidate: "Mejor 3ro",
  eliminated: "Fuera",
};

/**
 * One draggable team row inside a group card.
 *
 * Layout reads left-to-right like a printed pool sheet:
 *   [status bar] [position] [flag] [code] [name] [grip]
 *
 * Status hint = a 2px vertical band on the leading edge (color = status),
 * plus a tiny uppercase label on the trailing side. Color is reserved for
 * status only — team identity stays monochrome (flag + code + name).
 */
export function SortableTeamRow({ team, position }: SortableTeamRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id });

  const status = statusFor(position);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/row relative flex items-stretch border border-rule bg-paper",
        "transition-colors",
        // While dragging: lift visually via background + stronger border.
        isDragging
          ? "z-10 border-ink/40 bg-paper-hover"
          : "hover:bg-paper-hover hover:border-ink/20",
      )}
      {...attributes}
      {...listeners}
      // dnd-kit attaches role="button" + tabIndex; keep it grabbable.
      data-position={position}
    >
      {/* Leading status bar — 2px chalky strip in the status color */}
      <span
        aria-hidden
        className={cn(
          "w-[3px] shrink-0",
          status === "advance" && "bg-pitch",
          status === "candidate" && "bg-gold",
          status === "eliminated" && "bg-rule",
        )}
      />

      {/* Position numeral */}
      <span
        className={cn(
          "nums font-display flex w-9 shrink-0 items-center justify-center text-base font-semibold tabular-nums",
          status === "eliminated" ? "text-ink-faint" : "text-ink",
        )}
      >
        {position}
      </span>

      {/* Flag — monochrome team identity, no kit colors */}
      <div className="flex items-center pl-1 pr-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={team.flagUrl}
          alt=""
          width={20}
          height={20}
          className={cn(
            "h-5 w-5 rounded-full border border-rule",
            status === "eliminated" && "opacity-60",
          )}
          loading="lazy"
        />
      </div>

      {/* Code + name */}
      <div className="flex flex-1 items-baseline gap-2 py-2 pr-2">
        <span
          className={cn(
            "font-display text-sm font-semibold uppercase tracking-[0.10em]",
            status === "eliminated" ? "text-ink-faint" : "text-ink",
          )}
        >
          {team.code}
        </span>
        <span
          className={cn(
            "truncate text-[13px]",
            status === "eliminated" ? "text-ink-faint" : "text-ink-muted",
          )}
        >
          {team.name}
        </span>
      </div>

      {/* Status label — printed-sheet style, tiny, all caps */}
      <span
        className={cn(
          "hidden items-center pr-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] sm:flex",
          status === "advance" && "text-pitch",
          status === "candidate" && "text-gold",
          status === "eliminated" && "text-ink-faint",
        )}
      >
        {statusLabel[status]}
      </span>

      {/* Drag grip — explicit affordance on the trailing edge */}
      <span
        aria-hidden
        className={cn(
          "flex w-7 shrink-0 items-center justify-center border-l border-rule text-ink-faint",
          "transition-colors group-hover/row:text-ink-muted",
          isDragging ? "cursor-grabbing text-ink" : "cursor-grab",
        )}
      >
        <GripDots />
      </span>
    </li>
  );
}

function GripDots() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="1" />
      <circle cx="2" cy="7" r="1" />
      <circle cx="2" cy="12" r="1" />
      <circle cx="8" cy="2" r="1" />
      <circle cx="8" cy="7" r="1" />
      <circle cx="8" cy="12" r="1" />
    </svg>
  );
}
