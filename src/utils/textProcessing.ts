/**
 * Text processing & similarity algorithms for Business Entity Resolution
 * Pure algorithmic implementation, 100% offline with NO external APIs (compliant with competition rules)
 */

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standardize common business suffixes
 */
export function normalizeBusinessName(name: string): string {
  if (!name) return '';
  let s = cleanText(name);
  const legalSuffixes = [
    'incorporated', 'inc', 'corporation', 'corp', 'limited', 'ltd',
    'limited liability company', 'llc', 'company', 'co', 'pvt ltd', 'plc', 'gmbh'
  ];
  
  for (const suf of legalSuffixes) {
    const regex = new RegExp(`\\b${suf}\\b`, 'g');
    s = s.replace(regex, '');
  }
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Standardize common address abbreviations and landmark markers
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  let s = cleanText(address);
  
  const replacements: Record<string, string> = {
    'street': 'st',
    'avenue': 'ave',
    'road': 'rd',
    'boulevard': 'blvd',
    'parkway': 'pkwy',
    'drive': 'dr',
    'lane': 'ln',
    'court': 'ct',
    'suite': 'ste',
    'apartment': 'apt',
    'north': 'n',
    'south': 's',
    'east': 'e',
    'west': 'w',
    'near': 'nr',
    'opposite': 'opp',
  };

  for (const [full, abbr] of Object.entries(replacements)) {
    const reg = new RegExp(`\\b${full}\\b`, 'g');
    s = s.replace(reg, abbr);
  }

  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Levenshtein distance & similarity
 */
export function levenshteinSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;

  const costs: number[] = [];
  for (let i = 0; i <= shorter.length; i++) {
    costs[i] = i;
  }

  for (let i = 1; i <= longer.length; i++) {
    costs[0] = i;
    let nw = i - 1;
    for (let j = 1; j <= shorter.length; j++) {
      const cj = Math.min(
        1 + Math.min(costs[j], costs[j - 1]),
        longer[i - 1] === shorter[j - 1] ? nw : nw + 1
      );
      nw = costs[j];
      costs[j] = cj;
    }
  }

  const distance = costs[shorter.length];
  return Math.max(0, 1.0 - distance / longer.length);
}

/**
 * Jaro-Winkler string distance
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const m = matches;
  const jaro = (m / len1 + m / len2 + (m - transpositions / 2) / m) / 3;

  // Winkler prefix boost
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  const p = 0.1;
  return jaro + prefix * p * (1 - jaro);
}

/**
 * Token Set / Jaccard similarity
 */
export function tokenJaccardSimilarity(s1: string, s2: string): number {
  const set1 = new Set(cleanText(s1).split(' ').filter(Boolean));
  const set2 = new Set(cleanText(s2).split(' ').filter(Boolean));

  if (set1.size === 0 && set2.size === 0) return 1.0;
  if (set1.size === 0 || set2.size === 0) return 0.0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 1.0 : intersection / union;
}

/**
 * Phonetic Soundex implementation
 */
export function soundex(str: string): string {
  const cleaned = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleaned) return '0000';

  const mapping: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  const firstLetter = cleaned[0];
  let res = firstLetter;
  let prevCode = mapping[firstLetter] || '0';

  for (let i = 1; i < cleaned.length && res.length < 4; i++) {
    const code = mapping[cleaned[i]] || '0';
    if (code !== '0' && code !== prevCode) {
      res += code;
    }
    prevCode = code;
  }

  return (res + '000').slice(0, 4);
}

/**
 * Extract City or Location hints from address
 */
export function extractCityKey(address: string): string {
  const norm = normalizeAddress(address);
  const parts = norm.split(',').map((p) => p.trim());
  if (parts.length > 1) {
    // Usually city is after street
    return parts[parts.length - 1].replace(/\b(ca|ny|tx|nv|fl|il|wa|oh|pa)\b/g, '').trim();
  }
  const tokens = norm.split(' ');
  return tokens.length > 0 ? tokens[tokens.length - 1] : '';
}

/**
 * Generate Blocking Key for a record
 */
export function generateBlockingKeys(name: string, address: string, strategy: string): string[] {
  const cleanN = normalizeBusinessName(name);
  const cleanA = normalizeAddress(address);
  const nameTokens = cleanN.split(' ').filter((t) => t.length > 2);
  const addrTokens = cleanA.split(' ').filter((t) => t.length > 2);
  const firstToken = nameTokens[0] || 'unknown';
  const city = extractCityKey(address) || (addrTokens.length > 0 ? addrTokens[addrTokens.length - 1] : 'any');

  const keys: string[] = [];

  switch (strategy) {
    case 'soundex_city': {
      keys.push(`${soundex(firstToken)}_${city}`);
      break;
    }
    case 'multi_index': {
      // Key 1: First name token
      keys.push(`name_${firstToken}`);
      // Key 2: City / location
      if (city) keys.push(`city_${city}`);
      // Key 3: First numeric token if street number exists (e.g. 500, 8, 22)
      const numMatch = cleanA.match(/\b\d+\b/);
      if (numMatch) keys.push(`num_${numMatch[0]}`);
      break;
    }
    case 'character_ngram': {
      // 3-char prefix of name
      const prefix = cleanN.slice(0, 3).padEnd(3, '_');
      keys.push(`ng_${prefix}_${city.slice(0, 3)}`);
      break;
    }
    case 'name_token_city':
    default: {
      keys.push(`${firstToken}_${city}`);
      break;
    }
  }

  return keys;
}

/**
 * Calculate composite similarity between two business records
 */
export function computeRecordSimilarity(
  r1: { name: string; address: string },
  r2: { name: string; address: string },
  settings: { nameWeight: number; addressWeight: number; landmarkTolerance?: boolean }
): { nameScore: number; addressScore: number; overallScore: number; notes: string } {
  // Name similarities
  const normN1 = normalizeBusinessName(r1.name);
  const normN2 = normalizeBusinessName(r2.name);
  const jwName = jaroWinklerSimilarity(normN1, normN2);
  const jaccName = tokenJaccardSimilarity(normN1, normN2);
  const nameScore = jwName * 0.7 + jaccName * 0.3;

  // Address similarities
  const normA1 = normalizeAddress(r1.address);
  const normA2 = normalizeAddress(r2.address);
  let jwAddr = jaroWinklerSimilarity(normA1, normA2);
  let jaccAddr = tokenJaccardSimilarity(normA1, normA2);

  let notes = '';

  // Landmark tolerance (e.g. "Nr. City Hall, San Jose" vs "500 Market St, San Jose")
  if (settings.landmarkTolerance && (normA1.includes('nr ') || normA2.includes('nr ') || normA1.includes('opp ') || normA2.includes('opp '))) {
    // Check if city matches
    const city1 = extractCityKey(r1.address);
    const city2 = extractCityKey(r2.address);
    if (city1 && city2 && (city1 === city2 || jaroWinklerSimilarity(city1, city2) > 0.8)) {
      // Landmark in same city gets boosted if name is very strong
      if (nameScore > 0.85) {
        jwAddr = Math.max(jwAddr, 0.75);
        jaccAddr = Math.max(jaccAddr, 0.65);
        notes = 'Landmark proximity match in shared city';
      }
    }
  }

  // Number comparison (if both have street numbers and they differ, penalize!)
  const num1 = normA1.match(/\b\d+\b/);
  const num2 = normA2.match(/\b\d+\b/);
  if (num1 && num2 && num1[0] !== num2[0] && !normA1.includes('nr ') && !normA2.includes('nr ')) {
    jaccAddr *= 0.6; // Different street numbers!
    notes = notes ? `${notes}; Different street numbers` : 'Different street numbers';
  }

  const addressScore = jwAddr * 0.5 + jaccAddr * 0.5;
  const overallScore = nameScore * settings.nameWeight + addressScore * settings.addressWeight;

  return {
    nameScore,
    addressScore,
    overallScore,
    notes,
  };
}
