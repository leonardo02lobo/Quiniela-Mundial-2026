import { teamById, teamsByGroup, groupIds } from "@/data/tournament";
import {
  allMatches,
  assignBestThirdsToSlots,
  getMatch,
  type BracketMatch,
  type Slot,
} from "@/data/bracket";
import type { KnockoutPick } from "@/lib/store/predictions";
import type { GroupId } from "@/types/domain";

export type ResolvedTeam = NonNullable<ReturnType<typeof teamById>>;

/**
 * Result of resolving one side of a match.
 *
 *  - "team": we know the exact team
 *  - "placeholder": we know how to describe the slot (e.g. "Winner R32-M1")
 *    but the upstream data isn't filled in yet
 */
export type ResolvedSide =
  | { kind: "team"; team: ResolvedTeam }
  | { kind: "placeholder"; label: string };

export interface ResolvedMatch {
  match: BracketMatch;
  home: ResolvedSide;
  away: ResolvedSide;
  pick: KnockoutPick | null;
  /** Convenience: true if pick exists and scores are not equal. */
  hasValidWinner: boolean;
  /** The winning team id if both teams are known AND pick is non-tie. */
  winnerTeamId: string | null;
  loserTeamId: string | null;
}

interface ResolveContext {
  groupOrder: Partial<Record<GroupId, string[]>>;
  bestThirds: string[];
  knockoutPicks: Record<string, KnockoutPick>;
}

/** True if every group has 4 ordered teams. */
export function isGroupOrderComplete(
  groupOrder: Partial<Record<GroupId, string[]>>,
): boolean {
  return groupIds.every((g) => {
    const arr = groupOrder[g];
    return Array.isArray(arr) && arr.length === 4;
  });
}

/** True if best-thirds is exactly 8 valid team ids. */
export function isBestThirdsComplete(bestThirds: string[]): boolean {
  return bestThirds.length === 8 && bestThirds.every((id) => !!teamById(id));
}

/**
 * Pre-compute the best-thirds slot assignment once per context. Returns
 * { matchId -> GroupId } and the map { GroupId -> teamId (the 3rd-place
 * finisher of that group) } for fast lookup.
 */
function buildThirdsLookup(ctx: ResolveContext) {
  // bestThirds is a list of team ids; we need to know which GROUP each one
  // represents, since FIFA slots by group letter, not by team identity.
  const bestThirdGroups: GroupId[] = [];
  const thirdTeamByGroup: Partial<Record<GroupId, string>> = {};

  // For each pick, find the group whose 3rd-place id matches that pick.
  for (const teamId of ctx.bestThirds) {
    const team = teamById(teamId);
    if (!team) continue;
    const groupArr = ctx.groupOrder[team.group as GroupId];
    if (!groupArr || groupArr.length !== 4) continue;
    if (groupArr[2] !== teamId) continue; // must actually be the 3rd of that group
    bestThirdGroups.push(team.group as GroupId);
    thirdTeamByGroup[team.group as GroupId] = teamId;
  }

  const slotAssignment =
    bestThirdGroups.length === 8 ? assignBestThirdsToSlots(bestThirdGroups) : {};

  return { slotAssignment, thirdTeamByGroup };
}

/** Look up the team in `position` (1-indexed) of `group`, if known. */
function teamAtGroupPosition(
  group: GroupId,
  position: number,
  ctx: ResolveContext,
): ResolvedTeam | null {
  const arr = ctx.groupOrder[group];
  if (!arr || arr.length !== 4) return null;
  const id = arr[position - 1];
  return teamById(id) ?? null;
}

function placeholderForSlot(slot: Slot): string {
  switch (slot.kind) {
    case "GroupWinner":
      return `1${slot.group} · Winner Group ${slot.group}`;
    case "GroupRunnerUp":
      return `2${slot.group} · Runner-up Group ${slot.group}`;
    case "GroupThird":
      return `3rd Place · Group ${slot.candidates.join("/")}`;
    case "MatchWinner": {
      const m = getMatch(slot.matchId);
      return m ? `Winner ${m.label}` : `Winner ${slot.matchId}`;
    }
    case "MatchLoser": {
      const m = getMatch(slot.matchId);
      return m ? `Loser ${m.label}` : `Loser ${slot.matchId}`;
    }
  }
}

function resolveSlot(
  slot: Slot,
  ctx: ResolveContext,
  resolved: Map<string, ResolvedMatch>,
  thirdsLookup: ReturnType<typeof buildThirdsLookup>,
): ResolvedSide {
  switch (slot.kind) {
    case "GroupWinner": {
      const team = teamAtGroupPosition(slot.group, 1, ctx);
      return team ? { kind: "team", team } : { kind: "placeholder", label: placeholderForSlot(slot) };
    }
    case "GroupRunnerUp": {
      const team = teamAtGroupPosition(slot.group, 2, ctx);
      return team ? { kind: "team", team } : { kind: "placeholder", label: placeholderForSlot(slot) };
    }
    case "GroupThird": {
      // Find which 3rd-place group has been routed to the slot whose
      // GroupThird this is. We must look up the match this slot belongs to,
      // but slots don't carry that. Instead the caller resolves by match id.
      // This branch shouldn't be hit directly — see resolveMatch().
      return { kind: "placeholder", label: placeholderForSlot(slot) };
    }
    case "MatchWinner": {
      const upstream = resolved.get(slot.matchId);
      if (upstream && upstream.winnerTeamId) {
        const team = teamById(upstream.winnerTeamId);
        if (team) return { kind: "team", team };
      }
      return { kind: "placeholder", label: placeholderForSlot(slot) };
    }
    case "MatchLoser": {
      const upstream = resolved.get(slot.matchId);
      if (upstream && upstream.loserTeamId) {
        const team = teamById(upstream.loserTeamId);
        if (team) return { kind: "team", team };
      }
      return { kind: "placeholder", label: placeholderForSlot(slot) };
    }
  }
  // exhaustive
  void thirdsLookup;
  return { kind: "placeholder", label: "TBD" };
}

/**
 * Resolve every match in canonical order so MatchWinner / MatchLoser
 * slots can reach back into already-resolved upstream matches.
 */
export function resolveAllMatches(ctx: ResolveContext): ResolvedMatch[] {
  const thirdsLookup = buildThirdsLookup(ctx);
  const groups = teamsByGroup();

  const resolved = new Map<string, ResolvedMatch>();
  const result: ResolvedMatch[] = [];

  for (const match of allMatches) {
    // Resolve home + away. For GroupThird we need the slot's match id.
    const resolveSide = (slot: Slot): ResolvedSide => {
      if (slot.kind === "GroupThird") {
        const assignedGroup = thirdsLookup.slotAssignment[match.id];
        if (assignedGroup) {
          // Find the 3rd team of that group (group order pos 3).
          const arr = ctx.groupOrder[assignedGroup];
          if (arr && arr.length === 4) {
            const team = teamById(arr[2]);
            if (team) return { kind: "team", team };
          }
          // group order incomplete — placeholder
          const teamsInGroup = groups[assignedGroup];
          return {
            kind: "placeholder",
            label: `3rd Place · Group ${assignedGroup} (${teamsInGroup.length} teams)`,
          };
        }
        return { kind: "placeholder", label: placeholderForSlot(slot) };
      }
      return resolveSlot(slot, ctx, resolved, thirdsLookup);
    };

    const home = resolveSide(match.home);
    const away = resolveSide(match.away);
    const pick = ctx.knockoutPicks[match.id] ?? null;

    let winnerTeamId: string | null = null;
    let loserTeamId: string | null = null;
    let hasValidWinner = false;

    if (
      pick &&
      home.kind === "team" &&
      away.kind === "team" &&
      pick.homeScore !== pick.awayScore &&
      Number.isFinite(pick.homeScore) &&
      Number.isFinite(pick.awayScore)
    ) {
      hasValidWinner = true;
      if (pick.homeScore > pick.awayScore) {
        winnerTeamId = home.team.id;
        loserTeamId = away.team.id;
      } else {
        winnerTeamId = away.team.id;
        loserTeamId = home.team.id;
      }
    }

    const rm: ResolvedMatch = {
      match,
      home,
      away,
      pick,
      hasValidWinner,
      winnerTeamId,
      loserTeamId,
    };
    resolved.set(match.id, rm);
    result.push(rm);
  }

  return result;
}

/** Count of matches with a valid (non-tie) prediction across the bracket. */
export function countPredictedMatches(
  knockoutPicks: Record<string, KnockoutPick>,
): number {
  let n = 0;
  for (const m of allMatches) {
    const p = knockoutPicks[m.id];
    if (!p) continue;
    if (
      Number.isFinite(p.homeScore) &&
      Number.isFinite(p.awayScore) &&
      p.homeScore !== p.awayScore
    ) {
      n += 1;
    }
  }
  return n;
}
