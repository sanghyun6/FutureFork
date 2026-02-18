"use client";

import { useRef, useState } from "react";
import type { ComparisonOutput, DecisionInput } from "@/lib/types";
import { DecisionForm } from "@/components/DecisionForm";
import { ComparisonView } from "@/components/ComparisonView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/40 to-slate-900 text-white">
      <div
        className={cn(
          "mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8",
          result ? "max-w-5xl" : "max-w-2xl"
        )}
      >
        {/* Hero */}
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            FutureFork
          </h1>
          <p className="mt-1.5 text-sm text-white/80 sm:mt-2 sm:text-base">
            AI-Powered Career Decision Simulator
          </p>
        </header>

        {/* Form card */}
        <div ref={formSectionRef}>
          <Card
            className={cn(
              "glass-card mb-8 sm:mb-10",
              "hover:shadow-glow hover:border-white/30",
              loading && "pointer-events-none opacity-70"
            )}
          >
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <DecisionForm
                key={formKey}
                onResult={handleResult}
                onLoadingChange={setLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <div className="glass-card rounded-xl p-4 sm:p-6">
            <ComparisonView data={result} />
            <div className="mt-6 flex justify-center sm:mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleStartOver}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-glow"
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
