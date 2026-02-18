/** User profile for career simulation input */
export interface UserProfile {
  age: number;
  major: string;
  school?: string;
  gpa?: number;
  riskTolerance: number; // 1-10
  goals: Array<"money" | "stability" | "freedom" | "impact">;
}

/** Input payload for the simulate API */
export interface DecisionInput {
  profile: UserProfile;
  optionA: string;
  optionB: string;
}

/** Single scenario (best / average / worst case) */
export interface Scenario {
  income5Year: number;
  income10Year: number;
  probability: number;
  description: string;
}

/** Full simulation result for one career option */
export interface SimulationResult {
  option: string;
  optionName: string;
  bestCase: Scenario;
  averageCase: Scenario;
  worstCase: Scenario;
  riskScore: number; // 0-100
  stressLevel: number; // 0-100
  careerTrajectory: string;
  reasoning: string[];
}

/** Recommendation between the two options */
export interface Recommendation {
  better: "A" | "B" | "tie";
  reason: string;
}

/** Social comparison: what similar profiles tend to choose */
export interface SocialComparison {
  demographics: string;
  choices: Array<{
    option: string;
    percentage: number;
  }>;
}

/** Percent of similar profiles who would choose A vs B (sums to 100) */
export interface ChoiceSplit {
  optionA: number;
  optionB: number;
}

/** Full comparison response from the simulate API */
export interface ComparisonOutput {
  optionA: SimulationResult;
  optionB: SimulationResult;
  percentageOptionA: number;
  percentageOptionB: number;
  choiceSplit?: ChoiceSplit;
  recommendation: {
    better: "A" | "B" | "tie";
    reason: string;
  };
  socialComparison: SocialComparison;
}
