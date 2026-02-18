import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DecisionInput, ComparisonOutput } from "./types";

const SYSTEM_INSTRUCTION =
  "You are a career simulation engine. Return ONLY valid JSON matching ComparisonOutput type. Base predictions on statistical outcomes, risk tolerance, and goal alignment. NO explanatory text.";

/**
 * Strips markdown code block markers (e.g. ```json ... ```) from model output.
 */
function stripJsonMarkdown(raw: string): string {
  let text = raw.trim();
  const jsonBlockMatch = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/i.exec(text);
  if (jsonBlockMatch) {
    text = jsonBlockMatch[1].trim();
  }
  return text;
}

/**
 * Runs the career simulation via Gemini and returns a typed comparison.
 * @throws Error if GEMINI_API_KEY is missing, the API fails, or the response is invalid JSON.
 */
export async function runSimulation(
  input: DecisionInput
): Promise<ComparisonOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const userPrompt = `Simulate career outcomes for this decision.

Profile: ${JSON.stringify(input.profile)}
Option A: ${input.optionA}
Option B: ${input.optionB}

Return a single JSON object with:
- optionA: SimulationResult for option A (use option: "A", optionName: the exact label the user gave for Option A above)
- optionB: SimulationResult for option B (use option: "B", optionName: the exact label the user gave for Option B above)
- percentageOptionA: number (0-100) — share of similar profiles who chose option A
- percentageOptionB: number (0-100) — share of similar profiles who chose option B (percentageOptionA + percentageOptionB must sum to 100)
- choiceSplit: { optionA: number, optionB: number } — percentage of similar profiles who would choose option A vs B (must sum to 100)
- recommendation: { better: "A" | "B" | "tie", reason: string }
- socialComparison: { demographics: string, choices: [{ option: string, percentage: number }, ...] }

Each SimulationResult must have: option, optionName (the user's choice label from above), bestCase, averageCase, worstCase (each with income5Year, income10Year, probability, description), riskScore (0-100), stressLevel (0-100), careerTrajectory, reasoning (string array). Probabilities for best/average/worst per option should sum to 1.0.

For choiceSplit: estimate what percentage of people with the same profile (major, age, risk tolerance) would choose the user's Option A vs Option B; two numbers that sum to 100.

Also generate a socialComparison object with:
- demographics: string describing the user profile (e.g., 'CS majors aged 20-25 with high risk tolerance')
- choices: array of 3 choices with option name and percentage (must sum to 100)

Base percentages on realistic industry trends and career statistics. The response must include the socialComparison field in the returned JSON.

IMPORTANT: Your response MUST include these two fields at the root level:
- percentageOptionA: A number between 0-100 representing how many people in similar situations choose Option A
- percentageOptionB: A number between 0-100 representing how many people choose Option B
These two numbers MUST sum to exactly 100.

Example response structure:
{
  optionA: {...},
  optionB: {...},
  recommendation: {...},
  percentageOptionA: 65,
  percentageOptionB: 35
}`;

    const result = await model.generateContent(userPrompt);
    const rawText = result.response.text();
    console.log("[runSimulation] Raw AI response:", rawText);

    const jsonText = stripJsonMarkdown(rawText);
    const parsed = JSON.parse(jsonText) as ComparisonOutput;

    const pctA = typeof parsed.percentageOptionA === "number" && !Number.isNaN(parsed.percentageOptionA)
      ? Math.min(100, Math.max(0, parsed.percentageOptionA))
      : 50;
    const pctB = typeof parsed.percentageOptionB === "number" && !Number.isNaN(parsed.percentageOptionB)
      ? Math.min(100, Math.max(0, parsed.percentageOptionB))
      : 50;
    const sum = pctA + pctB;
    parsed.percentageOptionA = sum > 0 ? Math.round((pctA / sum) * 100) : 50;
    parsed.percentageOptionB = sum > 0 ? Math.round((pctB / sum) * 100) : 50;
    if (parsed.percentageOptionA + parsed.percentageOptionB !== 100) {
      parsed.percentageOptionB = 100 - parsed.percentageOptionA;
    }

    return parsed;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Simulation response was not valid JSON: ${err.message}`);
    }
    if (err instanceof Error) {
      throw new Error(`Simulation failed: ${err.message}`);
    }
    throw new Error("Simulation failed with an unknown error");
  }
}
