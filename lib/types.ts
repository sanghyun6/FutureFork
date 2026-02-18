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

/** One choice in the social comparison (option name + percentage) */
export interface SocialComparisonChoice {
  option: string;
  percentage: number;
}

/** Social comparison: what similar profiles tend to choose */
export interface SocialComparison {
  demographics: string;
  choices: SocialComparisonChoice[];
}

/** Full comparison response from the simulate API */
export interface ComparisonOutput {
  optionA: SimulationResult;
  optionB: SimulationResult;
  recommendation: Recommendation;
  socialComparison?: SocialComparison;
}
