import { getImplementPresets } from "@/lib/implement-options";
import type { TrainingTemplate } from "@/types/template";

const now = "2026-01-01T00:00:00.000Z";

function series(
  discipline: string,
  technique: string,
  throwCount: number,
  implement?: string,
  intensity = 80,
  purpose: "technique" | "speed" | "competition" | "warmup" = "technique"
) {
  return {
    seriesType: "Throw" as const,
    discipline,
    technique,
    implementWeight: implement ?? getImplementPresets(discipline)[0] ?? "",
    throwCount,
    intensityPercent: intensity,
    purpose,
    note: "",
  };
}

export function getDefaultTemplates(): TrainingTemplate[] {
  return [
    {
      id: "tpl-hammer-disk-tech",
      name: "Kladivo + Disk – technika",
      description: "Technický trénink kladiva a disku",
      phases: [
        {
          title: "Technika kladivo + disk",
          type: "training",
          disciplines: ["kladivo", "disk"],
          plannedSeries: [
            series("kladivo", "2/2", 6, "6 kg", 75),
            series("kladivo", "3/2", 6, "5 kg", 80),
            series("disk", "HT", 8, "1 kg", 80),
            series("disk", "FT", 6, "1,5 kg", 85),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-disk-tech",
      name: "Disk – technika",
      description: "Technický trénink disku",
      phases: [
        {
          title: "Disk technika",
          type: "training",
          disciplines: ["disk"],
          plannedSeries: [
            series("disk", "ST", 6, "800 g", 70),
            series("disk", "HT", 8, "1 kg", 80),
            series("disk", "FT", 6, "1,5 kg", 85),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-disk-comp-prep",
      name: "Disk – závodní příprava",
      description: "Závodní příprava disku",
      phases: [
        {
          title: "Závodní příprava disk",
          type: "training",
          disciplines: ["disk"],
          plannedSeries: [
            series("disk", "PO", 4, "1,5 kg", 90, "competition"),
            series("disk", "FT", 8, "1,75 kg", 90, "competition"),
            series("disk", "FT", 4, "2 kg", 95, "competition"),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-hammer-tech",
      name: "Kladivo – technika",
      description: "Technický trénink kladiva",
      phases: [
        {
          title: "Kladivo technika",
          type: "training",
          disciplines: ["kladivo"],
          plannedSeries: [
            series("kladivo", "2/1", 6, "5 kg", 70),
            series("kladivo", "2/2", 8, "6 kg", 80),
            series("kladivo", "3/2", 6, "6 kg", 85),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-shot-tech",
      name: "Koule – technika",
      description: "Technický trénink koule",
      phases: [
        {
          title: "Koule technika",
          type: "training",
          disciplines: ["koule"],
          plannedSeries: [
            series("koule", "ST", 6, "5 kg", 70),
            series("koule", "GT", 8, "6 kg", 80),
            series("koule", "FT", 6, "7,26 kg", 85),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-activation",
      name: "Aktivace před závodem",
      description: "Lehká aktivace před závodem",
      phases: [
        {
          title: "Aktivace",
          type: "activation",
          disciplines: ["disk", "koule", "kladivo"],
          plannedSeries: [
            series("disk", "PO", 3, "1 kg", 60, "warmup"),
            series("koule", "PO", 3, "4 kg", 60, "warmup"),
            series("kladivo", "2/1", 3, "4 kg", 60, "warmup"),
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-regeneration",
      name: "Regenerace",
      description: "Regenerační trénink",
      phases: [
        {
          title: "Regenerace",
          type: "regeneration",
          disciplines: ["mobilita", "kardio"],
          plannedSeries: [
            {
              seriesType: "Throw",
              discipline: "mobilita",
              technique: "",
              implementWeight: "Žádné nářadí",
              throwCount: 0,
              intensityPercent: 50,
              purpose: "warmup",
              note: "Mobilita a protažení",
            },
            {
              seriesType: "Throw",
              discipline: "kardio",
              technique: "",
              implementWeight: "Žádné nářadí",
              throwCount: 0,
              intensityPercent: 50,
              purpose: "warmup",
              note: "Lehké kardio 20 min",
            },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
