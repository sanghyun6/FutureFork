import type { ComparisonOutput, SimulationResult } from "@/lib/types";
import { ScenarioCard, type ScenarioLabel } from "@/components/ScenarioCard";
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
            className="text-white/20"
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
            className="text-white transition-[stroke-dashoffset]"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white"
          aria-label={`${label}: ${Math.round(pct)}%`}
        >
          {Math.round(pct)}
        </span>
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

function OptionColumn({ result, optionLabel }: { result: SimulationResult; optionLabel: "A" | "B" }) {
  const scenarios: { scenario: typeof result.bestCase; label: ScenarioLabel }[] = [
    { scenario: result.bestCase, label: "Best" },
    { scenario: result.averageCase, label: "Average" },
    { scenario: result.worstCase, label: "Worst" },
  ];
  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
        Option {optionLabel}: {result.option || `Option ${optionLabel}`}
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {scenarios.map(({ scenario, label }) => (
          <ScenarioCard key={label} scenario={scenario} label={label} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 sm:gap-6">
        <CircularGauge value={result.riskScore} label="Risk" />
        <CircularGauge value={result.stressLevel} label="Stress" />
      </div>
      {result.careerTrajectory ? (
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-white">Career trajectory</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            {result.careerTrajectory}
          </p>
        </div>
      ) : null}
      {result.reasoning.length > 0 ? (
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-white">Reasoning</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
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
    <div className="space-y-6 sm:space-y-8 text-white">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
        <div
          className={cn(
            "glass-card rounded-xl p-3 transition-all duration-200 sm:p-4",
            "hover:shadow-glow hover:border-white/30",
            betterA && "border-green-500/40 bg-green-500/10"
          )}
        >
          <OptionColumn result={optionA} optionLabel="A" />
        </div>
        <div
          className={cn(
            "glass-card rounded-xl p-3 transition-all duration-200 sm:p-4",
            "hover:shadow-glow hover:border-white/30",
            betterB && "border-green-500/40 bg-green-500/10"
          )}
        >
          <OptionColumn result={optionB} optionLabel="B" />
        </div>
      </div>

      <Separator className="bg-white/20" />

      <Card className="glass-card transition-all duration-200 hover:shadow-glow hover:border-white/30">
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="text-base text-white">Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {isTie ? (
              <Badge variant="secondary" className="text-sm text-white/90 bg-white/20 border-white/30">
                Tie
              </Badge>
            ) : (
              <Badge
                className={cn(
                  "text-sm border-green-400/50 bg-green-500/20 text-green-300"
                )}
              >
                Option {recommendation.better} is better
              </Badge>
            )}
          </div>
          {recommendation.reason ? (
            <p className="text-sm text-white/80 leading-relaxed">
              {recommendation.reason}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
