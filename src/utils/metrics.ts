/**
 * Metric Calculator for Amazon ML Challenge 2026: Business Entity Resolution
 * 
 * Metric: Macro F0.5 (Precision-Weighted)
 * Formula: F0.5 = (1.25 * Precision * Recall) / (0.25 * Precision + Recall)
 * 
 * Singletons:
 * - If Ground Truth is empty (singleton) and predicted is empty: F0.5 = 1.0
 * - If Ground Truth is empty (singleton) and predicted is NOT empty: F0.5 = 0.0 (False merge penalty!)
 * 
 * Non-singletons:
 * - Precision = |TP| / |Predicted|
 * - Recall = |TP| / |GroundTruth|
 * - If Precision == 0 or Recall == 0: F0.5 = 0.0
 * - Else: F0.5 = (1.25 * P * R) / (0.25 * P + R)
 * 
 * Macro F0.5 is the arithmetic mean across ALL Source 1 entities.
 */

import { GroundTruthRecord, EntityPrediction, MacroMetrics, EntityMetricDetail, BusinessRecord } from '../types/entity-resolution';

export function calculateEntityF05(
  predictedMatches: string[],
  groundTruthMatches: string[]
): {
  precision: number;
  recall: number;
  f05: number;
  truePositives: string[];
  falsePositives: string[];
  falseNegatives: string[];
  status: 'perfect' | 'false_merge' | 'miss' | 'empty_match_fail';
} {
  const predSet = new Set(predictedMatches);
  const gtSet = new Set(groundTruthMatches);

  const truePositives: string[] = [];
  const falsePositives: string[] = [];
  const falseNegatives: string[] = [];

  for (const id of predictedMatches) {
    if (gtSet.has(id)) {
      truePositives.push(id);
    } else {
      falsePositives.push(id);
    }
  }

  for (const id of groundTruthMatches) {
    if (!predSet.has(id)) {
      falseNegatives.push(id);
    }
  }

  const isGroundTruthSingleton = groundTruthMatches.length === 0;
  const isPredictedEmpty = predictedMatches.length === 0;

  // Case 1: Ground Truth is a Singleton (no true match in S2 or S3)
  if (isGroundTruthSingleton) {
    if (isPredictedEmpty) {
      return {
        precision: 1.0,
        recall: 1.0,
        f05: 1.0,
        truePositives: [],
        falsePositives: [],
        falseNegatives: [],
        status: 'perfect',
      };
    } else {
      // False merge on singleton! Yields 0.0 score!
      return {
        precision: 0.0,
        recall: 1.0, // or 0.0 by definition
        f05: 0.0,
        truePositives: [],
        falsePositives,
        falseNegatives: [],
        status: 'empty_match_fail',
      };
    }
  }

  // Case 2: Ground Truth has matches, but predicted is empty (all missed)
  if (isPredictedEmpty) {
    return {
      precision: 0.0,
      recall: 0.0,
      f05: 0.0,
      truePositives: [],
      falsePositives: [],
      falseNegatives,
      status: 'miss',
    };
  }

  // Case 3: Ground Truth has matches and predicted has matches
  const precision = truePositives.length / predictedMatches.length;
  const recall = truePositives.length / groundTruthMatches.length;

  if (precision === 0 || recall === 0) {
    return {
      precision,
      recall,
      f05: 0.0,
      truePositives,
      falsePositives,
      falseNegatives,
      status: falsePositives.length > 0 ? 'false_merge' : 'miss',
    };
  }

  // Standard F_beta with beta = 0.5:
  // (1 + beta^2) * (P * R) / (beta^2 * P + R)
  // (1 + 0.25) * (P * R) / (0.25 * P + R) = 1.25 * P * R / (0.25 * P + R)
  const numerator = 1.25 * precision * recall;
  const denominator = 0.25 * precision + recall;
  const f05 = denominator > 0 ? numerator / denominator : 0.0;

  let status: 'perfect' | 'false_merge' | 'miss' | 'empty_match_fail' = 'perfect';
  if (falsePositives.length > 0) status = 'false_merge';
  else if (falseNegatives.length > 0) status = 'miss';

  return {
    precision,
    recall,
    f05,
    truePositives,
    falsePositives,
    falseNegatives,
    status,
  };
}

export function evaluatePredictions(
  predictions: Map<string, string[]>,
  groundTruth: GroundTruthRecord[],
  source1Records: BusinessRecord[]
): MacroMetrics {
  const s1Map = new Map(source1Records.map((r) => [r.id, r]));

  let sumF05 = 0;
  let sumPrecision = 0;
  let sumRecall = 0;
  let singletonCount = 0;
  let correctSingletons = 0;
  let totalTruePositives = 0;
  let totalFalsePositives = 0;
  let totalFalseNegatives = 0;

  const entityDetails: EntityMetricDetail[] = [];

  for (const gt of groundTruth) {
    const s1Id = gt.source1Id;
    const s1Rec = s1Map.get(s1Id);
    const predictedMatches = predictions.get(s1Id) || [];

    const isSingleton = gt.matchingIds.length === 0;
    if (isSingleton) singletonCount++;

    const res = calculateEntityF05(predictedMatches, gt.matchingIds);

    if (isSingleton && predictedMatches.length === 0) {
      correctSingletons++;
    }

    sumF05 += res.f05;
    sumPrecision += res.precision;
    sumRecall += res.recall;

    totalTruePositives += res.truePositives.length;
    totalFalsePositives += res.falsePositives.length;
    totalFalseNegatives += res.falseNegatives.length;

    entityDetails.push({
      source1Id: s1Id,
      source1Name: s1Rec ? s1Rec.name : s1Id,
      source1Address: s1Rec ? s1Rec.address : '',
      isGroundTruthSingleton: isSingleton,
      isPredictedSingleton: predictedMatches.length === 0,
      groundTruthMatches: gt.matchingIds,
      predictedMatches,
      truePositives: res.truePositives,
      falsePositives: res.falsePositives,
      falseNegatives: res.falseNegatives,
      precision: res.precision,
      recall: res.recall,
      f05: res.f05,
      status: res.status,
    });
  }

  const total = groundTruth.length || 1;

  return {
    macroF05: sumF05 / total,
    macroPrecision: sumPrecision / total,
    macroRecall: sumRecall / total,
    totalEntities: groundTruth.length,
    singletonCount,
    correctSingletons,
    totalTruePositives,
    totalFalsePositives,
    totalFalseNegatives,
    entityDetails,
  };
}
