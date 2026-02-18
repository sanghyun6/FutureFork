"use client";

import { useEffect, useState } from "react";
import type { Scenario } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LABEL_STYLES = {
  Best: {
    border: "border-l-green-500/80",
    badge: "border-green-400/50 bg-green-500/20 text-green-300",
  },
  Average: {
    border: "border-l-yellow-500/80",
    badge: "border-yellow-400/50 bg-yellow-500/20 text-yellow-300",
  },
  Worst: {
    border: "border-l-red-500/80",
    badge: "border-red-400/50 bg-red-500/20 text-red-300",
  },
} as const;

const PROGRESS_COLORS = {
  Best: "bg-green-500",
  Average: "bg-yellow-500",
  Worst: "bg-red-500",
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const DURATION_MS = 600;

function useCountUp(target: number, enabled: boolean): number {
  const [display, setDisplay] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    setDisplay(0);
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplay(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, enabled]);
  return display;
}

export type ScenarioLabel = "Best" | "Average" | "Worst";

export interface ScenarioCardProps {
  scenario: Scenario;
  label: ScenarioLabel;
}

export function ScenarioCard({ scenario, label }: ScenarioCardProps) {
  const styles = LABEL_STYLES[label];
  const progressPct = Math.min(100, Math.max(0, scenario.probability * 100));
  const income5 = useCountUp(scenario.income5Year, true);
  const income10 = useCountUp(scenario.income10Year, true);

  return (
    <Card
      className={cn(
        "glass-card border-l-4 transition-all duration-200",
        "hover:shadow-glow hover:border-white/30",
        styles.border
      )}
    >
      <CardHeader className="pb-2 p-4 sm:p-6">
        <Badge variant="outline" className={cn("w-fit", styles.badge)}>
          {label} case
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white">
          <span>
            <span className="text-white/70">5 yr:</span>{" "}
            {formatCurrency(income5)}
          </span>
          <span>
            <span className="text-white/70">10 yr:</span>{" "}
            {formatCurrency(income10)}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/70">
            <span>Probability</span>
            <span className="text-white">{progressPct >= 99.95 ? "100" : progressPct.toFixed(1)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={cn("h-full transition-all duration-500", PROGRESS_COLORS[label])}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {scenario.description ? (
          <p className="text-sm text-white/80 leading-relaxed">
            {scenario.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
