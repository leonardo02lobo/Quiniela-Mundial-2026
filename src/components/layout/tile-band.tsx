/**
 * Panini-style tile band — the signature decorative element.
 *
 * Alternating "leaf" tiles (rectangles with two diagonal corners rounded)
 * in the official 2026 palette plus tints. Used as a band atop key surfaces
 * (sign-in card, page headers, hero blocks).
 */

const TILE_COLORS = [
  "#F6BB1E", // gold
  "#E61D25", // torch red
  "#2A398D", // hermes blue
  "#3CAC3B", // average green
  "#F6BB1E",
  "#2A398D",
  "#E61D25",
  "#3CAC3B",
  "#F6BB1E",
  "#2A398D",
  "#E61D25",
  "#3CAC3B",
] as const;

interface TileBandProps {
  /** Tile count. Defaults to 12. */
  count?: number;
  /** Tailwind height utility. Defaults to "h-3". */
  className?: string;
}

export function TileBand({ count = 12, className = "h-3" }: TileBandProps) {
  const tiles = TILE_COLORS.slice(0, count);
  return (
    <div
      aria-hidden="true"
      className={`flex w-full overflow-hidden ${className}`}
    >
      {tiles.map((color, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            backgroundColor: color,
            borderTopLeftRadius: i % 2 === 0 ? "60%" : 0,
            borderBottomRightRadius: i % 2 === 0 ? "60%" : 0,
            borderTopRightRadius: i % 2 === 1 ? "60%" : 0,
            borderBottomLeftRadius: i % 2 === 1 ? "60%" : 0,
          }}
        />
      ))}
    </div>
  );
}
