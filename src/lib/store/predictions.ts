"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroupId } from "@/types/domain";

export interface KnockoutPick {
  homeScore: number;
  awayScore: number;
}

interface PredictionsState {
  /** For each group, the user's predicted finishing order: array of 4 team ids, position 0 = winner. */
  groupOrder: Partial<Record<GroupId, string[]>>;
  /** The 8 team ids the user picked as best third-placed teams. */
  bestThirds: string[];
  /** Per-match knockout score predictions keyed by match id. */
  knockoutPicks: Record<string, KnockoutPick>;

  setGroupOrder: (group: GroupId, teamIds: string[]) => void;
  setBestThirds: (teamIds: string[]) => void;
  setKnockoutPick: (matchId: string, pick: KnockoutPick) => void;
  reset: () => void;
}

const initialState = {
  groupOrder: {},
  bestThirds: [],
  knockoutPicks: {},
};

export const usePredictionsStore = create<PredictionsState>()(
  persist(
    (set) => ({
      ...initialState,
      setGroupOrder: (group, teamIds) =>
        set((s) => ({ groupOrder: { ...s.groupOrder, [group]: teamIds } })),
      setBestThirds: (teamIds) => set({ bestThirds: teamIds }),
      setKnockoutPick: (matchId, pick) =>
        set((s) => ({ knockoutPicks: { ...s.knockoutPicks, [matchId]: pick } })),
      reset: () => set(initialState),
    }),
    { name: "hwc-quiniela:predictions", skipHydration: true },
  ),
);
