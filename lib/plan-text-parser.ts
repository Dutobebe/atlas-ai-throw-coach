import { getImplementPresets } from "@/lib/implement-options";
import { getTechniquesForDiscipline } from "@/lib/technique-library";
import {
  emptySeries,
  normalizeSeries,
  uid,
} from "@/lib/training-utils";
import type { TrainingSeries } from "@/types/training";

const DISCIPLINE_HEADERS: Record<string, string> = {
  kladivo: "kladivo",
  disk: "disk",
  koule: "koule",
  ostep: "ostep",
  oštěp: "ostep",
  medicinbal: "medicinbal",
  posilovna: "posilovna",
  kardio: "kardio",
  mobilita: "mobilita",
};

const TECHNIQUE_ALIASES: Record<string, Record<string, string>> = {
  disk: {
    "z místa": "ST",
    "z mista": "ST",
    "půlotočka": "HT",
    "pulotočka": "HT",
    "poloviční otočka": "HT",
    "polovicni otocka": "HT",
    "plná otočka": "FT",
    "plna otocka": "FT",
    "otočka": "FT",
    "otocka": "FT",
    "south african": "SA",
    "punchout": "PO",
  },
  koule: {
    "z místa": "ST",
    "z mista": "ST",
    "půlotočka": "HT",
    "pulotočka": "HT",
    "poloviční otočka": "HT",
    "otočka": "FT",
    "otocka": "FT",
    "punchout": "PO",
  },
};

const WEIGHT_PATTERN = /^(\d+(?:[,.]\d+)?)\s*(kg|g)\b/i;
const THROW_COUNT_PATTERN = /(\d+)\s*hod(ů|u)?\s*$/i;

export interface ParsedPlanSeries {
  implementWeight: string;
  technique: string;
  throwCount: number;
  rawLine: string;
}

export interface ParsedPlanBlock {
  discipline: string;
  series: ParsedPlanSeries[];
  unparsedLines: string[];
}

export interface ParsePlanTextResult {
  blocks: ParsedPlanBlock[];
  /** True when nothing could be structured — caller should preserve full text */
  isAmbiguous: boolean;
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function resolveDisciplineHeader(header: string): string | null {
  const lower = header.trim().toLowerCase();
  const normalized = stripDiacritics(lower);

  if (DISCIPLINE_HEADERS[lower]) return DISCIPLINE_HEADERS[lower];
  if (DISCIPLINE_HEADERS[normalized]) return DISCIPLINE_HEADERS[normalized];

  if (normalized.includes("kladiv")) return "kladivo";
  if (normalized.includes("disk")) return "disk";
  if (normalized.includes("koul")) return "koule";
  if (normalized.includes("ostep") || normalized.includes("ostep")) return "ostep";

  return null;
}

function parseHeaderLine(line: string): string | null {
  const match = line.match(/^(.+):\s*$/);
  if (!match) return null;
  return resolveDisciplineHeader(match[1]);
}

function normalizeImplementWeight(discipline: string, rawWeight: string, unit: string): string {
  const weightNum = rawWeight.replace(".", ",");
  const formatted =
    unit.toLowerCase() === "g" ? `${weightNum} g` : `${weightNum} kg`;

  const presets = getImplementPresets(discipline);
  const compact = formatted.replace(/\s/g, "").toLowerCase();
  for (const preset of presets) {
    if (preset.replace(/\s/g, "").toLowerCase() === compact) {
      return preset;
    }
  }

  return formatted;
}

function resolveTechniqueFromText(discipline: string, text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  const normalized = stripDiacritics(lower);

  if (/^\d+\/\d+$/.test(lower)) {
    return lower;
  }

  const aliases = TECHNIQUE_ALIASES[discipline];
  if (aliases?.[lower]) return aliases[lower];
  if (aliases?.[normalized]) return aliases[normalized];

  for (const option of getTechniquesForDiscipline(discipline)) {
    if (option.code.toLowerCase() === lower) return option.code;
    if (option.label.toLowerCase() === lower) return option.code;
    if (stripDiacritics(option.label.toLowerCase()) === normalized) return option.code;
  }

  return trimmed;
}

export function parseSeriesLine(line: string, discipline: string): ParsedPlanSeries | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const countMatch = trimmed.match(THROW_COUNT_PATTERN);
  if (!countMatch || countMatch.index === undefined) return null;

  const throwCount = parseInt(countMatch[1], 10);
  if (Number.isNaN(throwCount)) return null;

  let rest = trimmed.slice(0, countMatch.index).trim();
  const weightMatch = rest.match(WEIGHT_PATTERN);
  if (!weightMatch) return null;

  const implementWeight = normalizeImplementWeight(
    discipline,
    weightMatch[1],
    weightMatch[2]
  );
  rest = rest.slice(weightMatch[0].length).trim();

  const technique = resolveTechniqueFromText(discipline, rest);

  return {
    implementWeight,
    technique,
    throwCount,
    rawLine: line,
  };
}

/** Parse free-text plan into discipline blocks and series lines. */
export function parsePlanText(text: string): ParsePlanTextResult {
  const lines = text.split(/\r?\n/);
  const blocks: ParsedPlanBlock[] = [];
  let currentDiscipline = "disk";
  let currentBlock: ParsedPlanBlock | null = null;
  let parsedAnySeries = false;

  function ensureBlock(discipline: string): ParsedPlanBlock {
    if (currentBlock && currentBlock.discipline === discipline) {
      return currentBlock;
    }
    currentBlock = { discipline, series: [], unparsedLines: [] };
    blocks.push(currentBlock);
    return currentBlock;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headerDiscipline = parseHeaderLine(line);
    if (headerDiscipline) {
      currentDiscipline = headerDiscipline;
      currentBlock = null;
      ensureBlock(currentDiscipline);
      continue;
    }

    const block = ensureBlock(currentDiscipline);
    const parsed = parseSeriesLine(line, block.discipline);
    if (parsed) {
      block.series.push(parsed);
      parsedAnySeries = true;
    } else {
      block.unparsedLines.push(line);
    }
  }

  const nonEmptyBlocks = blocks.filter(
    (block) => block.series.length > 0 || block.unparsedLines.length > 0
  );

  return {
    blocks: nonEmptyBlocks,
    isAmbiguous: !parsedAnySeries && text.trim().length > 0,
  };
}

function unparsedLineToSeries(discipline: string, line: string): TrainingSeries {
  return normalizeSeries({
    ...emptySeries(discipline),
    id: uid(),
    note: line,
    throwCount: 0,
  });
}

function parsedSeriesToTraining(
  discipline: string,
  parsed: ParsedPlanSeries
): TrainingSeries {
  return normalizeSeries({
    ...emptySeries(discipline),
    id: uid(),
    implementWeight: parsed.implementWeight,
    technique: parsed.technique,
    throwCount: parsed.throwCount,
    note: parsed.rawLine,
  });
}

/** Convert parsed plan text into editable training series (preserves unparsed content). */
export function parsePlanTextToSeries(text: string): TrainingSeries[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const { blocks, isAmbiguous } = parsePlanText(trimmed);

  if (isAmbiguous) {
    return [
      normalizeSeries({
        ...emptySeries("disk"),
        id: uid(),
        note: trimmed,
        throwCount: 0,
      }),
    ];
  }

  const series: TrainingSeries[] = [];

  for (const block of blocks) {
    for (const parsed of block.series) {
      series.push(parsedSeriesToTraining(block.discipline, parsed));
    }
    for (const line of block.unparsedLines) {
      series.push(unparsedLineToSeries(block.discipline, line));
    }
  }

  if (series.length === 0) {
    return [
      normalizeSeries({
        ...emptySeries("disk"),
        id: uid(),
        note: trimmed,
        throwCount: 0,
      }),
    ];
  }

  return series;
}
