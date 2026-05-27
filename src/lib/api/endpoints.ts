import { apiFetch } from "@/lib/api/client";
import type { LeaderboardEntry, Match, MatchStage, Prediction, Team } from "@/types/domain";

export const cacheTags = {
  matches: "matches",
  teams: "teams",
  predictions: "predictions",
  leaderboard: "leaderboard",
} as const;

export const matchesApi = {
  list: (params?: { stage?: MatchStage; from?: string; to?: string }) =>
    apiFetch<Match[]>("/matches", { query: params, tags: [cacheTags.matches], revalidate: 60 }),

  byId: (id: string) =>
    apiFetch<Match>(`/matches/${id}`, { tags: [cacheTags.matches, `match:${id}`], revalidate: 60 }),
};

export const teamsApi = {
  list: () => apiFetch<Team[]>("/teams", { tags: [cacheTags.teams], revalidate: 3600 }),
  byId: (id: string) => apiFetch<Team>(`/teams/${id}`, { tags: [cacheTags.teams], revalidate: 3600 }),
};

export const predictionsApi = {
  listForUser: (userId: string) =>
    apiFetch<Prediction[]>(`/users/${userId}/predictions`, {
      tags: [cacheTags.predictions, `predictions:${userId}`],
      revalidate: 30,
    }),

  submit: (input: { matchId: string; home: number; away: number }) =>
    apiFetch<Prediction>("/predictions", { method: "POST", body: input }),
};

export const leaderboardApi = {
  global: (limit = 50) =>
    apiFetch<LeaderboardEntry[]>("/leaderboard", {
      query: { limit },
      tags: [cacheTags.leaderboard],
      revalidate: 60,
    }),
};
