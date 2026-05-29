"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BackAction {
  label: string;
  href: string;
}

interface NextAction {
  label: string;
  /** Renders the next slot as a Link when set. */
  href?: string;
  /** Renders the next slot as a button when set. Takes precedence over href. */
  onClick?: () => void;
  /** Greys out the next slot and disables interaction. */
  disabled?: boolean;
}

interface StepFooterNavProps {
  /** Tiny caption above the current step name. */
  caption?: string;
  /** Bold step name. */
  currentLabel: string;
  back?: BackAction;
  next?: NextAction;
  className?: string;
}

/**
 * Bottom-of-page step navigation for the predictions flow. Same visual
 * shape as the knockout's StageFooterNav so all three step pages share
 * the same anchor.
 *
 * Back is always a Link. Next can be a Link (href) or a button (onClick)
 * — useful when the page wants to intercept with a soft-gate dialog
 * before navigating.
 */
export function StepFooterNav({
  caption = "Viendo actualmente",
  currentLabel,
  back,
  next,
  className,
}: StepFooterNavProps) {
  return (
    <nav
      className={cn(
        "mt-8 flex flex-col items-stretch gap-3 border border-rule bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          {caption}
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.10em] text-ink">
          {currentLabel}
        </span>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
        {back ? (
          <Link
            href={back.href}
            className={cn(
              "border-2 border-ink bg-paper px-5 py-2.5 text-center",
              "font-display text-xs font-bold uppercase tracking-[0.16em] text-ink",
              "transition-colors hover:bg-paper-hover",
            )}
          >
            ← {back.label}
          </Link>
        ) : (
          // Spacer keeps the next button right-aligned on sm+.
          <span aria-hidden className="hidden sm:block" />
        )}

        {next && <NextSlot next={next} />}
      </div>
    </nav>
  );
}

function NextSlot({ next }: { next: NextAction }) {
  if (next.disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "cursor-not-allowed border-2 border-rule bg-paper px-5 py-2.5 text-center",
          "font-display text-xs font-bold uppercase tracking-[0.16em] text-ink-faint",
        )}
      >
        {next.label} →
      </span>
    );
  }

  const className = cn(
    "border-2 border-ink bg-ink px-5 py-2.5 text-center",
    "font-display text-xs font-bold uppercase tracking-[0.16em] text-chalk",
    "transition-colors hover:bg-card-red hover:border-card-red",
  );

  if (next.onClick) {
    return (
      <button type="button" onClick={next.onClick} className={className}>
        {next.label} →
      </button>
    );
  }

  return (
    <Link href={next.href ?? "#"} className={className}>
      {next.label} →
    </Link>
  );
}
