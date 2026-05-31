function MemoryStorageAdapter() {
  this._store = {};
}
MemoryStorageAdapter.prototype = Object.create(StoragePort.prototype);

MemoryStorageAdapter.prototype.saveData = function(key, value) {
  this._store[key] = JSON.parse(JSON.stringify(value));
};
MemoryStorageAdapter.prototype.loadData = function(key) {
  return this._store[key] !== undefined
    ? JSON.parse(JSON.stringify(this._store[key]))
    : null;
};
MemoryStorageAdapter.prototype.removeData = function(key) {
  delete this._store[key];
};
MemoryStorageAdapter.prototype.clear = function() {
  this._store = {};
};
