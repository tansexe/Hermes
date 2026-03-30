import publisherList from '../../../project/data/publisher_list.json';
import biasData from '../../../project/data/bias_classified_output.json';

/**
 * Spectrum column definitions — mapped directly from data categories
 */
const SPECTRUM_COLUMNS = [
  { key: 'left', label: 'Left' },
  { key: 'unbiased', label: 'Unbiased' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
];

/**
 * Available category filters — derived from actual data
 */
const CATEGORY_FILTERS = ['all', 'political', 'non_political'];

const CATEGORY_LABELS = {
  all: 'ALL',
  political: 'POLITICS',
  non_political: 'GENERAL',
};

/**
 * Compute how often each source appears across all articles (input + related)
 * and build a reliability score from 0–100.
 */
function computeSourceStats(articles) {
  const sourceAppearances = {};
  const sourceBiasConsistency = {};

  articles.forEach((article) => {
    // Count input article source
    const inputSource = article.input_article?.source_name;
    if (inputSource) {
      sourceAppearances[inputSource] = (sourceAppearances[inputSource] || 0) + 1;
    }

    // Count related report sources
    (article.related_reports || []).forEach((ref) => {
      const refSource = ref.source_name;
      if (refSource) {
        sourceAppearances[refSource] = (sourceAppearances[refSource] || 0) + 1;
      }
      // Track bias consistency for reliability
      if (refSource && ref.bias) {
        if (!sourceBiasConsistency[refSource]) {
          sourceBiasConsistency[refSource] = {};
        }
        sourceBiasConsistency[refSource][ref.bias] =
          (sourceBiasConsistency[refSource][ref.bias] || 0) + 1;
      }
    });
  });

  return { sourceAppearances, sourceBiasConsistency };
}

/**
 * Derive a reliability score (40–98) for a source based on:
 *  - Appearance frequency (more appearances = more reliable baseline)
 *  - Bias consistency (sources that stay consistent score higher)
 *  - Deterministic seeding from source name for consistent results
 */
function getReliabilityScore(sourceName, appearances, biasConsistency) {
  // Base from appearances (log scale, capped)
  const freqScore = Math.min(appearances * 5, 40);

  // Consistency bonus: if a source always reports same bias
  let consistencyBonus = 0;
  if (biasConsistency && Object.keys(biasConsistency).length > 0) {
    const counts = Object.values(biasConsistency);
    const total = counts.reduce((a, b) => a + b, 0);
    const max = Math.max(...counts);
    consistencyBonus = Math.round((max / total) * 30);
  }

  // Deterministic seed from name for the remaining variance
  let seed = 0;
  for (let i = 0; i < sourceName.length; i++) {
    seed += sourceName.charCodeAt(i);
  }
  const seedBonus = (seed % 25) + 5;

  return Math.min(Math.round(freqScore + consistencyBonus + seedBonus), 98);
}

/**
 * Build the full spectrum data structure:
 * { columns: [ { key, label, sources: [ { name, initial, domain, reliability } ] } ] }
 *
 * @param {string} categoryFilter - 'all' | 'political' | 'non_political'
 */
export function getSpectrumData(categoryFilter = 'all') {
  // 1. Get all articles (political + non-political) from biasData
  const allArticles = [
    ...(biasData.political_articles_data || []),
    ...(biasData.non_political_articles_data || []),
  ];

  // 2. Filter by category if not 'all'
  const filteredArticles =
    categoryFilter === 'all'
      ? allArticles
      : allArticles.filter((a) => a.category === categoryFilter);

  // 3. Compute source stats from filtered articles
  const { sourceAppearances, sourceBiasConsistency } =
    computeSourceStats(filteredArticles);

  // 4. Build publisher map: domain → { Name, Final Bias }
  const publisherMap = {};
  publisherList.forEach((pub) => {
    publisherMap[pub.Domain] = pub;
  });

  // 5. Group publishers by bias column
  const columnSources = {};
  SPECTRUM_COLUMNS.forEach((col) => {
    columnSources[col.key] = [];
  });

  // Process each publisher (deduplicate by name)
  const seenNames = new Set();
  publisherList.forEach((pub) => {
    const bias = (pub['Final Bias'] || 'unknown').toLowerCase();
    const column = SPECTRUM_COLUMNS.find((c) => c.key === bias);
    if (!column) return;

    // Skip duplicate publisher names
    if (seenNames.has(pub.Name)) return;
    seenNames.add(pub.Name);

    const appearances = sourceAppearances[pub.Name] || 0;

    // Only include sources that appear at least once in the filtered dataset
    // OR include all if filter is 'all' (show full publisher list)
    if (categoryFilter !== 'all' && appearances === 0) return;

    const reliability = getReliabilityScore(
      pub.Name,
      appearances,
      sourceBiasConsistency[pub.Name]
    );

    columnSources[bias].push({
      name: pub.Name,
      initial: pub.Name.charAt(0).toUpperCase(),
      domain: pub.Domain,
      reliability,
      appearances,
    });
  });

  // 6. Sort each column by reliability (descending)
  Object.keys(columnSources).forEach((key) => {
    columnSources[key].sort((a, b) => b.reliability - a.reliability);
  });

  // 7. Build final structure
  return SPECTRUM_COLUMNS.map((col) => ({
    key: col.key,
    label: col.label,
    sources: columnSources[col.key],
    count: columnSources[col.key].length,
  }));
}

/**
 * Get category filter options with labels
 */
export function getCategoryFilters() {
  return CATEGORY_FILTERS.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
  }));
}

/**
 * Get summary stats
 */
export function getBiasMapStats() {
  const totalSources = publisherList.length;
  const totalArticles = biasData.total_articles || 0;
  const politicalCount = biasData.political_articles || 0;
  const distribution = biasData.final_bias_distribution || {};

  return {
    totalSources,
    totalArticles,
    politicalCount,
    distribution,
  };
}

export { SPECTRUM_COLUMNS, CATEGORY_LABELS };
