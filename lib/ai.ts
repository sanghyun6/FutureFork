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
- optionA: SimulationResult for option A (use option: "A")
- optionB: SimulationResult for option B (use option: "B")
- recommendation: { better: "A" | "B" | "tie", reason: string }
- socialComparison: { demographics: string, choices: [{ option: string, percentage: number }, ...] }

Each SimulationResult must have: option, bestCase, averageCase, worstCase (each with income5Year, income10Year, probability, description), riskScore (0-100), stressLevel (0-100), careerTrajectory, reasoning (string array). Probabilities for best/average/worst per option should sum to 1.0.

For socialComparison: generate realistic statistics for what people with similar profiles tend to choose. Base it on the user's major, age range (e.g. "aged 20-25"), and risk tolerance level (low/medium/high). demographics should be a short phrase like "CS majors aged 20-25 with high risk tolerance". choices should be 3-5 career path options (e.g. "Big Tech", "Startups", "Grad School") with percentages that sum to 100. Use current industry trends; options can include or relate to the user's Option A/B but should be general category names.`;

    const result = await model.generateContent(userPrompt);
    const rawText = result.response.text();
    const jsonText = stripJsonMarkdown(rawText);
    const parsed = JSON.parse(jsonText) as ComparisonOutput;

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
