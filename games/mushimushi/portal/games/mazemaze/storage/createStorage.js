function createStorage(type) {
  var target = type || (typeof localStorage !== 'undefined' ? 'local' : 'memory');
  if (target === 'local')  return new LocalStorageAdapter();
  if (target === 'memory') return new MemoryStorageAdapter();
  throw new Error('Unknown storage type: ' + target);
}
