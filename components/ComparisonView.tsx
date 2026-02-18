import type { ComparisonOutput, SimulationResult } from "@/lib/types";
import { ScenarioCard, type ScenarioLabel } from "@/components/ScenarioCard";
import { SocialComparisonCard as SocialComparison } from "@/components/SocialComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const GAUGE_SIZE = 88;
const GAUGE_STROKE = 6;
const GAUGE_R = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CX = GAUGE_SIZE / 2;
const GAUGE_CY = GAUGE_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;

const warmCardClass =
  "rounded-2xl border border-white/70 bg-white/80 shadow-warm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-warm-hover";

const MAX_OPTION_NAME_LENGTH = 20;

function truncateOptionName(name: string): string {
  if (!name || name.length <= MAX_OPTION_NAME_LENGTH) return name;
  return name.slice(0, MAX_OPTION_NAME_LENGTH).trim() + "...";
}

function CircularGauge({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative inline-flex" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
        <svg
          width={GAUGE_SIZE}
          height={GAUGE_SIZE}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={GAUGE_CX}
            cy={GAUGE_CY}
            r={GAUGE_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={GAUGE_STROKE}
            className="text-slate-200"
          />
          <circle
            cx={GAUGE_CX}
            cy={GAUGE_CY}
            r={GAUGE_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={GAUGE_STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-orange-400 transition-[stroke-dashoffset]"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-900"
          aria-label={`${label}: ${Math.round(pct)}%`}
        >
          {Math.round(pct)}
        </span>
      </div>
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

function OptionColumn({ result, optionLabel }: { result: SimulationResult; optionLabel: "A" | "B" }) {
  const scenarios: { scenario: typeof result.bestCase; label: ScenarioLabel }[] = [
    { scenario: result.bestCase, label: "Best" },
    { scenario: result.averageCase, label: "Average" },
    { scenario: result.worstCase, label: "Worst" },
  ];
  const displayName = truncateOptionName(result.optionName || result.option || `Option ${optionLabel}`);
  return (
    <div className="space-y-4 sm:space-y-5">
      <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
        Option {optionLabel}: {displayName}
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {scenarios.map(({ scenario, label }) => (
          <ScenarioCard key={label} scenario={scenario} label={label} />
        ))}
      </div>
      <div className="flex flex-wrap gap-6 sm:gap-8">
        <CircularGauge value={result.riskScore} label="Risk" />
        <CircularGauge value={result.stressLevel} label="Stress" />
      </div>
      {result.careerTrajectory ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Career trajectory</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {result.careerTrajectory}
          </p>
        </div>
      ) : null}
      {result.reasoning.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Reasoning</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {result.reasoning.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export interface ComparisonViewProps {
  data: ComparisonOutput;
}

export function ComparisonView({ data }: ComparisonViewProps) {
  const { optionA, optionB, recommendation } = data;
  const isTie = recommendation.better === "tie";
  const betterA = recommendation.better === "A";
  const betterB = recommendation.better === "B";

  return (
    <div className="text-slate-900">
      <div className="space-y-4">
        {/* Bento-style two columns */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2">
          <div
            className={cn(
              warmCardClass,
              "p-5 sm:p-6",
              betterA && "ring-2 ring-emerald-400/50"
            )}
          >
            <OptionColumn result={optionA} optionLabel="A" />
          </div>
          <div
            className={cn(
              warmCardClass,
              "p-5 sm:p-6",
              betterB && "ring-2 ring-emerald-400/50"
            )}
          >
            <OptionColumn result={optionB} optionLabel="B" />
          </div>
        </div>

        <Separator className="bg-white/70" />
        {/* A vs B choice split */}
        {data.choiceSplit != null ? (
          <Card className={cn(warmCardClass, "overflow-hidden")}>
            <CardHeader className="pb-3 p-6 sm:p-8">
              <CardTitle className="text-lg font-bold text-slate-900">
                How would similar profiles choose?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Option A</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {Math.round(Math.min(100, Math.max(0, data.choiceSplit.optionA)))}
                    </span>
                    <span className="text-slate-600">%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, data.choiceSplit.optionA))}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Option B</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {Math.round(Math.min(100, Math.max(0, data.choiceSplit.optionB)))}
                    </span>
                    <span className="text-slate-600">%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, data.choiceSplit.optionB))}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Among profiles like yours, what share would pick each option.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* In similar situations */}
        <Card className={cn(warmCardClass, "overflow-hidden")}>
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm text-slate-700">
              In similar situations:{" "}
              <span className={data.percentageOptionA >= data.percentageOptionB ? "font-semibold text-orange-600" : "text-slate-500"}>
                {Math.round(Math.min(100, Math.max(0, data.percentageOptionA)))}% chose {truncateOptionName(data.optionA.optionName || data.optionA.option || "Option A")}
              </span>
              {", "}
              <span className={data.percentageOptionB >= data.percentageOptionA ? "font-semibold text-orange-600" : "text-slate-500"}>
                {Math.round(Math.min(100, Math.max(0, data.percentageOptionB)))}% chose {truncateOptionName(data.optionB.optionName || data.optionB.option || "Option B")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className={cn(warmCardClass, "overflow-hidden")}>
          <CardHeader className="pb-2 p-6 sm:p-8">
            <CardTitle className="text-lg font-bold text-slate-900">Recommendation</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4 pt-0 px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-wrap items-center gap-2">
            {isTie ? (
              <Badge
                variant="secondary"
                className="text-sm font-medium text-slate-700 bg-amber-100/80 border-amber-200"
              >
                Tie
              </Badge>
            ) : (
              <Badge className="text-sm font-medium bg-emerald-500/15 text-emerald-800 border border-emerald-400/40">
                {recommendation.better === "A"
                  ? truncateOptionName(data.optionA.optionName || data.optionA.option || "Option A")
                  : truncateOptionName(data.optionB.optionName || data.optionB.option || "Option B")} is better
              </Badge>
            )}
          </div>
          {recommendation.reason ? (
            <p className="text-sm text-slate-700 leading-relaxed">
              {recommendation.reason}
            </p>
          ) : null}
        </CardContent>
      </Card>
      </div>

      {data.socialComparison && (
        <div className="mt-8 sm:mt-10">
          <SocialComparison data={data.socialComparison} />
        </div>
      )}
    </div>
  );
}
