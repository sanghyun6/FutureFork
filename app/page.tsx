"use client";

import { useRef, useState } from "react";
import type { ComparisonOutput, DecisionInput } from "@/lib/types";
import { DecisionForm } from "@/components/DecisionForm";
import { ComparisonView } from "@/components/ComparisonView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const warmCardClass =
  "rounded-2xl border border-white/70 bg-white/80 shadow-warm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-warm-hover";

export default function Home() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<DecisionInput | null>(null);
  const [result, setResult] = useState<ComparisonOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleResult = (output: ComparisonOutput, input: DecisionInput) => {
    setFormData(input);
    setResult(output);
  };

  const handleStartOver = () => {
    setResult(null);
    setFormData(null);
    setFormKey((k) => k + 1);
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
      <div
        className={cn(
          "mx-auto px-5 py-12 sm:px-8 sm:py-16 lg:px-10",
          result ? "max-w-5xl" : "max-w-2xl"
        )}
      >
        {/* Hero */}
        <header className="mb-12 text-center sm:mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            FutureFork
          </h1>
          <p className="mt-4 text-lg text-slate-700 sm:text-xl max-w-xl mx-auto leading-relaxed">
            AI-Powered Career Decision Simulator
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Compare paths. See scenarios. Choose with clarity.
          </p>
        </header>

        {/* Form card */}
        <div ref={formSectionRef}>
          <Card
            className={cn(
              warmCardClass,
              "mb-12",
              loading && "pointer-events-none opacity-70"
            )}
          >
            <CardContent className="p-8 sm:p-10 lg:p-12">
              <DecisionForm
                key={formKey}
                onResult={handleResult}
                onLoadingChange={setLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results - Bento grid feel */}
        {result && (
          <div className={cn(warmCardClass, "p-6 sm:p-8 lg:p-10")}>
            <ComparisonView data={result} />
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleStartOver}
                className="rounded-xl border-orange-200 bg-white/60 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:shadow-warm transition-all duration-300"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
