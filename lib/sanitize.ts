import type { Scenario, SimulationResult } from "./types";

const INCOME_MIN = 0;
const INCOME_MAX = 1_000_000;
const SCORE_MIN = 0;
const SCORE_MAX = 100;

function clamp(value: number, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function sanitizeScenario(raw: unknown, defaults: Scenario): Scenario {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const income5Year = clamp(safeNumber(obj.income5Year, defaults.income5Year), INCOME_MIN, INCOME_MAX);
  const income10Year = clamp(safeNumber(obj.income10Year, defaults.income10Year), INCOME_MIN, INCOME_MAX);
  const probability = Math.max(0, safeNumber(obj.probability, defaults.probability));
  const description = safeString(obj.description, defaults.description);
  return { income5Year, income10Year, probability, description };
}

function normalizeProbabilities(
  best: Scenario,
  average: Scenario,
  worst: Scenario
): [Scenario, Scenario, Scenario] {
  const total = best.probability + average.probability + worst.probability;
  if (total <= 0) {
    return [
      { ...best, probability: 1 / 3 },
      { ...average, probability: 1 / 3 },
      { ...worst, probability: 1 / 3 },
    ];
  }
  return [
    { ...best, probability: best.probability / total },
    { ...average, probability: average.probability / total },
    { ...worst, probability: worst.probability / total },
  ];
}

const defaultScenario: Scenario = {
  income5Year: 0,
  income10Year: 0,
  probability: 1 / 3,
  description: "",
};

/**
 * Sanitizes a raw simulation result: clamps numbers, normalizes probabilities,
 * ensures required fields exist, and filters invalid reasoning items.
 */
export function sanitizeSimulation(raw: SimulationResult): SimulationResult {
  const obj = raw && typeof raw === "object" ? (raw as unknown as Record<string, unknown>) : raw;
  const option = safeString(obj?.option, "Option");
  const optionName = safeString(obj?.optionName, option);

  const bestCase = sanitizeScenario(obj?.bestCase, defaultScenario);
  const averageCase = sanitizeScenario(obj?.averageCase, defaultScenario);
  const worstCase = sanitizeScenario(obj?.worstCase, defaultScenario);

  const [best, average, worst] = normalizeProbabilities(bestCase, averageCase, worstCase);

  const riskScore = clamp(safeNumber(obj?.riskScore, 50), SCORE_MIN, SCORE_MAX);
  const stressLevel = clamp(safeNumber(obj?.stressLevel, 50), SCORE_MIN, SCORE_MAX);
  const careerTrajectory = safeString(obj?.careerTrajectory, "");

  const rawReasoning = Array.isArray(obj?.reasoning) ? obj.reasoning : [];
  const reasoning = rawReasoning.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  );

  return {
    option,
    optionName,
    bestCase: best,
    averageCase: average,
    worstCase: worst,
    riskScore,
    stressLevel,
    careerTrajectory,
    reasoning,
  };
}
