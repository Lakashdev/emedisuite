export function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }

  return rows[a.length][b.length];
}

export function searchScore(rawQuery, value) {
  const query = normalizeSearchText(rawQuery);
  const text = normalizeSearchText(value);
  if (!query || !text) return 0;
  if (text === query) return 120;
  if (text.startsWith(query)) return 100;
  if (text.includes(query)) return 85;

  const compactQuery = query.replaceAll(" ", "");
  const compactText = text.replaceAll(" ", "");
  if (compactText === compactQuery) return 115;
  if (compactText.startsWith(compactQuery)) return 95;
  if (compactText.includes(compactQuery)) return 82;

  const queryWords = query.split(" ").filter(Boolean);
  const words = text.split(" ").filter(Boolean);
  const wordScores = queryWords.map((queryWord) => {
    if (words.includes(queryWord)) return 80;
    if (words.some((word) => word.startsWith(queryWord) || queryWord.startsWith(word))) return 72;

    const bestDistance = Math.min(...words.map((word) => distance(queryWord, word)));
    const allowed = queryWord.length <= 4 ? 1 : queryWord.length <= 8 ? 2 : 3;
    return bestDistance <= allowed ? 64 - bestDistance * 8 : 0;
  });

  if (wordScores.some((wordScore) => wordScore === 0)) return 0;
  return Math.round(wordScores.reduce((sum, wordScore) => sum + wordScore, 0) / wordScores.length);
}

export function productSearchScore(query, product) {
  const variants = product.variants || [];
  const searchableText = [
    product.name,
    product.slug,
    product.description,
    product.brand?.name,
    product.category?.name,
    ...variants.flatMap((variant) => [variant.name, variant.sku]),
  ].filter(Boolean);

  return Math.max(
    searchScore(query, searchableText.join(" ")),
    ...searchableText.map((value) => searchScore(query, value)),
  );
}
