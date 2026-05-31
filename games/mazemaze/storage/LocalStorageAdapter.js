function LocalStorageAdapter() {
  this._prefix = 'mazemaze_';
}
LocalStorageAdapter.prototype = Object.create(StoragePort.prototype);

LocalStorageAdapter.prototype._key = function(key) {
  return this._prefix + key;
};

LocalStorageAdapter.prototype.saveData = function(key, value) {
  try {
    localStorage.setItem(this._key(key), JSON.stringify(value));
  } catch(e) { /* silent */ }
};

LocalStorageAdapter.prototype.loadData = function(key) {
  try {
    var raw = localStorage.getItem(this._key(key));
    return raw !== null ? JSON.parse(raw) : null;
  } catch(e) { return null; }
};

LocalStorageAdapter.prototype.removeData = function(key) {
  try { localStorage.removeItem(this._key(key)); } catch(e) { /* silent */ }
};

LocalStorageAdapter.prototype.clear = function() {
  try {
    var prefix = this._prefix;
    Object.keys(localStorage)
      .filter(function(k) { return k.indexOf(prefix) === 0; })
      .forEach(function(k) { localStorage.removeItem(k); });
  } catch(e) { /* silent */ }
};
