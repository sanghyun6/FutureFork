"use client";

import { useEffect, useState } from "react";
import type { Scenario } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SCENARIO_CONFIG = {
  Best: {
    leftGradient: "from-emerald-500 to-teal-500",
    icon: TrendingUp,
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-400/40",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  Average: {
    leftGradient: "from-orange-400 to-pink-400",
    icon: Target,
    badge: "bg-orange-400/10 text-orange-700 border-orange-400/40",
    bar: "bg-gradient-to-r from-orange-400 to-pink-400",
  },
  Worst: {
    leftGradient: "from-rose-600 to-red-700",
    icon: AlertCircle,
    badge: "bg-rose-600/10 text-rose-700 border-rose-500/40",
    bar: "bg-gradient-to-r from-rose-600 to-red-700",
  },
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
  const config = SCENARIO_CONFIG[label];
  const Icon = config.icon;
  const progressPct = Math.min(100, Math.max(0, scenario.probability * 100));
  const income5 = useCountUp(scenario.income5Year, true);
  const income10 = useCountUp(scenario.income10Year, true);

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-warm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-warm-hover"
      )}
    >
      {/* 4px gradient left border */}
      <div
        className={cn("w-1 shrink-0 bg-gradient-to-b", config.leftGradient)}
        aria-hidden
      />
      <Card className="flex-1 border-0 border-l-0 shadow-none bg-transparent rounded-none">
        <CardHeader className="pb-2 pt-4 pr-4 pb-2 pl-4 sm:pl-5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
            <Badge
              variant="outline"
              className={cn("w-fit text-xs font-medium", config.badge)}
            >
              {label} case
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-900">
            <span>
              <span className="text-slate-600">5 yr:</span> {formatCurrency(income5)}
            </span>
            <span>
              <span className="text-slate-600">10 yr:</span> {formatCurrency(income10)}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Probability</span>
              <span className="font-medium text-slate-900">
                {progressPct >= 99.95 ? "100" : progressPct.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                className={cn("h-full transition-all duration-500 rounded-full", config.bar)}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {scenario.description ? (
            <p className="text-sm text-slate-700 leading-relaxed">
              {scenario.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
