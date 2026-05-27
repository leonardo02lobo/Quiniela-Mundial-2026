"use client";

import { cn } from "@/lib/utils";
import type { GroupId } from "@/types/domain";

interface PickRowProps {
  group: GroupId;
  teamId: string;
  teamCode: string;
  teamName: string;
  flagUrl: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (teamId: string) => void;
}

export function PickRow({
  group,
  teamId,
  teamCode,
  teamName,
  flagUrl,
  selected,
  disabled,
  onToggle,
}: PickRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onToggle(teamId)}
      className={cn(
        "group/row relative flex w-full items-stretch gap-0 border bg-paper text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch",
        selected
          ? "border-pitch bg-paper-hover"
          : "border-rule hover:bg-paper-hover hover:border-ink/30",
        disabled && "cursor-not-allowed opacity-60 hover:bg-paper hover:border-rule",
      )}
    >
      {/* Group letter cell — bordered stamp */}
      <span
        className={cn(
          "flex w-10 shrink-0 items-center justify-center border-r font-display text-base font-bold uppercase",
          selected ? "border-pitch bg-floodlight text-pitch" : "border-rule bg-floodlight text-ink-muted",
        )}
        aria-hidden="true"
      >
        {group}
      </span>

      {/* Body */}
      <span className="flex flex-1 items-center gap-3 px-3 py-3 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          className="size-[22px] shrink-0 rounded-full border border-rule bg-floodlight"
        />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.10em] text-ink">
            {teamCode}
          </span>
          <span className="truncate text-xs text-ink-muted">{teamName}</span>
        </span>
      </span>

      {/* Status tag */}
      <span className="flex w-20 shrink-0 items-center justify-center border-l border-rule bg-floodlight px-2">
        {selected ? (
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-pitch">
            Elegido
          </span>
        ) : (
          <span
            className={cn(
              "font-display text-[10px] font-medium uppercase tracking-[0.18em]",
              disabled ? "text-ink-faint" : "text-ink-faint group-hover/row:text-ink-muted",
            )}
          >
            Toca
          </span>
        )}
      </span>
    </button>
  );
}
