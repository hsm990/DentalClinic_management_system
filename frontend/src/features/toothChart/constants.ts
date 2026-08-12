import type { ToothCondition } from "./toothChartApi";

export const CONDITION_LABELS: Record<ToothCondition, string> = {
  HEALTHY: "Healthy",
  DECAYED: "Decayed",
  FILLED: "Filled",
  CROWNED: "Crowned",
  ROOT_CANAL: "Root Canal",
  MISSING: "Missing",
  IMPLANT: "Implant",
  FRACTURED: "Fractured",
  IMPACTED: "Impacted",
};

// tailwind classes per condition — greens for healthy/treated, ambers/reds for problems
export const CONDITION_COLORS: Record<ToothCondition, string> = {
  HEALTHY: "bg-emerald-50 border-emerald-300 text-emerald-800",
  DECAYED: "bg-red-50 border-red-400 text-red-800",
  FILLED: "bg-blue-50 border-blue-300 text-blue-800",
  CROWNED: "bg-purple-50 border-purple-300 text-purple-800",
  ROOT_CANAL: "bg-orange-50 border-orange-400 text-orange-800",
  MISSING: "bg-gray-100 border-gray-300 text-gray-500",
  IMPLANT: "bg-cyan-50 border-cyan-300 text-cyan-800",
  FRACTURED: "bg-amber-50 border-amber-400 text-amber-800",
  IMPACTED: "bg-rose-50 border-rose-400 text-rose-800",
};

// FDI notation quadrant layout, matches your schema reference doc
export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
