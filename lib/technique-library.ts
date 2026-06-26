export interface TechniqueOption {
  code: string;
  label: string;
}

const DISK_TECHNIQUES: TechniqueOption[] = [
  { code: "ST", label: "z místa" },
  { code: "SA", label: "South African" },
  { code: "HT", label: "poloviční otočka" },
  { code: "FT", label: "plná otočka" },
  { code: "PO", label: "punchout" },
];

const KOULE_TECHNIQUES: TechniqueOption[] = [
  { code: "PO", label: "punchout" },
  { code: "ST", label: "z místa" },
  { code: "HT", label: "poloviční otočka" },
  { code: "FT", label: "otočka" },
  { code: "GT", label: "sun / glide turn" },
];

const KLADIVO_TECHNIQUES: TechniqueOption[] = [
  { code: "2/1", label: "nášvihy/otočky" },
  { code: "2/2", label: "nášvihy/otočky" },
  { code: "2/3", label: "nášvihy/otočky" },
  { code: "2/4", label: "nášvihy/otočky" },
  { code: "3/1", label: "nášvihy/otočky" },
  { code: "3/2", label: "nášvihy/otočky" },
  { code: "3/3", label: "nášvihy/otočky" },
  { code: "3/4", label: "nášvihy/otočky" },
];

const TECHNIQUES_BY_DISCIPLINE: Record<string, TechniqueOption[]> = {
  disk: DISK_TECHNIQUES,
  koule: KOULE_TECHNIQUES,
  kladivo: KLADIVO_TECHNIQUES,
};

export function getTechniquesForDiscipline(discipline: string): TechniqueOption[] {
  return TECHNIQUES_BY_DISCIPLINE[discipline] ?? [];
}

export function hasTechniqueLibrary(discipline: string): boolean {
  return discipline in TECHNIQUES_BY_DISCIPLINE;
}

export function getTechniqueOption(
  discipline: string,
  code: string
): TechniqueOption | undefined {
  return getTechniquesForDiscipline(discipline).find((item) => item.code === code);
}

/** Display: "ST — z místa" or legacy free-text as-is */
export function formatTechniqueDisplay(discipline: string, technique: string): string {
  const trimmed = technique?.trim();
  if (!trimmed) return "";

  const option = getTechniqueOption(discipline, trimmed);
  if (option) {
    if (discipline === "kladivo") {
      return `${option.code} (${option.label})`;
    }
    return `${option.code} — ${option.label}`;
  }

  return trimmed;
}

export function resolveTechniqueForDiscipline(
  discipline: string,
  technique: string
): string {
  if (!technique?.trim()) {
    const first = getTechniquesForDiscipline(discipline)[0];
    return first?.code ?? "";
  }

  const trimmed = technique.trim();
  const byCode = getTechniqueOption(discipline, trimmed);
  if (byCode) return byCode.code;

  return trimmed;
}

export const TECHNIQUE_LIBRARY_DISCIPLINES = ["disk", "koule", "kladivo"] as const;
