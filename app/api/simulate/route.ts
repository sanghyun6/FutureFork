import { NextRequest, NextResponse } from "next/server";
import type { DecisionInput, ComparisonOutput } from "@/lib/types";
import { runSimulation } from "@/lib/ai";
import { sanitizeSimulation } from "@/lib/sanitize";

const GOALS = ["money", "stability", "freedom", "impact"] as const;

function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function validateDecisionInput(body: unknown): { ok: true; data: DecisionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;

  const optionA = obj.optionA;
  const optionB = obj.optionB;
  if (typeof optionA !== "string" || !optionA.trim()) {
    return { ok: false, error: "optionA is required and must be a non-empty string" };
  }
  if (typeof optionB !== "string" || !optionB.trim()) {
    return { ok: false, error: "optionB is required and must be a non-empty string" };
  }

  const profile = obj.profile;
  if (!profile || typeof profile !== "object") {
    return { ok: false, error: "profile is required and must be an object" };
  }
  const p = profile as Record<string, unknown>;
  if (typeof p.age !== "number" || p.age < 0 || p.age > 120) {
    return { ok: false, error: "profile.age must be a number between 0 and 120" };
  }
  if (typeof p.major !== "string" || !p.major.trim()) {
    return { ok: false, error: "profile.major is required and must be a non-empty string" };
  }
  const riskTolerance = Number(p.riskTolerance);
  if (Number.isNaN(riskTolerance) || riskTolerance < 1 || riskTolerance > 10) {
    return { ok: false, error: "profile.riskTolerance must be a number between 1 and 10" };
  }
  if (!Array.isArray(p.goals)) {
    return { ok: false, error: "profile.goals must be an array" };
  }
  const goals = p.goals.filter((g): g is (typeof GOALS)[number] =>
    typeof g === "string" && GOALS.includes(g as (typeof GOALS)[number])
  );
  if (goals.length === 0) {
    return { ok: false, error: "profile.goals must contain at least one of: money, stability, freedom, impact" };
  }

  const school = p.school !== undefined ? (typeof p.school === "string" ? p.school : undefined) : undefined;
  const gpa = p.gpa !== undefined ? (typeof p.gpa === "number" && !Number.isNaN(p.gpa) ? p.gpa : undefined) : undefined;

  const data: DecisionInput = {
    profile: {
      age: p.age as number,
      major: (p.major as string).trim(),
      school,
      gpa,
      riskTolerance,
      goals,
    },
    optionA: optionA.trim(),
    optionB: optionB.trim(),
  };
  return { ok: true, data };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const body = await request.json();
    const validated = validateDecisionInput(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const output = await runSimulation(validated.data);
    const sanitized: ComparisonOutput = {
      optionA: { ...sanitizeSimulation(output.optionA), optionName: validated.data.optionA },
      optionB: { ...sanitizeSimulation(output.optionB), optionName: validated.data.optionB },
      percentageOptionA: output.percentageOptionA,
      percentageOptionB: output.percentageOptionB,
      recommendation: output.recommendation,
      socialComparison: output.socialComparison,
    };

    return NextResponse.json(sanitized, { headers: corsHeaders(origin) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Simulation failed";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
