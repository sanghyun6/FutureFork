"use client";

import type { SocialComparison } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_GRADIENTS = [
  "[&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-400",
  "[&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-pink-400",
  "[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-yellow-400",
] as const;

export interface SocialComparisonProps {
  data: SocialComparison;
}

export function SocialComparisonCard({ data }: SocialComparisonProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 shadow-warm backdrop-blur-md p-6 space-y-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-warm-hover">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Users className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
        What do similar profiles choose?
      </h3>
      <p className="text-sm text-slate-600">
        {data.demographics}
      </p>
      <div className="space-y-3">
        {data.choices.map((choice, i) => {
          const pct = Math.min(100, Math.max(0, choice.percentage));
          const gradientClass = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-900 shrink-0">
                  {choice.option}
                </span>
                <span className="text-sm text-slate-600 tabular-nums">
                  {Math.round(pct)}%
                </span>
              </div>
              <Progress
                value={pct}
                className={cn("h-2 bg-slate-200/80", gradientClass)}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 pt-1">
        Based on industry trends and statistical analysis
      </p>
    </div>
  );
}
