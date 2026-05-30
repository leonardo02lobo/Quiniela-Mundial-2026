"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API_URL = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

interface PickInput {
  bracketId: string;
  fifaNumber: number;
  home: number;
  away: number;
}

export interface SubmitResult {
  ok: boolean;
  submitted: number;
  errors: Array<{ bracketId: string; message: string }>;
}

async function fetchMatchIdMap(): Promise<Map<number, string>> {
  const stages = ["round-of-32", "round-of-16", "quarter-final", "semi-final", "third-place", "final"];
  const map = new Map<number, string>();

  await Promise.all(
    stages.map(async (stage) => {
      try {
        const res = await fetch(`${API_URL}/matches?stage=${stage}`, {
          next: { revalidate: 3600, tags: ["matches"] },
        });
        if (!res.ok) return;
        const matches = (await res.json()) as Array<{ id: string; fifaNumber: number | null }>;
        for (const m of matches) {
          if (m.fifaNumber != null) map.set(m.fifaNumber, m.id);
        }
      } catch {
        // silently skip failed stages — partial maps are handled below
      }
    })
  );

  return map;
}

export async function submitKnockoutPredictions(picks: PickInput[]): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.backendToken) {
    return { ok: false, submitted: 0, errors: [{ bracketId: "*", message: "Sesión expirada, vuelve a iniciar sesión" }] };
  }

  const token = session.user.backendToken;
  const matchIdMap = await fetchMatchIdMap();

  const results = await Promise.allSettled(
    picks.map(async (pick) => {
      const matchId = matchIdMap.get(pick.fifaNumber);
      if (!matchId) throw new Error(`Partido no encontrado (FIFA #${pick.fifaNumber})`);

      const res = await fetch(`${API_URL}/predictions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, home: pick.home, away: pick.away }),
      });

      if (res.status === 403) throw new Error("El plazo de este partido ya cerró");
      if (res.status === 401) throw new Error("Token expirado");
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error HTTP ${res.status}`);
      }
      return pick.bracketId;
    })
  );

  let submitted = 0;
  const errors: SubmitResult["errors"] = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      submitted++;
    } else {
      errors.push({
        bracketId: picks[i].bracketId,
        message: (r.reason as Error).message ?? "Error desconocido",
      });
    }
  });

  if (submitted > 0) revalidatePath("/predictions/knockout");

  return { ok: errors.length === 0, submitted, errors };
}
