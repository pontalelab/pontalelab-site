(function () {
  'use strict';

  var ROTATION_THRESHOLD = 1440;
  var RESULT_DELAY_MS    = 600;

  // ── 中央状態 ──────────────────────────────────────────
  var state = {
    currentLang:     'ja',
    unlockedResults: [],
    currentScreen:   'home',
    lastResultId:    null,
    currentResult:   null,
    session: {
      targetResult:   null,
      materialA:      null,
      materialB:      null,
      insertedA:      false,
      insertedB:      false,
      totalRotation:  0,
      visualRotation: 0,
      prevPointer:    null,
      isCompleted:    false
    }
  };

  function setState(patch)   { Object.assign(state,         patch); }
  function setSession(patch) { Object.assign(state.session, patch); }

  var storage;

  // ── 初期化 ─────────────────────────────────────────────
  function init() {
    UI.init();
    storage = createStorage();

    I18n.init({
      dictionaries: AppData.i18n,
      storage:      storage,
      defaultLang:  'ja',
      storageKey:   StorageKeys.LANG
    });

    var savedCol = storage.loadData(StorageKeys.COLLECTION);
    setState({
      currentLang:     I18n.getLang(),
      unlockedResults: (savedCol && savedCol.unlocked) || []
    });

    I18n.onChange(function(newLang) {
      setState({ currentLang: newLang });
      UI.updateLangButton(I18n.t('lang_' + I18n.getNextLang()));
      _rerenderCurrentScreen();
    });

    _registerEvents();
    I18n.updateDOM();
    UI.updateLangButton(I18n.t('lang_' + I18n.getNextLang()));
    UI.showScreen('home');
  }

  // ── 画面遷移 ───────────────────────────────────────────
  function goToHome() {
    AudioFX.playBtnBack();
    AudioFX.bgm.start('home');
    setState({ currentScreen: 'home' });
    I18n.updateDOM();
    UI.showScreen('home');
  }

  function goToExperiment() {
    var target = selectNextResult(
      AppData.results,
      state.unlockedResults,
      state.lastResultId
    );
    if (!target) return;

    var matA = AppData.materials.filter(function(m) { return m.id === target.materialA; })[0];
    var matB = AppData.materials.filter(function(m) { return m.id === target.materialB; })[0];

    setState({ currentResult: null, currentScreen: 'experiment' });
    setSession({
      targetResult:   target,
      materialA:      matA,
      materialB:      matB,
      insertedA:      false,
      insertedB:      false,
      totalRotation:  0,
      visualRotation: 0,
      prevPointer:    null,
      isCompleted:    false
    });

    UI.renderExperiment({
      materialA: { image: matA.image, name: matA.name[state.currentLang] },
      materialB: { image: matB.image, name: matB.name[state.currentLang] }
    });
    UI.setHintText(I18n.t('exp_drag_hint'));
    I18n.updateDOM();
    UI.showScreen('experiment');
    UI.drawArrows();
    AudioFX.bgm.start('experiment');
  }

  function goToResult() {
    AudioFX.bgm.stop();  // 完成音を邪魔しないよう BGM 停止
    var result      = state.session.targetResult;
    var isNew       = isNewDiscovery(state.unlockedResults, result.id);
    var newUnlocked = addToUnlocked(state.unlockedResults, result.id);

    setState({
      unlockedResults: newUnlocked,
      currentResult:   result,
      lastResultId:    result.id,
      currentScreen:   'result'
    });
    storage.saveData(StorageKeys.COLLECTION, { unlocked: newUnlocked });

    UI.renderResult({
      image: result.image,
      name:  I18n.t('result_name_' + result.id),
      isNew: isNew
    });
    I18n.updateDOM();
    UI.showScreen('result');
  }

  function goToCardDetail(resultId) {
    AudioFX.playCardTap();
    AudioFX.bgm.start('carddetail');
    var result = AppData.results.filter(function(r) { return r.id === resultId; })[0];
    if (!result) return;
    var matA = AppData.materials.filter(function(m) { return m.id === result.materialA; })[0];
    var matB = AppData.materials.filter(function(m) { return m.id === result.materialB; })[0];
    var phraseIndex = Math.floor(Math.random() * 5);

    setState({ currentScreen: 'carddetail' });
    UI.renderCardDetail({
      materialA: { image: matA.image, name: matA.name[state.currentLang] },
      materialB: { image: matB.image, name: matB.name[state.currentLang] },
      result:    { image: result.image, name: I18n.t('result_name_' + result.id) },
      phrase:    I18n.t('detail_phrase_' + phraseIndex)
    });
    I18n.updateDOM();
    UI.showScreen('carddetail');
  }

  function goToGallery() {
    var items    = buildGalleryItems(AppData.results, state.unlockedResults);
    var progress = getProgress(state.unlockedResults, AppData.results.length);

    AudioFX.bgm.start('gallery');
    setState({ currentScreen: 'gallery' });
    UI.renderGallery({
      items:            items,
      found:            progress.found,
      total:            progress.total,
      progressTemplate: I18n.t('gallery_progress'),
      lockedLabel:      I18n.t('gallery_locked'),
      onCardTap:        goToCardDetail
    });
    I18n.updateDOM();
    UI.showScreen('gallery');
  }

  // ── イベント登録 ───────────────────────────────────────
  function _registerEvents() {
    // ボタン SE を先に登録（画面遷移 SE と重複しないよう各関数内で制御）
    UI.on.startClick(function() {
      AudioFX.playBtnForward();
      goToExperiment();
    });
    UI.on.galleryHomeClick(function() {
      AudioFX.playButton();
      goToGallery();
    });
    UI.on.langClick(function() {
      AudioFX.playBtnToggle();
      I18n.toggle();
    });
    UI.on.nextClick(function() {
      AudioFX.playBtnForward();
      goToExperiment();
    });
    UI.on.toGalleryClick(function() {
      AudioFX.playButton();
      goToGallery();
    });
    UI.on.galleryBackClick(goToHome);       // goToHome 内で playBtnBack
    UI.on.cardDetailBackClick(function() {
      AudioFX.playBtnBack();
      goToGallery();
    });

    // 素材ドラッグ
    UI.setupMaterialDrag({
      onStart: function(e, slot) {
        var mat = slot === 'a' ? state.session.materialA : state.session.materialB;
        if (!mat) return;
        UI.showDragGhost(mat.image, e.clientX, e.clientY);
      },
      onMove: function(e, slot, isOverBox) {
        UI.moveDragGhost(e.clientX, e.clientY);
        UI.setBoxDropReady(isOverBox);
      },
      onEnd: function(e, slot, droppedOnBox) {
        UI.hideDragGhost();
        UI.setBoxDropReady(false);
        if (!droppedOnBox) return;

        var alreadyIn = slot === 'a' ? state.session.insertedA : state.session.insertedB;
        if (alreadyIn) return;

        var mat = slot === 'a' ? state.session.materialA : state.session.materialB;

        if (slot === 'a') setSession({ insertedA: true });
        else              setSession({ insertedB: true });

        UI.setMaterialInserted(slot, true, mat.image);
        UI.hideArrowForSlot(slot);
        AudioFX.playInsert();

        if (state.session.insertedA && state.session.insertedB) {
          UI.setHintText(I18n.t('exp_rotate_hint'));
          UI.updateMixVisual(0, 0); // 素材を左右に並べた初期配置
        }
      }
    });

    // ボックス回転
    UI.setupBoxRotation({
      onStart: function(e) {
        if (state.session.isCompleted) return;
        setSession({ prevPointer: { x: e.clientX, y: e.clientY } });
      },
      onMove: function(e) {
        var sess = state.session;
        if (sess.isCompleted)              return;
        if (!sess.prevPointer)             return;
        if (!sess.insertedA || !sess.insertedB) return;

        var center   = UI.getBoxCenter();
        var current  = { x: e.clientX, y: e.clientY };
        var delta    = calcRotationDelta(sess.prevPointer, current, center);
        var newTotal = addRotation(sess.totalRotation, delta);
        var newVis   = sess.visualRotation + delta;

        setSession({
          totalRotation:  newTotal,
          visualRotation: newVis,
          prevPointer:    current
        });

        var progress = Math.min(newTotal / ROTATION_THRESHOLD, 1);
        var angleRad = newTotal * Math.PI / 180;

        UI.updateBoxRotation(newVis);
        UI.updateRotationProgress(newTotal, ROTATION_THRESHOLD);
        UI.updateMixVisual(progress, angleRad);

        // キラキラ音: 36度ごとに1回（progressが高いほど高音）
        var SPARK_DEG = 36;
        if (Math.floor(newTotal / SPARK_DEG) > Math.floor(sess.totalRotation / SPARK_DEG)) {
          AudioFX.playSparkle(progress);
        }

        if (isRotationComplete(newTotal, ROTATION_THRESHOLD)) {
          setSession({ isCompleted: true, prevPointer: null });
          AudioFX.playComplete();
          UI.playCompleteAnimation();
          setTimeout(goToResult, RESULT_DELAY_MS);
        }
      },
      onEnd: function() {
        setSession({ prevPointer: null });
      }
    });
  }

  // ── 言語切替後の再描画 ─────────────────────────────────
  function _rerenderCurrentScreen() {
    switch (state.currentScreen) {
      case 'experiment': {
        var s = state.session;
        if (!s.materialA || !s.materialB) break;
        UI.renderExperiment({
          materialA: { image: s.materialA.image, name: s.materialA.name[state.currentLang] },
          materialB: { image: s.materialB.image, name: s.materialB.name[state.currentLang] }
        });
        if (s.insertedA) UI.setMaterialInserted('a', true, s.materialA.image);
        if (s.insertedB) UI.setMaterialInserted('b', true, s.materialB.image);
        UI.updateBoxRotation(s.visualRotation);
        UI.updateRotationProgress(s.totalRotation, ROTATION_THRESHOLD);
        UI.setHintText(
          (s.insertedA && s.insertedB) ? I18n.t('exp_rotate_hint') : I18n.t('exp_drag_hint')
        );
        break;
      }
      case 'result': {
        if (!state.currentResult) break;
        UI.renderResult({
          image: state.currentResult.image,
          name:  I18n.t('result_name_' + state.currentResult.id),
          isNew: false
        });
        break;
      }
      case 'gallery': {
        goToGallery();
        break;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
