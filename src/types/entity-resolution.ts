export interface BusinessRecord {
  id: string; // e.g. S1-732914, S2-118820, S3-905477
  source: 'S1' | 'S2' | 'S3';
  name: string;
  address: string;
  normalizedName?: string;
  normalizedAddress?: string;
  city?: string;
  state?: string;
}

export interface CandidatePair {
  source1Id: string;
  candidateId: string; // S2 or S3
  candidateSource: 'S1' | 'S2' | 'S3';
  blockingKey: string;
  isLookAlike?: boolean;
}

export interface ScoredPair {
  source1Id: string;
  candidateId: string;
  candidateSource: 'S1' | 'S2' | 'S3';
  nameScore: number;
  addressScore: number;
  overallScore: number;
  predictedMatch: boolean;
  groundTruthMatch?: boolean;
  notes?: string;
}

export interface EntityPrediction {
  source1Id: string;
  matchedIds: string[]; // Comma separated IDs of S2/S3
  rawPredictionString: string;
  isSingletonPredicted: boolean;
}

export interface GroundTruthRecord {
  source1Id: string;
  matchingIds: string[]; // IDs from S2 and S3, empty array = singleton
}

export interface EntityMetricDetail {
  source1Id: string;
  source1Name: string;
  source1Address: string;
  isGroundTruthSingleton: boolean;
  isPredictedSingleton: boolean;
  groundTruthMatches: string[];
  predictedMatches: string[];
  truePositives: string[];
  falsePositives: string[]; // False merges (penalized heavily!)
  falseNegatives: string[]; // Misses
  precision: number;
  recall: number;
  f05: number;
  status: 'perfect' | 'false_merge' | 'miss' | 'empty_match_fail';
}

export interface MacroMetrics {
  macroF05: number;
  macroPrecision: number;
  macroRecall: number;
  totalEntities: number;
  singletonCount: number;
  correctSingletons: number;
  totalTruePositives: number;
  totalFalsePositives: number; // Costly false merges
  totalFalseNegatives: number;
  entityDetails: EntityMetricDetail[];
}

export interface BlockingSettings {
  strategy: 'name_token_city' | 'multi_index' | 'soundex_city' | 'character_ngram';
  tokenMinLength: number;
  allowLookAlikes: boolean;
  includeCityStateKey: boolean;
  normalizeStreetSuffixes: boolean;
}

export interface MatchingSettings {
  threshold: number; // 0.0 - 1.0 (e.g. 0.72)
  nameWeight: number; // e.g. 0.55
  addressWeight: number; // e.g. 0.45
  conservativeThresholdForSingletons: boolean;
  preferPrecisionBias: boolean; // "When unsure, do NOT merge!"
  landmarkTolerance: boolean; // e.g. "Nr. City Hall"
}

export interface SubmissionValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  singletonCount: number;
  averageMatchesPerEntity: number;
  invalidIdReferences: string[];
  duplicateEntries: string[];
}
