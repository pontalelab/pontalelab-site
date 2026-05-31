var I18n = (function () {
  var _lang      = 'ja';
  var _dicts     = {};
  var _dict      = {};
  var _storage   = null;
  var _storageKey = 'lang';
  var _callbacks  = [];

  function init(options) {
    _dicts      = options.dictionaries;
    _storage    = options.storage;
    _storageKey = options.storageKey || 'lang';
    var def     = options.defaultLang || 'ja';

    var saved    = _storage.loadData(_storageKey);
    var detected = (navigator.language || '').slice(0, 2);
    var resolved = _isSupported(saved)    ? saved
                 : _isSupported(detected) ? detected
                 : def;
    _applyLang(resolved);
  }

  function t(key, vars) {
    var raw = _dict[key] !== undefined
      ? _dict[key]
      : (_dicts.ja && _dicts.ja[key] !== undefined ? _dicts.ja[key] : key);
    return vars ? _interpolate(raw, vars) : raw;
  }

  function _interpolate(str, vars) {
    return str.replace(/\{(\w+)\}/g, function(_, k) {
      return vars[k] !== undefined ? vars[k] : '{' + k + '}';
    });
  }

  function setLang(lang) {
    if (!_isSupported(lang) || lang === _lang) return;
    _applyLang(lang);
    _storage.saveData(_storageKey, lang);
    _notify(lang);
    updateDOM();
  }

  function toggle() {
    var langs = getLangs();
    var next  = langs[(langs.indexOf(_lang) + 1) % langs.length];
    setLang(next);
  }

  function _applyLang(lang) {
    _lang = lang;
    _dict = _dicts[lang] || _dicts.ja || {};
  }

  function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (_dict[key] !== undefined) el.textContent = _dict[key];
    });
  }

  function onChange(cb) { _callbacks.push(cb); }
  function _notify(lang) { _callbacks.forEach(function(cb) { cb(lang); }); }

  function getLang()     { return _lang; }
  function getLangs()    { return Object.keys(_dicts); }
  function getNextLang() {
    var langs = getLangs();
    return langs[(langs.indexOf(_lang) + 1) % langs.length];
  }

  function _isSupported(lang) {
    return typeof lang === 'string' && lang in _dicts;
  }

  return { init: init, t: t, setLang: setLang, toggle: toggle,
           onChange: onChange, getLang: getLang, getLangs: getLangs,
           getNextLang: getNextLang, updateDOM: updateDOM };
})();
