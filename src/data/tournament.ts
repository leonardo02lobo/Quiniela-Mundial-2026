import type { GroupId, Team } from "@/types/domain";

type TeamSeed = Omit<Team, "group"> & { group: GroupId };

const t = (id: string, name: string, code: string, group: GroupId): TeamSeed => ({
  id,
  name,
  code,
  flagUrl: `https://hatscripts.github.io/circle-flags/flags/${id}.svg`,
  group,
});

export const teams: TeamSeed[] = [
  t("mx", "México", "MEX", "A"),
  t("za", "Sudáfrica", "RSA", "A"),
  t("kr", "Corea del Sur", "KOR", "A"),
  t("cz", "Chequia", "CZE", "A"),

  t("ca", "Canadá", "CAN", "B"),
  t("ba", "Bosnia y Herzegovina", "BIH", "B"),
  t("qa", "Qatar", "QAT", "B"),
  t("ch", "Suiza", "SUI", "B"),

  t("br", "Brasil", "BRA", "C"),
  t("ma", "Marruecos", "MAR", "C"),
  t("ht", "Haití", "HAI", "C"),
  t("sct", "Escocia", "SCO", "C"),

  t("us", "Estados Unidos", "USA", "D"),
  t("py", "Paraguay", "PAR", "D"),
  t("au", "Australia", "AUS", "D"),
  t("tr", "Turquía", "TUR", "D"),

  t("de", "Alemania", "GER", "E"),
  t("cw", "Curazao", "CUW", "E"),
  t("ci", "Costa de Marfil", "CIV", "E"),
  t("ec", "Ecuador", "ECU", "E"),

  t("nl", "Países Bajos", "NED", "F"),
  t("jp", "Japón", "JPN", "F"),
  t("se", "Suecia", "SWE", "F"),
  t("tn", "Túnez", "TUN", "F"),

  t("be", "Bélgica", "BEL", "G"),
  t("eg", "Egipto", "EGY", "G"),
  t("ir", "Irán", "IRN", "G"),
  t("nz", "Nueva Zelanda", "NZL", "G"),

  t("es", "España", "ESP", "H"),
  t("cv", "Cabo Verde", "CPV", "H"),
  t("sa", "Arabia Saudita", "KSA", "H"),
  t("uy", "Uruguay", "URU", "H"),

  t("fr", "Francia", "FRA", "I"),
  t("sn", "Senegal", "SEN", "I"),
  t("iq", "Irak", "IRQ", "I"),
  t("no", "Noruega", "NOR", "I"),

  t("ar", "Argentina", "ARG", "J"),
  t("dz", "Argelia", "ALG", "J"),
  t("at", "Austria", "AUT", "J"),
  t("jo", "Jordania", "JOR", "J"),

  t("pt", "Portugal", "POR", "K"),
  t("cd", "RD del Congo", "COD", "K"),
  t("uz", "Uzbekistán", "UZB", "K"),
  t("co", "Colombia", "COL", "K"),

  t("gb-eng", "Inglaterra", "ENG", "L"),
  t("hr", "Croacia", "CRO", "L"),
  t("gh", "Ghana", "GHA", "L"),
  t("pa", "Panamá", "PAN", "L"),
];

export const groupIds: readonly GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export function teamsByGroup(): Record<GroupId, TeamSeed[]> {
  return groupIds.reduce(
    (acc, id) => {
      acc[id] = teams.filter((team) => team.group === id);
      return acc;
    },
    {} as Record<GroupId, TeamSeed[]>,
  );
}

export function teamById(id: string): TeamSeed | undefined {
  return teams.find((team) => team.id === id);
}
