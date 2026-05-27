import type { GroupId } from "@/types/domain";

/**
 * FIFA 2026 World Cup knockout bracket data.
 *
 * Source: Wikipedia "2026 FIFA World Cup knockout stage"
 *   https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
 *
 * FIFA assigns:
 *   - 12 group winners (1A..1L)
 *   - 12 runners-up (2A..2L)
 *   - 8 best third-placed teams out of 12 (3X where X is the group)
 *
 * The R32 -> R16 -> QF -> SF -> 3rd/Final progression is fixed by FIFA.
 * The eight match slots that feature a third-placed team each have a list
 * of FIVE permissible source groups for that 3rd-place team. The full
 * 495-scenario mapping (one entry per combination of qualifying 8 of 12
 * group-thirds) is enumerated in Annex C of FIFA's regulations and is NOT
 * derived from a public algorithm.
 *
 * For this quiniela MVP, we apply a deterministic GREEDY assignment that
 * respects the documented per-slot candidate lists. This is a FALLBACK
 * (not an exact reproduction of Annex C). The user predicts WHICH eight
 * groups produce best-thirds; we then map those eight groups to the eight
 * 3rd-place R32 slots while never violating the candidate-group constraint
 * and never producing duplicate assignments. If a strict-constraint
 * assignment is impossible (rare edge cases) we relax the constraint and
 * pair leftover thirds to leftover slots so the user can still complete
 * the bracket.
 */

// ----- Stage codes & match IDs -------------------------------------------

export type Stage = "R32" | "R16" | "QF" | "SF" | "3RD" | "FINAL";

export const stages: { id: Stage; label: string; subtitle: string }[] = [
  { id: "R32", label: "Dieciseisavos de Final", subtitle: "16 partidos · ganadores de grupo, segundos y mejores terceros" },
  { id: "R16", label: "Octavos de Final", subtitle: "8 partidos · aquí se forman las mitades del cuadro" },
  { id: "QF", label: "Cuartos de Final", subtitle: "4 partidos" },
  { id: "SF", label: "Semifinales", subtitle: "2 partidos" },
  { id: "3RD", label: "Tercer Puesto", subtitle: "Perdedores de semifinales" },
  { id: "FINAL", label: "Final", subtitle: "El partido por el título" },
];

// ----- Slot type ----------------------------------------------------------

/**
 * A slot describes where a team comes from for a given side of a match.
 *
 * Variants:
 *   - GroupWinner: 1A..1L
 *   - GroupRunnerUp: 2A..2L
 *   - GroupThird: 3X with a candidate list (FIFA constraint)
 *   - MatchWinner: winner of a prior knockout match
 *   - MatchLoser: loser of a prior knockout match (used for the 3rd-place game)
 */
export type Slot =
  | { kind: "GroupWinner"; group: GroupId }
  | { kind: "GroupRunnerUp"; group: GroupId }
  | { kind: "GroupThird"; candidates: GroupId[] }
  | { kind: "MatchWinner"; matchId: string }
  | { kind: "MatchLoser"; matchId: string };

export interface BracketMatch {
  id: string;
  stage: Stage;
  /** FIFA's official tournament match number (73..104). */
  fifaNumber: number;
  /** Local short label e.g. "R32-M1". */
  label: string;
  home: Slot;
  away: Slot;
}

// ----- The bracket --------------------------------------------------------
// Match numbers mirror FIFA's official numbering (73..104) so external
// reconciliation stays trivial. Our local labels (R32-M1..) are 1-indexed
// per stage for human readability.

export const r32Matches: BracketMatch[] = [
  // m73 — 2A vs 2B
  { id: "R32-M1", stage: "R32", fifaNumber: 73, label: "R32 · M1",
    home: { kind: "GroupRunnerUp", group: "A" }, away: { kind: "GroupRunnerUp", group: "B" } },
  // m74 — 1E vs 3 of A/B/C/D/F
  { id: "R32-M2", stage: "R32", fifaNumber: 74, label: "R32 · M2",
    home: { kind: "GroupWinner", group: "E" }, away: { kind: "GroupThird", candidates: ["A","B","C","D","F"] } },
  // m75 — 1F vs 2C
  { id: "R32-M3", stage: "R32", fifaNumber: 75, label: "R32 · M3",
    home: { kind: "GroupWinner", group: "F" }, away: { kind: "GroupRunnerUp", group: "C" } },
  // m76 — 1C vs 2F
  { id: "R32-M4", stage: "R32", fifaNumber: 76, label: "R32 · M4",
    home: { kind: "GroupWinner", group: "C" }, away: { kind: "GroupRunnerUp", group: "F" } },
  // m77 — 1I vs 3 of C/D/F/G/H
  { id: "R32-M5", stage: "R32", fifaNumber: 77, label: "R32 · M5",
    home: { kind: "GroupWinner", group: "I" }, away: { kind: "GroupThird", candidates: ["C","D","F","G","H"] } },
  // m78 — 2E vs 2I
  { id: "R32-M6", stage: "R32", fifaNumber: 78, label: "R32 · M6",
    home: { kind: "GroupRunnerUp", group: "E" }, away: { kind: "GroupRunnerUp", group: "I" } },
  // m79 — 1A vs 3 of C/E/F/H/I
  { id: "R32-M7", stage: "R32", fifaNumber: 79, label: "R32 · M7",
    home: { kind: "GroupWinner", group: "A" }, away: { kind: "GroupThird", candidates: ["C","E","F","H","I"] } },
  // m80 — 1L vs 3 of E/H/I/J/K
  { id: "R32-M8", stage: "R32", fifaNumber: 80, label: "R32 · M8",
    home: { kind: "GroupWinner", group: "L" }, away: { kind: "GroupThird", candidates: ["E","H","I","J","K"] } },
  // m81 — 1D vs 3 of B/E/F/I/J
  { id: "R32-M9", stage: "R32", fifaNumber: 81, label: "R32 · M9",
    home: { kind: "GroupWinner", group: "D" }, away: { kind: "GroupThird", candidates: ["B","E","F","I","J"] } },
  // m82 — 1G vs 3 of A/E/H/I/J
  { id: "R32-M10", stage: "R32", fifaNumber: 82, label: "R32 · M10",
    home: { kind: "GroupWinner", group: "G" }, away: { kind: "GroupThird", candidates: ["A","E","H","I","J"] } },
  // m83 — 2K vs 2L
  { id: "R32-M11", stage: "R32", fifaNumber: 83, label: "R32 · M11",
    home: { kind: "GroupRunnerUp", group: "K" }, away: { kind: "GroupRunnerUp", group: "L" } },
  // m84 — 1H vs 2J
  { id: "R32-M12", stage: "R32", fifaNumber: 84, label: "R32 · M12",
    home: { kind: "GroupWinner", group: "H" }, away: { kind: "GroupRunnerUp", group: "J" } },
  // m85 — 1B vs 3 of E/F/G/I/J
  { id: "R32-M13", stage: "R32", fifaNumber: 85, label: "R32 · M13",
    home: { kind: "GroupWinner", group: "B" }, away: { kind: "GroupThird", candidates: ["E","F","G","I","J"] } },
  // m86 — 1J vs 2H
  { id: "R32-M14", stage: "R32", fifaNumber: 86, label: "R32 · M14",
    home: { kind: "GroupWinner", group: "J" }, away: { kind: "GroupRunnerUp", group: "H" } },
  // m87 — 1K vs 3 of D/E/I/J/L
  { id: "R32-M15", stage: "R32", fifaNumber: 87, label: "R32 · M15",
    home: { kind: "GroupWinner", group: "K" }, away: { kind: "GroupThird", candidates: ["D","E","I","J","L"] } },
  // m88 — 2D vs 2G
  { id: "R32-M16", stage: "R32", fifaNumber: 88, label: "R32 · M16",
    home: { kind: "GroupRunnerUp", group: "D" }, away: { kind: "GroupRunnerUp", group: "G" } },
];

export const r16Matches: BracketMatch[] = [
  // m89 — W74 vs W77
  { id: "R16-M1", stage: "R16", fifaNumber: 89, label: "R16 · M1",
    home: { kind: "MatchWinner", matchId: "R32-M2" },
    away: { kind: "MatchWinner", matchId: "R32-M5" } },
  // m90 — W73 vs W75
  { id: "R16-M2", stage: "R16", fifaNumber: 90, label: "R16 · M2",
    home: { kind: "MatchWinner", matchId: "R32-M1" },
    away: { kind: "MatchWinner", matchId: "R32-M3" } },
  // m91 — W76 vs W78
  { id: "R16-M3", stage: "R16", fifaNumber: 91, label: "R16 · M3",
    home: { kind: "MatchWinner", matchId: "R32-M4" },
    away: { kind: "MatchWinner", matchId: "R32-M6" } },
  // m92 — W79 vs W80
  { id: "R16-M4", stage: "R16", fifaNumber: 92, label: "R16 · M4",
    home: { kind: "MatchWinner", matchId: "R32-M7" },
    away: { kind: "MatchWinner", matchId: "R32-M8" } },
  // m93 — W83 vs W84
  { id: "R16-M5", stage: "R16", fifaNumber: 93, label: "R16 · M5",
    home: { kind: "MatchWinner", matchId: "R32-M11" },
    away: { kind: "MatchWinner", matchId: "R32-M12" } },
  // m94 — W81 vs W82
  { id: "R16-M6", stage: "R16", fifaNumber: 94, label: "R16 · M6",
    home: { kind: "MatchWinner", matchId: "R32-M9" },
    away: { kind: "MatchWinner", matchId: "R32-M10" } },
  // m95 — W86 vs W88
  { id: "R16-M7", stage: "R16", fifaNumber: 95, label: "R16 · M7",
    home: { kind: "MatchWinner", matchId: "R32-M14" },
    away: { kind: "MatchWinner", matchId: "R32-M16" } },
  // m96 — W85 vs W87
  { id: "R16-M8", stage: "R16", fifaNumber: 96, label: "R16 · M8",
    home: { kind: "MatchWinner", matchId: "R32-M13" },
    away: { kind: "MatchWinner", matchId: "R32-M15" } },
];

export const qfMatches: BracketMatch[] = [
  // m97 — W89 vs W90
  { id: "QF-M1", stage: "QF", fifaNumber: 97, label: "QF · M1",
    home: { kind: "MatchWinner", matchId: "R16-M1" },
    away: { kind: "MatchWinner", matchId: "R16-M2" } },
  // m98 — W93 vs W94
  { id: "QF-M2", stage: "QF", fifaNumber: 98, label: "QF · M2",
    home: { kind: "MatchWinner", matchId: "R16-M5" },
    away: { kind: "MatchWinner", matchId: "R16-M6" } },
  // m99 — W91 vs W92
  { id: "QF-M3", stage: "QF", fifaNumber: 99, label: "QF · M3",
    home: { kind: "MatchWinner", matchId: "R16-M3" },
    away: { kind: "MatchWinner", matchId: "R16-M4" } },
  // m100 — W95 vs W96
  { id: "QF-M4", stage: "QF", fifaNumber: 100, label: "QF · M4",
    home: { kind: "MatchWinner", matchId: "R16-M7" },
    away: { kind: "MatchWinner", matchId: "R16-M8" } },
];

export const sfMatches: BracketMatch[] = [
  // m101 — W97 vs W98
  { id: "SF-M1", stage: "SF", fifaNumber: 101, label: "SF · M1",
    home: { kind: "MatchWinner", matchId: "QF-M1" },
    away: { kind: "MatchWinner", matchId: "QF-M2" } },
  // m102 — W99 vs W100
  { id: "SF-M2", stage: "SF", fifaNumber: 102, label: "SF · M2",
    home: { kind: "MatchWinner", matchId: "QF-M3" },
    away: { kind: "MatchWinner", matchId: "QF-M4" } },
];

export const thirdPlaceMatch: BracketMatch = {
  id: "3RD", stage: "3RD", fifaNumber: 103, label: "Third Place",
  home: { kind: "MatchLoser", matchId: "SF-M1" },
  away: { kind: "MatchLoser", matchId: "SF-M2" },
};

export const finalMatch: BracketMatch = {
  id: "FINAL", stage: "FINAL", fifaNumber: 104, label: "Final",
  home: { kind: "MatchWinner", matchId: "SF-M1" },
  away: { kind: "MatchWinner", matchId: "SF-M2" },
};

// All matches, in stable order. Total: 16 + 8 + 4 + 2 + 1 + 1 = 32.
export const allMatches: BracketMatch[] = [
  ...r32Matches,
  ...r16Matches,
  ...qfMatches,
  ...sfMatches,
  thirdPlaceMatch,
  finalMatch,
];

export const TOTAL_MATCHES = allMatches.length; // 32

// ----- Helpers ------------------------------------------------------------

export function matchesByStage(stage: Stage): BracketMatch[] {
  return allMatches.filter((m) => m.stage === stage);
}

export function getMatch(id: string): BracketMatch | undefined {
  return allMatches.find((m) => m.id === id);
}

/** The eight R32 slots that consume a best-third team, in canonical order. */
export const thirdPlaceSlots: { matchId: string; candidates: GroupId[] }[] = r32Matches
  .filter((m) => m.away.kind === "GroupThird")
  .map((m) => ({
    matchId: m.id,
    candidates: (m.away as Extract<Slot, { kind: "GroupThird" }>).candidates,
  }));

/**
 * Assign the user's 8 best-third groups to the 8 R32 third-place slots.
 *
 * Returns a map { matchId -> GroupId } telling which third-placed group
 * fills the "GroupThird" slot for each of the 8 affected R32 matches.
 *
 * Algorithm (greedy with constrained-first ordering):
 *   1. For each slot, compute its allowable subset of the user's picks
 *      (intersection of slot.candidates with bestThirdGroups).
 *   2. Sort slots ascending by allowable-count (most-constrained first).
 *   3. Assign each slot a not-yet-used group from its allowable subset
 *      (prefer groups that appear in the fewest remaining slots, to keep
 *      flexibility for later assignments).
 *   4. If no allowable group remains for a slot, fall back to ANY unused
 *      group from bestThirdGroups (relaxed). This keeps the bracket
 *      renderable for all 495 user choices; the relaxation is documented
 *      as a fallback because the full FIFA Annex C table is not modeled.
 *
 * This is deterministic, idempotent given the same input set, and matches
 * the documented FIFA constraint for the vast majority of inputs.
 */
export function assignBestThirdsToSlots(
  bestThirdGroups: GroupId[],
): Record<string, GroupId> {
  if (bestThirdGroups.length !== 8) return {};

  const picks = new Set<GroupId>(bestThirdGroups);

  // Slots with their allowable subset (intersect with user picks).
  const slotState = thirdPlaceSlots.map((s) => ({
    matchId: s.matchId,
    allowable: s.candidates.filter((g) => picks.has(g)),
  }));

  // Most-constrained slot first.
  slotState.sort((a, b) => a.allowable.length - b.allowable.length);

  const assignment: Record<string, GroupId> = {};
  const used = new Set<GroupId>();

  for (const slot of slotState) {
    // Available = allowable groups not yet used.
    const available = slot.allowable.filter((g) => !used.has(g));

    let chosen: GroupId | undefined;
    if (available.length > 0) {
      // Prefer the group that fits the FEWEST remaining slots — keep
      // flexibility high for the slots we haven't assigned yet.
      const remainingSlots = slotState.filter((s) => !assignment[s.matchId]);
      chosen = [...available].sort((a, b) => {
        const fa = remainingSlots.reduce((n, s) => n + (s.allowable.includes(a) ? 1 : 0), 0);
        const fb = remainingSlots.reduce((n, s) => n + (s.allowable.includes(b) ? 1 : 0), 0);
        return fa - fb;
      })[0];
    } else {
      // Fallback: any unused pick (constraint relaxed). Documented above.
      chosen = bestThirdGroups.find((g) => !used.has(g));
    }

    if (chosen) {
      assignment[slot.matchId] = chosen;
      used.add(chosen);
    }
  }

  return assignment;
}
