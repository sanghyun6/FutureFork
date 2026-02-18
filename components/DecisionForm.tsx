"use client";

import { useState } from "react";
import type { ComparisonOutput, DecisionInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const RISK_EMOJIS = ["😰", "😟", "😐", "🙂", "😊", "🤝", "💪", "🔥", "⭐", "🚀"];

const GOAL_OPTIONS: { value: "money" | "stability" | "freedom" | "impact"; label: string }[] = [
  { value: "money", label: "💰 Money" },
  { value: "stability", label: "🛡️ Stability" },
  { value: "freedom", label: "🌴 Freedom" },
  { value: "impact", label: "🌍 Impact" },
];

export interface DecisionFormProps {
  onResult: (result: ComparisonOutput, input: DecisionInput) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function DecisionForm({ onResult, onLoadingChange }: DecisionFormProps) {
  const [age, setAge] = useState(22);
  const [major, setMajor] = useState("");
  const [school, setSchool] = useState("");
  const [includeGpa, setIncludeGpa] = useState(false);
  const [gpa, setGpa] = useState(2.5);
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [goals, setGoals] = useState<Array<"money" | "stability" | "freedom" | "impact">>([]);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (goal: "money" | "stability" | "freedom" | "impact") => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!major.trim()) {
      setError("Major is required.");
      return;
    }
    if (goals.length === 0) {
      setError("Select at least one goal.");
      return;
    }
    if (!optionA.trim()) {
      setError("Option A is required.");
      return;
    }
    if (!optionB.trim()) {
      setError("Option B is required.");
      return;
    }

    const input: DecisionInput = {
      profile: {
        age,
        major: major.trim(),
        school: school.trim() || undefined,
        gpa: includeGpa ? gpa : undefined,
        riskTolerance,
        goals,
      },
      optionA: optionA.trim(),
      optionB: optionB.trim(),
    };

    setLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Simulation failed");
      }
      onResult(data as ComparisonOutput, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Age */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label htmlFor="age" className="font-bold text-slate-900">
            Age
          </label>
          <span className="text-slate-600">{age}</span>
        </div>
        <Slider
          id="age"
          min={18}
          max={60}
          step={1}
          value={[age]}
          onValueChange={([v]) => setAge(v ?? 18)}
        />
      </div>

      {/* Major */}
      <div className="space-y-2">
        <label htmlFor="major" className="text-sm font-bold text-slate-900">
          Major
        </label>
        <Input
          id="major"
          placeholder="e.g. Computer Science"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        />
      </div>

      {/* School (optional) */}
      <div className="space-y-2">
        <label htmlFor="school" className="text-sm font-bold text-slate-900">
          School <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <Input
          id="school"
          placeholder="e.g. MIT"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
        />
      </div>

      {/* GPA (optional) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-gpa"
            checked={includeGpa}
            onCheckedChange={(c) => setIncludeGpa(c === true)}
          />
          <label htmlFor="include-gpa" className="text-sm font-bold text-slate-900 cursor-pointer">
            Include GPA <span className="font-normal text-slate-500">(optional)</span>
          </label>
        </div>
        {includeGpa && (
          <div className="space-y-2 pl-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">GPA</span>
              <span className="font-medium">{gpa.toFixed(1)}</span>
            </div>
            <Slider
              min={0}
              max={4}
              step={0.1}
              value={[gpa]}
              onValueChange={([v]) => setGpa(v ?? 0)}
            />
          </div>
        )}
      </div>

      {/* Risk tolerance */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <label htmlFor="risk" className="font-bold text-slate-900">
            Risk tolerance
          </label>
          <span className="text-lg" aria-hidden>
            {RISK_EMOJIS[riskTolerance - 1]}
          </span>
        </div>
        <Slider
          id="risk"
          min={1}
          max={10}
          step={1}
          value={[riskTolerance]}
          onValueChange={([v]) => setRiskTolerance(v ?? 1)}
        />
        <p className="text-xs text-slate-600">
          Low (😰) to high (🚀)
        </p>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <span className="text-sm font-bold text-slate-900">Goals</span>
        <div className="flex flex-wrap gap-4">
          {GOAL_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-900"
            >
              <Checkbox
                checked={goals.includes(value)}
                onCheckedChange={() => toggleGoal(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Option A & B */}
      <div className="space-y-2">
        <label htmlFor="option-a" className="text-sm font-bold text-slate-900">
          Option A
        </label>
        <Input
          id="option-a"
          placeholder="e.g. SWE at Big Tech"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="option-b" className="text-sm font-bold text-slate-900">
          Option B
        </label>
        <Input
          id="option-b"
          placeholder="e.g. Startup in SF"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-warm hover:from-orange-600 hover:to-amber-600 hover:shadow-warm-hover transition-all duration-300"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Simulating…
          </>
        ) : (
          "Simulate"
        )}
      </Button>
    </form>
  );
}
