function selectRandom(items, excludeId) {
  var candidates = excludeId !== undefined
    ? items.filter(function(item) { return item.id !== excludeId; })
    : items;
  var pool = candidates.length > 0 ? candidates : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function selectNextResult(results, unlockedIds, lastResultId) {
  if (results.length === 0) return null;
  var unlockedSet = {};
  unlockedIds.forEach(function(id) { unlockedSet[id] = true; });
  var undiscovered = results.filter(function(r) { return !unlockedSet[r.id]; });
  var pool = undiscovered.length > 0 ? undiscovered : results;
  return selectRandom(pool, lastResultId);
}
