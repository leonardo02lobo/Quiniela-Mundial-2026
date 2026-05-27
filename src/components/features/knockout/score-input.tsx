"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreInputProps {
  value: number | null;
  side: "home" | "away";
  disabled: boolean;
  onCommit: (next: number | null) => void;
  ariaLabel: string;
  /** "md" for normal matches, "lg" for the Final hero card. */
  size?: "md" | "lg";
}

/**
 * The broadcast-scoreline numeral.
 * Large, font-mono, tabular nums. No native number-spinner — that visual
 * clutter is hostile to the scoreline aesthetic. Stays unstyled inset
 * until focus, then borders firm up.
 */
export function ScoreInput({
  value,
  side,
  disabled,
  onCommit,
  ariaLabel,
  size = "md",
}: ScoreInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState<string>(value == null ? "" : String(value));

  // Keep local in sync if the store value changes (e.g. reset).
  useEffect(() => {
    setLocal(value == null ? "" : String(value));
  }, [value]);

  function commit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      onCommit(null);
      return;
    }
    const n = parseInt(trimmed, 10);
    if (!Number.isFinite(n) || n < 0) {
      // bad input — revert to last known value
      setLocal(value == null ? "" : String(value));
      return;
    }
    const clamped = Math.min(99, n);
    setLocal(String(clamped));
    onCommit(clamped);
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      autoComplete="off"
      aria-label={ariaLabel}
      disabled={disabled}
      value={local}
      placeholder="–"
      onChange={(e) => {
        // Live-clean: digits only, up to 2 chars.
        const cleaned = e.target.value.replace(/\D+/g, "").slice(0, 2);
        setLocal(cleaned);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          setLocal(value == null ? "" : String(value));
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn(
        "nums font-mono tabular-nums",
        size === "lg"
          ? "h-24 w-20 sm:h-32 sm:w-28 text-6xl sm:text-7xl"
          : "h-14 w-14 sm:h-16 sm:w-16 text-3xl sm:text-4xl",
        "font-bold text-center leading-none",
        size === "lg"
          ? "border-2 border-ink bg-paper text-ink"
          : "border border-rule bg-paper-hover text-ink",
        "outline-none transition-colors",
        "placeholder:text-ink-faint placeholder:font-display placeholder:font-normal",
        "focus:border-ink focus:bg-paper",
        "disabled:cursor-not-allowed disabled:opacity-50",
        side === "home" ? "rounded-l-md border-r-0" : "rounded-r-md border-l-0",
      )}
    />
  );
}
