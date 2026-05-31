function isNewDiscovery(unlockedIds, resultId) {
  return unlockedIds.indexOf(resultId) === -1;
}

function addToUnlocked(unlockedIds, resultId) {
  if (unlockedIds.indexOf(resultId) !== -1) return unlockedIds;
  return unlockedIds.concat([resultId]);
}

function getProgress(unlockedIds, totalCount) {
  var found = unlockedIds.length;
  return { found: found, total: totalCount, isComplete: found >= totalCount };
}

function buildGalleryItems(results, unlockedIds) {
  var unlockedSet = {};
  unlockedIds.forEach(function(id) { unlockedSet[id] = true; });
  return results.map(function(result) {
    return {
      id:         result.id,
      isUnlocked: !!unlockedSet[result.id],
      image:      unlockedSet[result.id] ? result.image : null
    };
  });
}
