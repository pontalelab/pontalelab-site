var UI = (function () {
  'use strict';

  var $ = function(id) { return document.getElementById(id); };

  // DOM キャッシュ
  var el = {};
  function _cacheDOM() {
    el.screens = {
      home:       $('screen-home'),
      experiment: $('screen-experiment'),
      result:     $('screen-result'),
      gallery:    $('screen-gallery'),
      carddetail: $('screen-carddetail')
    };
    el.slotA       = $('slot-a');
    el.slotB       = $('slot-b');
    el.slotAImg    = $('slot-a-img');
    el.slotBImg    = $('slot-b-img');
    el.slotAName   = $('slot-a-name');
    el.slotBName   = $('slot-b-name');
    el.mixBox      = $('mix-box');
    el.mixBoxInner = $('mix-box-inner');
    el.mixIconA    = $('mixbox-icon-a');
    el.mixIconB    = $('mixbox-icon-b');
    el.ringFill    = $('ring-fill');
    el.expHint     = $('exp-hint');
    el.dragGhost   = $('drag-ghost');
    el.glowOverlay = $('exp-glow-overlay');
    el.resultBadge = $('result-new-badge');
    el.resultImage = $('result-image');
    el.resultName  = $('result-name');
    el.galleryGrid = $('gallery-grid');
    el.galleryProg = $('gallery-progress');
    el.langLabel   = $('lang-label');
  }

  // SVGリング周長 r=68: 2π×68≈427
  var RING_C = 2 * Math.PI * 68;

  // ── スクリーン切替 ──────────────────────────────────────
  function showScreen(name) {
    Object.keys(el.screens).forEach(function(k) {
      el.screens[k].classList.add('hidden');
      el.screens[k].classList.remove('is-entering');
    });
    var target = el.screens[name];
    if (!target) return;
    target.classList.remove('hidden');
    requestAnimationFrame(function() {
      target.classList.add('is-entering');
    });
    target.addEventListener('animationend', function() {
      target.classList.remove('is-entering');
    }, { once: true });
  }

  // ── 言語ボタンラベル ────────────────────────────────────
  function updateLangButton(label) {
    el.langLabel.textContent = label;
  }

  // ── EXPERIMENT ─────────────────────────────────────────
  function renderExperiment(params) {
    el.slotAImg.src  = params.materialA.image;
    el.slotAImg.alt  = params.materialA.name;
    el.slotAName.textContent = params.materialA.name;
    el.slotBImg.src  = params.materialB.image;
    el.slotBImg.alt  = params.materialB.name;
    el.slotBName.textContent = params.materialB.name;

    el.mixIconA.innerHTML = '';
    el.mixIconB.innerHTML = '';
    setMaterialInserted('a', false);
    setMaterialInserted('b', false);
    el.mixBox.classList.remove('drop-ready', 'celebrate');
    el.mixBox.style.boxShadow = '';
    updateBoxRotation(0);
    updateRotationProgress(0, 1);
    updateMixVisual(0, 0);
  }

  function setMaterialInserted(slot, inserted, imgSrc) {
    var slotEl = slot === 'a' ? el.slotA : el.slotB;
    var iconEl = slot === 'a' ? el.mixIconA : el.mixIconB;
    slotEl.classList.toggle('is-inserted', inserted);
    if (inserted && imgSrc) {
      iconEl.innerHTML = '<img src="' + imgSrc + '" alt="">';
    } else if (!inserted) {
      iconEl.innerHTML = '';
    }
  }

  function setBoxDropReady(ready) {
    el.mixBox.classList.toggle('drop-ready', ready);
  }

  function updateBoxRotation(angleDeg) {
    // boxInner自体の回転は渦巻きに任せるため軽微な傾きのみ
    el.mixBoxInner.style.transform = 'rotate(' + (angleDeg * 0.05) + 'deg)';
  }

  function updateRotationProgress(totalRotation, threshold) {
    var ratio  = Math.min(totalRotation / threshold, 1);
    var offset = RING_C * (1 - ratio);
    el.ringFill.style.strokeDashoffset = offset;
    el.ringFill.classList.toggle('is-complete', ratio >= 1);
  }

  /**
   * 渦巻き演出と光演出を一括更新する。
   * @param {number} progress  0〜1（totalRotation / threshold）
   * @param {number} angleRad  totalRotation をラジアン変換した値
   */
  function updateMixVisual(progress, angleRad) {
    // ── 渦巻き（2素材の軌道）──────────────────────────────
    var hasA = el.mixIconA.querySelector('img');
    var hasB = el.mixIconB.querySelector('img');
    if (hasA && hasB) {
      var radius = Math.max(32 * (1 - progress), 1);
      var scale  = (1 - 0.28 * progress).toFixed(3);
      var ax = Math.cos(angleRad) * radius;
      var ay = Math.sin(angleRad) * radius;

      el.mixIconA.style.transform =
        'translate(calc(-50% + ' + ax.toFixed(1) + 'px), calc(-50% + ' + ay.toFixed(1) + 'px))' +
        ' scale(' + scale + ')';
      el.mixIconB.style.transform =
        'translate(calc(-50% + ' + (-ax).toFixed(1) + 'px), calc(-50% + ' + (-ay).toFixed(1) + 'px))' +
        ' scale(' + scale + ')';
    }

    // ── BOXの光彩（黄→白に変化）──────────────────────────
    var gBlur   = Math.round(8  + progress * 55);
    var gSpread = Math.round(0  + progress * 18);
    var gG      = Math.round(180 + progress * 75);  // 180→255
    var gB      = Math.round(30  + progress * 150); //  30→180
    var gAlpha  = (0.15 + progress * 0.75).toFixed(2);
    el.mixBox.style.boxShadow =
      '0 8px 28px rgba(106,90,205,.45), ' +
      '0 0 ' + gBlur + 'px ' + gSpread + 'px rgba(255,' + gG + ',' + gB + ',' + gAlpha + ')';

    // ── 画面全体の白光（二乗曲線で終盤に一気に白くなる） ─────
    // progress=0.5 → opacity≈0.22 (うっすら)
    // progress=0.8 → opacity≈0.57 (かなり白い)
    // progress=1.0 → opacity=0.92 (ほぼ真っ白)
    el.glowOverlay.style.opacity = (Math.pow(progress, 2) * 0.92).toFixed(3);
  }

  function playCompleteAnimation() {
    el.mixBox.classList.add('celebrate');
    // 完成時に画面が一瞬フラッシュ
    el.glowOverlay.style.opacity = '1';
    setTimeout(function() { el.glowOverlay.style.opacity = '0'; }, 650);
    el.mixBox.addEventListener('animationend', function() {
      el.mixBox.classList.remove('celebrate');
    }, { once: true });
  }

  function setHintText(text) {
    el.expHint.textContent = text;
  }

  // ── ドラッグゴースト ────────────────────────────────────
  function showDragGhost(imgSrc, x, y) {
    el.dragGhost.innerHTML = '<img src="' + imgSrc + '" alt="">';
    el.dragGhost.classList.remove('hidden');
    moveDragGhost(x, y);
  }
  function moveDragGhost(x, y) {
    el.dragGhost.style.left = x + 'px';
    el.dragGhost.style.top  = y + 'px';
  }
  function hideDragGhost() {
    el.dragGhost.classList.add('hidden');
    el.dragGhost.innerHTML = '';
  }

  // ── RESULT ─────────────────────────────────────────────
  function renderResult(params) {
    el.resultImage.src = params.image;
    el.resultImage.alt = params.name;
    el.resultName.textContent = params.name;
    el.resultBadge.classList.toggle('hidden', !params.isNew);
  }

  // ── GALLERY ────────────────────────────────────────────
  function renderGallery(params) {
    el.galleryProg.textContent = params.progressTemplate
      .replace('{found}', params.found)
      .replace('{total}', params.total);

    el.galleryGrid.innerHTML = '';
    params.items.forEach(function(item, i) {
      var cell = document.createElement('div');
      cell.className = 'gallery-item gallery-item--' +
        (item.isUnlocked ? 'unlocked' : 'locked');
      cell.setAttribute('role', 'listitem');
      cell.setAttribute('data-result-id', item.id);

      if (item.isUnlocked) {
        var img = document.createElement('img');
        img.className = 'gallery-item__img';
        img.src = item.image;
        img.alt = item.id;
        img.style.animationDelay = (i * 40) + 'ms';
        cell.appendChild(img);

        // タップ検出: touchend（モバイル優先）＋ click（PC）
        // イベント委譲ではなく各要素に直接付与する
        if (params.onCardTap) {
          (function(id) {
            cell.addEventListener('touchend', function(e) {
              e.preventDefault(); // click の二重発火を防ぐ
              params.onCardTap(id);
            });
            cell.addEventListener('click', function() {
              params.onCardTap(id);
            });
          }(item.id));
        }
      } else {
        var icon = document.createElement('span');
        icon.className = 'gallery-item__locked-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = params.lockedLabel || '?';
        cell.appendChild(icon);
      }
      el.galleryGrid.appendChild(cell);
    });
  }

  // ── 素材ドラッグ設定 ────────────────────────────────────
  function setupMaterialDrag(handler) {
    var activeSlot = null;

    function isOverBox(cx, cy) {
      var r = el.mixBox.getBoundingClientRect();
      return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    }

    function onDown(e, slot) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activeSlot = slot;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
      e.currentTarget.classList.add('is-dragging');
      handler.onStart(e, slot);
    }
    function onMove(e) {
      if (!activeSlot) return;
      e.preventDefault();
      handler.onMove(e, activeSlot, isOverBox(e.clientX, e.clientY));
    }
    function onUp(e) {
      if (!activeSlot) return;
      var slot = activeSlot;
      var dropped = isOverBox(e.clientX, e.clientY);
      activeSlot = null;
      e.currentTarget.classList.remove('is-dragging');
      handler.onEnd(e, slot, dropped);
    }

    [el.slotA, el.slotB].forEach(function(slotEl, i) {
      var slot = i === 0 ? 'a' : 'b';
      slotEl.addEventListener('pointerdown',   function(e) { onDown(e, slot); });
      slotEl.addEventListener('pointermove',   onMove);
      slotEl.addEventListener('pointerup',     onUp);
      slotEl.addEventListener('pointercancel', onUp);
    });
  }

  // ── ボックス回転設定 ────────────────────────────────────
  function setupBoxRotation(handler) {
    el.mixBox.addEventListener('pointerdown', function(e) {
      el.mixBox.setPointerCapture(e.pointerId);
      el.mixBox.classList.add('is-spinning');
      handler.onStart(e);
    });
    el.mixBox.addEventListener('pointermove', function(e) {
      e.preventDefault();
      handler.onMove(e);
    });
    function endRot(e) {
      el.mixBox.classList.remove('is-spinning');
      handler.onEnd(e);
    }
    el.mixBox.addEventListener('pointerup',     endRot);
    el.mixBox.addEventListener('pointercancel', endRot);
  }

  function getBoxCenter() {
    var r = el.mixBox.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // ── 矢印オーバーレイ ────────────────────────────────────
  function drawArrows() {
    // レイアウト確定後に計測するため少し遅延
    setTimeout(function() {
      var cRect  = el.screens.experiment.getBoundingClientRect();
      var aRect  = el.slotA.getBoundingClientRect();
      var bRect  = el.slotB.getBoundingClientRect();
      var boxRect = el.mixBox.getBoundingClientRect();

      // ビューポート座標 → SVG座標（コンテナ相対）に変換
      function rx(v) { return v - cRect.left; }
      function ry(v) { return v - cRect.top;  }

      // 始点: 各スロットの下辺中央
      var ax1 = rx(aRect.left + aRect.width  / 2);
      var ay1 = ry(aRect.bottom) - 4;
      var bx1 = rx(bRect.left + bRect.width  / 2);
      var by1 = ry(bRect.bottom) - 4;

      // 終点: まぜまぜBOX上辺・左右にオフセット
      var boxMX = rx(boxRect.left + boxRect.width / 2);
      var boxTY = ry(boxRect.top) + 10;
      var ax2 = boxMX - 22;
      var ay2 = boxTY;
      var bx2 = boxMX + 22;
      var by2 = boxTY;

      // 制御点: 始点と終点の中間をボックス中心側に寄せる
      var aCpx = ax1 * 0.4 + boxMX * 0.6;
      var aCpy = ay1 * 0.35 + ay2 * 0.65;
      var bCpx = bx1 * 0.4 + boxMX * 0.6;
      var bCpy = by1 * 0.35 + by2 * 0.65;

      var pA = document.getElementById('arrow-a');
      var pB = document.getElementById('arrow-b');
      if (pA) {
        pA.setAttribute('d', 'M' + ax1 + ',' + ay1 +
          ' Q' + aCpx + ',' + aCpy + ' ' + ax2 + ',' + ay2);
        pA.style.display = '';
      }
      if (pB) {
        pB.setAttribute('d', 'M' + bx1 + ',' + by1 +
          ' Q' + bCpx + ',' + bCpy + ' ' + bx2 + ',' + by2);
        pB.style.display = '';
      }
    }, 80);
  }

  function hideArrowForSlot(slot) {
    var p = document.getElementById('arrow-' + slot);
    if (p) p.style.display = 'none';
  }

  function hideAllArrows() {
    hideArrowForSlot('a');
    hideArrowForSlot('b');
  }

  // ── 図鑑カード詳細画面 ─────────────────────────────────
  function renderCardDetail(params) {
    $('cd-mat-a-img').src   = params.materialA.image;
    $('cd-mat-a-img').alt   = params.materialA.name;
    $('cd-mat-a-name').textContent = params.materialA.name;
    $('cd-mat-b-img').src   = params.materialB.image;
    $('cd-mat-b-img').alt   = params.materialB.name;
    $('cd-mat-b-name').textContent = params.materialB.name;
    $('cd-result-img').src  = params.result.image;
    $('cd-result-img').alt  = params.result.name;
    $('cd-result-name').textContent = params.result.name;
    $('cd-phrase').textContent = params.phrase;
  }

  // ── ボタンイベント登録 ──────────────────────────────────
  var on = {
    startClick:       function(h) { $('btn-start')        .addEventListener('click', h); },
    galleryHomeClick: function(h) { $('btn-gallery-home') .addEventListener('click', h); },
    langClick:        function(h) { $('btn-lang')         .addEventListener('click', h); },
    nextClick:        function(h) { $('btn-next')         .addEventListener('click', h); },
    toGalleryClick:   function(h) { $('btn-to-gallery')   .addEventListener('click', h); },
    galleryBackClick:     function(h) { $('btn-gallery-back').addEventListener('click', h); },
    cardDetailBackClick:  function(h) { $('btn-cd-back')    .addEventListener('click', h); }
  };

  // ── 初期化（DOMReady後に呼ぶ） ──────────────────────────
  function init() { _cacheDOM(); }

  return {
    init: init,
    showScreen: showScreen,
    updateLangButton: updateLangButton,
    renderExperiment: renderExperiment,
    setMaterialInserted: setMaterialInserted,
    setBoxDropReady: setBoxDropReady,
    updateBoxRotation: updateBoxRotation,
    updateRotationProgress: updateRotationProgress,
    playCompleteAnimation: playCompleteAnimation,
    setHintText: setHintText,
    showDragGhost: showDragGhost,
    moveDragGhost: moveDragGhost,
    hideDragGhost: hideDragGhost,
    renderResult: renderResult,
    renderGallery: renderGallery,
    setupMaterialDrag: setupMaterialDrag,
    setupBoxRotation: setupBoxRotation,
    getBoxCenter: getBoxCenter,
    drawArrows: drawArrows,
    hideArrowForSlot: hideArrowForSlot,
    hideAllArrows: hideAllArrows,
    updateMixVisual: updateMixVisual,
    renderCardDetail: renderCardDetail,
    on: on
  };
})();
