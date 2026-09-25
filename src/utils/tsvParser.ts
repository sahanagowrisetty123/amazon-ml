import { BusinessRecord, GroundTruthRecord, SubmissionValidationReport } from '../types/entity-resolution';

/**
 * TSV Parser & Submission Validator matching utils/validate_submission.py from challenge
 */

export function parseBusinessRecordsTsv(content: string, source: 'S1' | 'S2' | 'S3'): BusinessRecord[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const records: BusinessRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if header line
    if (i === 0 && (line.toLowerCase().includes('id') && line.toLowerCase().includes('name'))) {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length >= 3) {
      records.push({
        id: parts[0].trim(),
        source,
        name: parts[1].trim(),
        address: parts[2].trim(),
      });
    } else if (parts.length === 2) {
      records.push({
        id: parts[0].trim(),
        source,
        name: parts[1].trim(),
        address: '',
      });
    }
  }

  return records;
}

export function parseGroundTruthTsv(content: string): GroundTruthRecord[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const results: GroundTruthRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.toLowerCase().includes('source1') && line.toLowerCase().includes('match')) {
      continue;
    }
    const parts = line.split('\t');
    const source1Id = parts[0].trim();
    const rawMatches = parts.length > 1 ? parts[1].trim() : '';
    const matchingIds = rawMatches ? rawMatches.split(',').map((id) => id.trim()).filter(Boolean) : [];

    results.push({
      source1Id,
      matchingIds,
    });
  }

  return results;
}

export function validateMatchingResultsTsv(
  content: string,
  expectedSource1Ids?: string[]
): SubmissionValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const seenS1Ids = new Set<string>();
  const duplicateEntries: string[] = [];
  let singletonCount = 0;
  let totalMatches = 0;
  const invalidIdReferences: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check tab separator
    if (!line.includes('\t') && line.trim().length > 0) {
      errors.push(`Line ${lineNum}: Missing tab delimiter (must be tab-separated .tsv)`);
      continue;
    }

    const parts = line.split('\t');
    const s1Id = parts[0].trim();
    const matchString = parts.length > 1 ? parts[1].trim() : '';

    if (!s1Id) {
      errors.push(`Line ${lineNum}: Empty Source 1 ID`);
      continue;
    }

    if (seenS1Ids.has(s1Id)) {
      duplicateEntries.push(s1Id);
      errors.push(`Line ${lineNum}: Duplicate Source 1 ID '${s1Id}' detected. Exactly one row per Source 1 entity is required.`);
    }
    seenS1Ids.add(s1Id);

    if (!matchString) {
      singletonCount++;
    } else {
      const matchIds = matchString.split(',').map((m) => m.trim());
      totalMatches += matchIds.length;

      // Check intra-row duplicates
      const rowSet = new Set<string>();
      for (const mId of matchIds) {
        if (rowSet.has(mId)) {
          warnings.push(`Line ${lineNum} (${s1Id}): Duplicate candidate ID '${mId}' in match list.`);
        }
        rowSet.add(mId);

        // Verify ID prefix format
        if (!mId.startsWith('S2-') && !mId.startsWith('S3-')) {
          invalidIdReferences.push(mId);
          warnings.push(`Line ${lineNum} (${s1Id}): Candidate ID '${mId}' does not have standard 'S2-' or 'S3-' prefix.`);
        }
      }
    }
  }

  // Check coverage against expected test S1 IDs
  if (expectedSource1Ids && expectedSource1Ids.length > 0) {
    const missingIds = expectedSource1Ids.filter((id) => !seenS1Ids.has(id));
    if (missingIds.length > 0) {
      errors.push(`Missing ${missingIds.length} Source 1 entities from expected test set (e.g. ${missingIds.slice(0, 3).join(', ')}). All Source 1 entities must be present.`);
    }
  }

  const rowCount = seenS1Ids.size;
  const averageMatchesPerEntity = rowCount > 0 ? totalMatches / rowCount : 0;

  if (rowCount === 0) {
    errors.push('File contains 0 valid rows.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount,
    singletonCount,
    averageMatchesPerEntity: Number(averageMatchesPerEntity.toFixed(2)),
    invalidIdReferences: Array.from(new Set(invalidIdReferences)),
    duplicateEntries: Array.from(new Set(duplicateEntries)),
  };
}

export function generateTsvString(data: Map<string, string[]> | Record<string, string[]>): string {
  const lines: string[] = [];
  const entries = data instanceof Map ? Array.from(data.entries()) : Object.entries(data);

  for (const [s1Id, matchIds] of entries) {
    const matchStr = (matchIds || []).join(',');
    lines.push(`${s1Id}\t${matchStr}`);
  }

  return lines.join('\n');
}
