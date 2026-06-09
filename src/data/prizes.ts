import type { Stage } from "@/data/bracket";

export type PrizePhase = "GROUPS" | Stage;

export interface PrizeSponsor {
  /** Display name (also used for alt text). */
  name: string;
  /** Path under /public. */
  logoSrc: string;
}

export interface Prize {
  /** Rank in the prize ladder. 1 = highest (Final). */
  rank: number;
  phase: PrizePhase;
  /** Phase label exactly as it appears in the rest of the UI. */
  phaseLabel: string;
  /** Full prize description shown to the user. */
  description: string;
  sponsor: PrizeSponsor;
}

/**
 * Ordered from highest-value prize (Final) to lowest (group stage),
 * matching how the prize ladder is awarded by phase.
 */
export const prizes: Prize[] = [
  {
    rank: 1,
    phase: "FINAL",
    phaseLabel: "Final",
    description: "Video profesional de empresa o negocio por Megavisión",
    sponsor: { name: "Megavisión", logoSrc: "/assets/partners/megavision.png" },
  },
  {
    rank: 2,
    phase: "3RD",
    phaseLabel: "Tercer Puesto",
    description: "Descuento en compras en Smarket",
    sponsor: { name: "Smarket", logoSrc: "/assets/partners/smarket.png" },
  },
  {
    rank: 3,
    phase: "SF",
    phaseLabel: "Semifinales",
    description: "1 comida para dos personas en Don Chorizo",
    sponsor: { name: "Don Chorizo", logoSrc: "/assets/partners/don-chorizo.png" },
  },
  {
    rank: 4,
    phase: "QF",
    phaseLabel: "Cuartos de Final",
    description: "Franela de tu equipo favorito en Uniformes Tiffany",
    sponsor: { name: "Deportes Tifany", logoSrc: "/assets/partners/tifany.png" },
  },
  {
    rank: 5,
    phase: "R16",
    phaseLabel: "Octavos de Final",
    description: "$20 de abono en Gogoroyal",
    sponsor: { name: "Gogoroyal", logoSrc: "/assets/partners/gogoroyal.jpg" },
  },
  {
    rank: 6,
    phase: "R32",
    phaseLabel: "Dieciseisavos de Final",
    description: "Combo de streaming de Tucentro",
    sponsor: { name: "Tucentro Net", logoSrc: "/assets/partners/tucentro-net.png" },
  },
  {
    rank: 7,
    phase: "GROUPS",
    phaseLabel: "Fase de Grupos",
    description: "10% de descuento en Unóptica",
    sponsor: { name: "Unóptica", logoSrc: "/assets/partners/unoptica.png" },
  },
];

export function prizeForPhase(phase: PrizePhase): Prize | undefined {
  return prizes.find((p) => p.phase === phase);
}
