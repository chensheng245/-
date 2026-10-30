/* ことばの森 — application logic */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEY = 'kotoba-mori-progress-v1';
  const LIBRARY_PAGE_SIZE = 40;
  const N5_SCENES_DATA = typeof N5_SCENES !== 'undefined' ? N5_SCENES : [];
  const N5_SECTIONS_DATA = typeof N5_SECTIONS !== 'undefined' ? N5_SECTIONS : [];
  const N4_SCENES_DATA = typeof N4_SCENES !== 'undefined' ? N4_SCENES : [];
  const N4_SECTIONS_DATA = typeof N4_SECTIONS !== 'undefined' ? N4_SECTIONS : [];
  const N3_SCENES_DATA = typeof N3_SCENES !== 'undefined' ? N3_SCENES : [];
  const N3_SECTIONS_DATA = typeof N3_SECTIONS !== 'undefined' ? N3_SECTIONS : [];
  const N2_SCENES_DATA = typeof N2_SCENES !== 'undefined' ? N2_SCENES : [];
  const N2_SECTIONS_DATA = typeof N2_SECTIONS !== 'undefined' ? N2_SECTIONS : [];
  const levelScenes = {
    N5: N5_SCENES_DATA,
    N4: N4_SCENES_DATA,
    N3: N3_SCENES_DATA,
    N2: N2_SCENES_DATA
  };
  const allScenes = [
    ...N5_SCENES_DATA,
    ...N4_SCENES_DATA,
    ...N3_SCENES_DATA,
    ...N2_SCENES_DATA
  ];
  const sceneMap = Object.fromEntries(allScenes.map((scene) => [scene.id, scene]));
  const sectionMap = Object.fromEntries(
    [...N5_SECTIONS_DATA, ...N4_SECTIONS_DATA, ...N3_SECTIONS_DATA, ...N2_SECTIONS_DATA].map(
      (section) => [section.id, section]
    )
  );
  const sceneThemeCount = new Set(allScenes.map((scene) => scene.id)).size;
  const levelMap = Object.fromEntries(LEVELS.map((level) => [level.id, level]));
  const wordMap = new Map(VOCAB.map((word) => [word.id, word]));
  const wordOrder = new Map(VOCAB.map((word, index) => [word.id, index]));
  const wordsByLevel = Object.fromEntries(
    LEVELS.map((level) => [level.id, VOCAB.filter((word) => word.level === level.id)])
  );

  function scenesForLevel(levelId = state.level) {
    return levelScenes[levelId] || SCENES;
  }

  const ICONS = {
    arrow: '<path d="M4 12h14M12 6l6 6-6 6"/>',
    check: '<path d="m5 12 4.5 4.5L20 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    speaker: '<path d="M5 10v4h3l4 3V7L8 10H5Z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10"/>',
    shuffle: '<path d="M4 7h3c4 0 4 10 8 10h5M16 4l4 3-4 3M4 17h3c1.4 0 2.3-1.2 3.2-2.6M16 14l4 3-4 3"/>',
    greetings: '<path d="M4 5.5h16v10H9l-4 3v-3H4z"/><path d="M8 9h8M8 12.5h5"/>',
    food: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M8 11V8M12 11V5.5M16 11V8M3 19.5h18"/>',
    shopping: '<path d="M5.5 8h13l1 12h-15z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    travel: '<rect x="5" y="3.5" width="14" height="13" rx="3"/><path d="M7.5 20l2-3.5M16.5 20l-2-3.5M7.5 9.5h9M9 13h.01M15 13h.01"/>',
    study: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 10h5"/>',
    work: '<rect x="3.5" y="7" width="17" height="12" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17M10 12.5v2h4v-2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/><path d="M5.5 5.5 4 4M18.5 5.5 20 4"/>',
    friends: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5M16 5.7a3 3 0 0 1 0 5.8M17 15.3c2.1.5 3.3 2 3.6 4.7"/>',
    news: '<path d="M4 5h13v14H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M7 8h7M7 11h7M7 14h4M17 8h3v9a2 2 0 0 1-2 2"/>',
    world: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z"/>',
    hobby: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    home: '<path d="m3 11 9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    nature: '<circle cx="8.5" cy="8" r="3.2"/><path d="M8.5 2v1.4M8.5 12.6V14M2 8h1.4M13.6 8H15M3.5 3l1 1M12.5 12l1 1M13.5 3l-1 1M4.5 12l-1 1"/><path d="M8 18.5h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5 1.1A3 3 0 0 0 8 18.5Z"/>',
    health: '<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.6 12 20 12 20Z"/><path d="M8 12h2l1.2-2.4L13 14l1-2h2"/>',
    feelings: '<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.6 12 20 12 20Z"/><path d="M18.5 3.5v3M17 5h3M4.5 4v2M3.5 5h2"/>'
  };

  const state = {
    level: 'N5',
    learned: new Set(),
    daily: { date: todayKey(), ids: new Set() },
    quizBest: {},
    wrong: new Map(),
    wrongLevel: 'all',
    wrongScene: 'all',
    masteredLevel: 'all',
    masteredScene: 'all',
    sceneFilter: 'all',
    sectionFilter: 'all',
    statusFilter: 'all',
    query: '',
    visibleCount: LIBRARY_PAGE_SIZE,
    study: null,
    quiz: null,
    lastFocus: null
  };

  let jaVoice = null;
  let activeSpeechButton = null;
  let searchTimer = null;

  /* ── Utilities ─────────────────────────────────────────── */

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return entities[character];
    });
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function uniqueBy(items, key) {
    const seen = new Set();
    return items.filter((item) => {
      if (seen.has(item[key])) return false;
      seen.add(item[key]);
      return true;
    });
  }

  function toHiragana(value) {
    return value.replace(/[\u30a1-\u30f6]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60)
    );
  }

  function normalizeSearch(value) {
    return toHiragana(String(value).toLowerCase().trim())
      .replace(/\[/g, '（')
      .replace(/\]/g, '）');
  }

  function formatCount(value) {
    return new Intl.NumberFormat('zh-CN').format(value);
  }

  function setLongClass(element, text) {
    const length = Array.from(String(text)).length;
    element.classList.remove('is-long', 'is-very-long');
    if (length >= 14) {
      element.classList.add('is-very-long');
    } else if (length >= 10) {
      element.classList.add('is-long');
    }
  }

  function isFormField(element) {
    return Boolean(element && element.closest('input, textarea, select, [contenteditable="true"]'));
  }

  function isInteractive(element) {
    return Boolean(
      element && element.closest('button, a, input, textarea, select, [role="button"]')
    );
  }

  /* ── Persistence ───────────────────────────────────────── */

  function loadProgress() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved && levelMap[saved.level]) {
        state.level = saved.level;
      }

      if (saved && Array.isArray(saved.learned)) {
        state.learned = new Set(saved.learned.filter((id) => wordMap.has(id)));
      }

      if (saved && saved.daily && saved.daily.date === todayKey() && Array.isArray(saved.daily.ids)) {
        state.daily = {
          date: saved.daily.date,
          ids: new Set(saved.daily.ids.filter((id) => wordMap.has(id)))
        };
      }

      if (saved && saved.quizBest && typeof saved.quizBest === 'object') {
        LEVELS.forEach((level) => {
          const value = Number(saved.quizBest[level.id]);
          if (Number.isFinite(value) && value >= 0) {
            state.quizBest[level.id] = Math.min(10, Math.round(value));
          }
        });
      }

      if (saved && saved.wrong && typeof saved.wrong === 'object' && !Array.isArray(saved.wrong)) {
        Object.entries(saved.wrong).forEach(([wordId, info]) => {
          if (!wordMap.has(wordId)) return;
          const count = Number(info && info.count);
          state.wrong.set(wordId, {
            count: Number.isFinite(count) && count > 0 ? Math.round(count) : 1,
            lastWrong: info && typeof info.lastWrong === 'string' ? info.lastWrong : '',
            lastSource: info && info.lastSource === 'unfamiliar' ? 'unfamiliar' : 'quiz',
            unfamiliar: info && Number.isFinite(Number(info.unfamiliar)) ? Number(info.unfamiliar) : 0,
            quizWrong: info && Number.isFinite(Number(info.quizWrong)) ? Number(info.quizWrong) : 0
          });
        });
      }
    } catch (error) {
      /* Local storage can be unavailable when the page is opened via file://. */
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          level: state.level,
          learned: [...state.learned],
          daily: { date: state.daily.date, ids: [...state.daily.ids] },
          quizBest: state.quizBest,
          wrong: Object.fromEntries(
            [...state.wrong.entries()].map(([wordId, info]) => [
              wordId,
              {
                count: info.count,
                lastWrong: info.lastWrong,
                lastSource: info.lastSource,
                unfamiliar: info.unfamiliar,
                quizWrong: info.quizWrong
              }
            ])
          )
        })
      );
    } catch (error) {
      /* Keep learning even if storage is blocked. */
    }
  }

  function rolloverDay() {
    const key = todayKey();
    if (state.daily.date === key) return false;
    state.daily = { date: key, ids: new Set() };
    persist();
    renderHero();
    updateTodayCount();
    return true;
  }

  /* ── Rendering ─────────────────────────────────────────── */

  function renderAll() {
    renderLevels();
    renderScenes();
    renderFilterChips();
    renderSectionFilter();
    renderLibrary(true);
    renderHero();
    updateQuizSummary();
    updateTodayCount();
    updateWrongSummary();
    updateMasteredSummary();
    $('#statLevels').textContent = String(LEVELS.length);
    $('#statScenes').textContent = String(sceneThemeCount);
    $('#statWords').textContent = formatCount(VOCAB.length);
  }

  function renderLevels() {
    $('#levelGrid').innerHTML = LEVELS.map((level) => {
      const words = wordsByLevel[level.id];
      const learned = words.filter((word) => state.learned.has(word.id)).length;
      const percent = Math.round((learned / words.length) * 100);
      const active = state.level === level.id;

      return `
        <article class="level-card${active ? ' is-active' : ''}"
          role="button" tabindex="0" data-level="${level.id}"
          aria-pressed="${active}" aria-label="切换到 ${level.id} ${level.zh}"
          style="--level-accent:${level.accent};--level-soft:${level.soft}">
          <span class="level-top">
            <span class="level-code">${level.id}</span>
            <span class="level-jp">${level.jp}</span>
          </span>
          <h3 class="level-title">${level.zh}</h3>
          <span class="level-desc">${level.desc}</span>
          <span class="level-progress">
            <span class="level-progress-head">
              <span>${learned} / ${words.length} 已掌握</span>
              <strong>${percent}%</strong>
            </span>
            <span class="level-track"><i style="width:${percent}%"></i></span>
          </span>
        </article>
      `;
    }).join('');
  }

  function renderScenes() {
    const level = levelMap[state.level];
    const scenes = scenesForLevel();
    $('#activeLevelBadge').textContent = `${level.id} · ${level.jp}`;

    $('#sceneGrid').innerHTML = scenes.map((scene, index) => {
      const words = wordsByLevel[state.level].filter((word) => word.scene === scene.id);
      const learned = words.filter((word) => state.learned.has(word.id)).length;
      const percent = words.length ? Math.round((learned / words.length) * 100) : 0;
      const sectionList = (scene.sections || [])
        .map((sectionId) => sectionMap[sectionId])
        .filter(Boolean);
      const preview = sectionList.length
        ? sectionList
            .slice(0, 4)
            .map((section) => `<span lang="ja">${escapeHTML(section.jp)}</span>`)
            .concat(
              sectionList.length > 4
                ? [`<span>+${sectionList.length - 4}</span>`]
                : []
            )
            .join('')
        : words
            .slice(0, 3)
            .map((word) => `<span lang="ja">${escapeHTML(word.word)}</span>`)
            .join('');
      const previewClass = sectionList.length ? 'word-preview is-sections' : 'word-preview';

      return `
        <article class="scene-card"
          role="button" tabindex="0" data-scene="${scene.id}"
          aria-label="学习 ${scene.jp}，${scene.zh}，${words.length} 个单词"
          style="--scene:${scene.color};--scene-soft:${scene.soft}">
          <div class="scene-top">
            <span class="scene-num">${String(index + 1).padStart(2, '0')}</span>
            <span class="scene-icon">${icon(scene.icon || scene.id)}</span>
          </div>
          <div class="scene-title">
            <h3 lang="ja">${escapeHTML(scene.jp)}</h3>
            <p>${escapeHTML(scene.zh)} · ${escapeHTML(scene.desc)}</p>
          </div>
          <div class="${previewClass}">${preview}</div>
          <div class="scene-foot">
            <span class="scene-count"><strong>${learned}</strong> / ${words.length} 已掌握</span>
            <span class="scene-mini-track"><i style="width:${percent}%"></i></span>
            <span class="scene-open">学习 ${icon('arrow')}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderFilterChips() {
    const sceneFilters = $('#sceneFilters');
    const scenes = scenesForLevel();
    sceneFilters.innerHTML = [
      `<button type="button" class="filter-chip${state.sceneFilter === 'all' ? ' is-active' : ''}" data-scene="all" aria-pressed="${state.sceneFilter === 'all'}">全部场景</button>`,
      ...scenes.map(
        (scene) =>
          `<button type="button" class="filter-chip${state.sceneFilter === scene.id ? ' is-active' : ''}" data-scene="${scene.id}" aria-pressed="${state.sceneFilter === scene.id}">${escapeHTML(scene.zh)}</button>`
      )
    ].join('');

    $$('#statusToggle button').forEach((button) => {
      const active = button.dataset.status === state.statusFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderSectionFilter() {
    const wrap = $('#sectionFilterWrap');
    const select = $('#sectionFilter');
    if (!wrap || !select) return;

    const chapterScenes = scenesForLevel().filter((scene) => (scene.sections || []).length > 0);
    if (!chapterScenes.length) {
      state.sectionFilter = 'all';
      wrap.hidden = true;
      select.innerHTML = '';
      return;
    }

    wrap.hidden = false;
    $('#sectionFilterLabel').textContent = `${state.level} 小节`;
    select.setAttribute('aria-label', `按 ${state.level} 小节筛选`);
    const scenes = state.sceneFilter === 'all'
      ? chapterScenes
      : chapterScenes.filter((scene) => scene.id === state.sceneFilter);
    const validSectionIds = new Set(scenes.flatMap((scene) => scene.sections || []));
    const sectionTotal = validSectionIds.size;

    if (state.sectionFilter !== 'all' && !validSectionIds.has(state.sectionFilter)) {
      state.sectionFilter = 'all';
    }

    const options = [`<option value="all">全部小节（${sectionTotal}）</option>`];
    scenes.forEach((scene) => {
      (scene.sections || []).forEach((sectionId) => {
        const section = sectionMap[sectionId];
        if (!section) return;
        options.push(
          `<option value="${section.id}">${escapeHTML(scene.zh)} · ${escapeHTML(section.zh)}</option>`
        );
      });
    });

    select.innerHTML = options.join('');
    select.value = state.sectionFilter;
  }

  function getWordStatus(word) {
    if (state.learned.has(word.id)) return 'mastered';
    if (state.wrong.has(word.id)) return 'unmastered';
    return 'unlearned';
  }

  function renderLibrary(resetPaging = false) {
    if (resetPaging) state.visibleCount = LIBRARY_PAGE_SIZE;

    const words = wordsByLevel[state.level];
    const query = normalizeSearch(state.query);

    const filtered = words.filter((word) => {
      const section = sectionMap[word.section];
      const scene = sceneMap[word.scene];
      if (state.sceneFilter !== 'all' && word.scene !== state.sceneFilter) return false;
      if (state.sectionFilter !== 'all' && word.section !== state.sectionFilter) return false;
      if (state.statusFilter !== 'all') {
        const status = getWordStatus(word);
        if (state.statusFilter === 'learned' && status !== 'mastered') return false;
        if (state.statusFilter === 'unmastered' && status !== 'unmastered') return false;
        if (state.statusFilter === 'unlearned' && status !== 'unlearned') return false;
      }

      if (!query) return true;

      const haystack = normalizeSearch(
        [
          word.word,
          word.reading,
          word.meaning,
          word.pos,
          word.example,
          word.exampleZh,
          section?.jp,
          section?.zh,
          scene?.jp,
          scene?.zh
        ].join(' ')
      );
      return haystack.includes(query);
    });

    const filterIsActive =
      Boolean(query) ||
      state.sceneFilter !== 'all' ||
      state.sectionFilter !== 'all' ||
      state.statusFilter !== 'all';
    const shown = filtered.slice(0, state.visibleCount);
    const remaining = filtered.length - shown.length;

    $('#resultCount').textContent = filterIsActive
      ? `${state.level} · ${filtered.length} / ${words.length} 个单词`
      : `${state.level} · ${words.length} 个单词`;

    $('#wordList').innerHTML = shown.map(wordCardHTML).join('');
    $('#wordList').hidden = filtered.length === 0;
    $('#emptyState').hidden = filtered.length !== 0;
    $('#loadMoreWrap').hidden = remaining <= 0;
    $('#loadMoreCount').textContent = remaining > 0
      ? `（剩余 ${remaining} 个）`
      : '';

    $$('#sceneFilters .filter-chip').forEach((button) => {
      const active = button.dataset.scene === state.sceneFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('#statusToggle button').forEach((button) => {
      const active = button.dataset.status === state.statusFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function wordCardHTML(word) {
    const learned = state.learned.has(word.id);
    const status = getWordStatus(word);
    const statusLabel = status === 'mastered' ? '已掌握' : status === 'unmastered' ? '未掌握' : '未学习';
    const showReading = word.reading !== word.word;
    const section = sectionMap[word.section];
    const meta = word.pos || section?.zh || 'N5';
    const example = word.example || '例文暂未收录';

    return `
      <div class="vocab-card is-${status}" data-word-card="${word.id}" data-word-status="${status}">
        <button class="word-audio" type="button" data-speak="${word.id}" aria-label="朗读 ${escapeHTML(word.word)}">
          ${icon('speaker')}
        </button>
        <div class="word-info">
          <div class="word-line">
            <span class="word-jp" lang="ja">${escapeHTML(word.word)}</span>
            ${showReading ? `<span class="word-read" lang="ja">${escapeHTML(word.reading)}</span>` : ''}
            <span class="word-status is-${status}">${statusLabel}</span>
          </div>
          <div class="word-example-row">
            <p class="word-example-line" lang="ja">${escapeHTML(example)}</p>
            ${word.example ? `
              <button class="example-audio" type="button" data-example-speak="${word.id}"
                aria-label="朗读 ${escapeHTML(word.word)} 的例句" title="朗读例句">
                ${icon('speaker')}
              </button>
            ` : ''}
          </div>
        </div>
        <div class="word-side">
          <strong>${escapeHTML(word.meaning)}</strong>
          <small>${escapeHTML(meta)}</small>
        </div>
        <button class="learn-dot" type="button" data-learn="${word.id}"
          aria-pressed="${learned}" aria-label="${learned ? '取消已掌握' : status === 'unmastered' ? '标记为已掌握（当前未掌握）' : '标记为已掌握'}：${escapeHTML(word.word)}"
          title="${learned ? '取消已掌握' : '标记为已掌握'}">
          ${icon('check')}
        </button>
      </div>
    `;
  }

  function getTodayWord() {
    const words = wordsByLevel[state.level];
    const index = hashString(`${todayKey()}#${state.level}`) % words.length;
    return words[index];
  }

  function renderHero() {
    const word = getTodayWord();
    if (!word) return;
    const scene = sceneMap[word.scene];
    const section = sectionMap[word.section];
    const learned = state.learned.has(word.id);
    const now = new Date();

    $('#heroDate').textContent = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    $('#heroWord').textContent = word.word;
    setLongClass($('#heroWord'), word.word);

    const reading = $('#heroReading');
    reading.textContent = word.reading;
    reading.hidden = word.reading === word.word;

    $('#heroMeaning').textContent = word.meaning;
    const heroExampleBox = $('#heroExample').closest('.word-example');
    heroExampleBox.hidden = !word.example;
    $('#heroExample').textContent = word.example || '';
    $('#heroExampleZh').textContent = word.exampleZh || '';
    $('#todayExampleAudioBtn').hidden = !word.example;
    $('#todayExampleAudioBtn').setAttribute('aria-label', `朗读 ${word.word} 的例句`);
    const sceneLabel = section ? `${scene?.jp || ''} / ${section.jp}` : scene?.jp || '';
    $('#heroMeta').textContent = `${word.level} · ${sceneLabel}`;

    $('#todayMarkBtn').classList.toggle('is-learned', learned);
    $('#todayMarkBtn').setAttribute('aria-pressed', String(learned));
    $('#todayMarkText').textContent = learned ? '已掌握' : '标记已学';
    $('#todayAudioBtn').setAttribute('aria-label', `朗读 ${word.word}`);
    $('#heroWord').closest('.word-card').setAttribute('aria-labelledby', 'heroWord');
  }

  function updateTodayCount() {
    $('#todayCount').textContent = String(state.daily.ids.size);
  }

  function updateQuizSummary() {
    const level = levelMap[state.level];
    const words = wordsByLevel[state.level];
    const learned = words.filter((word) => state.learned.has(word.id)).length;
    const best = state.quizBest[state.level];

    $('#quizLevelLabel').textContent = level.id;
    $('#quizMastered').textContent = `${learned} / ${words.length}`;
    $('#quizBest').textContent = Number.isFinite(best) ? `${best} / 10` : '—';
  }

  function getWrongEntries(level = 'all') {
    return [...state.wrong.entries()]
      .map(([wordId, info]) => ({
        word: wordMap.get(wordId),
        count: info.count,
        lastWrong: info.lastWrong,
        lastSource: info.lastSource || 'quiz',
        unfamiliar: info.unfamiliar || 0,
        quizWrong: info.quizWrong || 0
      }))
      .filter((entry) => entry.word && (level === 'all' || entry.word.level === level))
      .sort((a, b) => String(b.lastWrong).localeCompare(String(a.lastWrong)));
  }

  function getSelectedWrongEntries() {
    let entries = getWrongEntries(state.wrongLevel);
    if (state.wrongScene !== 'all') {
      entries = entries.filter((entry) => entry.word.scene === state.wrongScene);
    }
    return entries;
  }

  function updateWrongSummary() {
    const total = state.wrong.size;
    $('#wrongCount').textContent = String(total);
    $('#navWrongCount').textContent = String(total);
    $('#mobileWrongCount').textContent = String(total);
  }

  function getMasteredEntries(level = 'all') {
    return [...state.learned]
      .map((wordId) => wordMap.get(wordId))
      .filter((word) => word && (level === 'all' || word.level === level))
      .sort((a, b) => (wordOrder.get(a.id) ?? 0) - (wordOrder.get(b.id) ?? 0));
  }

  function getSelectedMasteredEntries() {
    let entries = getMasteredEntries(state.masteredLevel);
    if (state.masteredScene !== 'all') {
      entries = entries.filter((word) => word.scene === state.masteredScene);
    }
    return entries;
  }

  function updateMasteredSummary() {
    const total = state.learned.size;
    $('#masteredCount').textContent = String(total);
    $('#navMasteredCount').textContent = String(total);
    $('#mobileMasteredCount').textContent = String(total);
  }

  function addWrong(wordId, source = 'quiz') {
    if (!wordMap.has(wordId)) return;
    const existing = state.wrong.get(wordId);
    state.wrong.set(wordId, {
      count: (existing?.count || 0) + 1,
      lastWrong: new Date().toISOString(),
      lastSource: source === 'unfamiliar' ? 'unfamiliar' : 'quiz',
      unfamiliar: (existing?.unfamiliar || 0) + (source === 'unfamiliar' ? 1 : 0),
      quizWrong: (existing?.quizWrong || 0) + (source === 'unfamiliar' ? 0 : 1)
    });
    persist();
    updateWrongSummary();
    renderLibrary(false);
  }

  function removeWrong(wordId) {
    if (!state.wrong.delete(wordId)) return;
    persist();
    updateWrongSummary();
    renderLibrary(false);
  }

  /* ── Learning state ────────────────────────────────────── */

  function setLevel(levelId) {
    if (!levelMap[levelId] || state.level === levelId) return;
    const shouldRestoreFocus = Boolean(document.activeElement?.closest('[data-level]'));
    state.level = levelId;
    const nextScenes = scenesForLevel(levelId);
    if (state.sceneFilter !== 'all' && !nextScenes.some((scene) => scene.id === state.sceneFilter)) {
      state.sceneFilter = 'all';
    }
    state.sectionFilter = 'all';
    persist();
    $('#activeLevelBadge').textContent = `${levelId} · ${levelMap[levelId].jp}`;
    renderLevels();
    renderScenes();
    renderFilterChips();
    renderSectionFilter();
    renderLibrary(true);
    renderHero();
    updateQuizSummary();
    if (shouldRestoreFocus) {
      $(`.level-card[data-level="${levelId}"]`)?.focus({ preventScroll: true });
    }
    showToast(`已切换到 ${levelId} · ${levelMap[levelId].zh}`);
  }

  function setLearned(wordId, value, options = {}) {
    rolloverDay();
    const word = wordMap.get(wordId);
    if (!word) return;
    const focusedLearnButton = document.activeElement?.dataset?.learn || null;

    const wasLearned = state.learned.has(wordId);
    const wasWrong = state.wrong.has(wordId);
    if (wasLearned === value) {
      if (value && wasWrong) {
        state.wrong.delete(wordId);
        persist();
        updateWrongSummary();
      }
      return;
    }

    if (value) {
      state.learned.add(wordId);
      state.daily.ids.add(wordId);
      if (wasWrong) state.wrong.delete(wordId);
    } else {
      state.learned.delete(wordId);
    }

    persist();
    renderLevels();
    renderScenes();
    renderLibrary(false);
    renderHero();
    updateQuizSummary();
    updateTodayCount();
    updateWrongSummary();
    updateMasteredSummary();

    if (focusedLearnButton) {
      const restoredButton = $(`[data-learn="${focusedLearnButton}"]`);
      (restoredButton || $('#statusToggle button.is-active'))?.focus({ preventScroll: true });
    }

    if (!options.silent) {
      showToast(
        value ? `已记住「${word.word}」· ${word.meaning}` : `已取消「${word.word}」的掌握标记`
      );
    }
  }

  /* ── Study cards ───────────────────────────────────────── */

  function openStudyScene(sceneId) {
    const scene = sceneMap[sceneId];
    const words = wordsByLevel[state.level].filter((word) => word.scene === sceneId);
    if (!scene || !words.length) return;
    const scenes = scenesForLevel();
    const sceneIndex = scenes.findIndex((item) => item.id === sceneId);
    const scopes = (scene.sections || [])
      .map((sectionId) => sectionMap[sectionId])
      .filter(Boolean)
      .map((section) => ({
        ...section,
        count: words.filter((word) => word.section === section.id).length
      }))
      .filter((section) => section.count > 0);
    const isChapter = scopes.length > 0;

    openStudy(
      words,
      {
        kicker: `${state.level} · ${isChapter ? 'CHAPTER' : 'SCENE'} ${String(sceneIndex + 1).padStart(2, '0')}`,
        title: scene.jp,
        subtitle: isChapter
          ? `${scene.zh} · ${scopes.length} 个小节 · ${words.length} 个词`
          : `${scene.zh} · ${scene.desc}`,
        sceneId
      },
      { scopes }
    );
  }

  function openReview() {
    const words = shuffle(wordsByLevel[state.level]).slice(0, 10);
    openStudy(words, {
      kicker: `${state.level} · RANDOM REVIEW`,
      title: '随机复习',
      subtitle: `从当前等级抽出的 ${words.length} 个单词`
    });
  }

  function openRandomWord() {
    const words = wordsByLevel[state.level];
    const word = words[Math.floor(Math.random() * words.length)];
    const scene = sceneMap[word.scene];
    openStudy([word], {
      kicker: `${state.level} · TODAY'S WORD`,
      title: word.word,
      subtitle: `${scene.zh} · 随机抽到的一个词`
    });
  }

  function openStudy(words, meta, options = {}) {
    state.study = {
      allWords: words,
      words,
      scopes: options.scopes || [],
      scope: 'all',
      index: 0,
      meta
    };

    $('#studyKicker').textContent = meta.kicker;
    $('#studyTitle').textContent = meta.title;
    $('#studySubtitle').textContent = meta.subtitle;
    $('#studyBody').hidden = false;
    $('#studyComplete').hidden = true;

    renderStudy();
    openModal($('#studyModal'));
  }

  function renderStudyScopes() {
    const study = state.study;
    const wrap = $('#studyScopes');
    if (!study || !study.scopes.length) {
      wrap.hidden = true;
      wrap.innerHTML = '';
      return;
    }

    wrap.hidden = false;
    wrap.innerHTML = [
      `<button type="button" class="study-scope${study.scope === 'all' ? ' is-active' : ''}" data-scope="all" aria-pressed="${study.scope === 'all'}">全部 <span>${study.allWords.length}</span></button>`,
      ...study.scopes.map(
        (section) =>
          `<button type="button" class="study-scope${study.scope === section.id ? ' is-active' : ''}" data-scope="${section.id}" aria-pressed="${study.scope === section.id}">${escapeHTML(section.jp)} <span>${section.count}</span></button>`
      )
    ].join('');
  }

  function setStudyScope(scope) {
    const study = state.study;
    if (!study) return;
    const nextWords = scope === 'all'
      ? study.allWords
      : study.allWords.filter((word) => word.section === scope);
    if (!nextWords.length) return;
    study.scope = scope;
    study.words = nextWords;
    study.index = 0;
    renderStudy();
    $(`#studyScopes [data-scope="${scope}"]`)?.focus({ preventScroll: true });
  }

  function renderStudy() {
    const study = state.study;
    if (!study || !study.words.length) return;

    const word = study.words[study.index];
    const section = sectionMap[word.section];
    const learnedCount = study.words.filter((item) => state.learned.has(item.id)).length;
    const percent = ((study.index + 1) / study.words.length) * 100;

    renderStudyScopes();
    $('#studyCount').textContent = `${study.index + 1} / ${study.words.length}`;
    $('#studyLearnedCount').textContent = `${learnedCount} 已掌握`;
    $('#studyBar').style.width = `${percent}%`;

    $('#fcPos').textContent = word.pos || section?.jp || word.level;
    $('#fcWord').textContent = word.word;
    setLongClass($('#fcWord'), word.word);
    $('#fcReading').textContent = word.reading;
    $('#fcReading').hidden = word.reading === word.word;
    $('#fcLevel').textContent = word.level;
    $('#fcAudio').setAttribute('aria-label', `朗读 ${word.word}`);
    $('#fcMeaning').textContent = word.meaning;
    $('#fcExample').textContent = word.example || '';
    $('#fcExampleZh').textContent = word.exampleZh || '';
    $('#fcExample').closest('.fc-example').hidden = !word.example;
    $('#fcExampleAudio').hidden = !word.example;
    $('#fcExampleAudio').setAttribute('aria-label', `朗读 ${word.word} 的例句`);

    $('#fcAnswer').hidden = true;
    $('#revealBtn').hidden = false;
    $('#revealBtn').setAttribute('aria-expanded', 'false');
    $('#flashcard').classList.remove('is-revealed');

    const alreadyLearned = state.learned.has(word.id);
    $('#markLearnedBtn').innerHTML = alreadyLearned
      ? '已掌握 <span aria-hidden="true">✓</span>'
      : '记住了 <span aria-hidden="true">✓</span>';

    $('#prevCard').disabled = study.words.length <= 1;
    $('#nextCard').disabled = study.words.length <= 1;
  }

  function revealStudyAnswer() {
    if (!state.study || $('#studyBody').hidden) return;
    $('#fcAnswer').hidden = false;
    $('#revealBtn').hidden = true;
    $('#revealBtn').setAttribute('aria-expanded', 'true');
    $('#flashcard').classList.add('is-revealed');
  }

  function moveStudy(step) {
    if (!state.study) return;
    const total = state.study.words.length;
    state.study.index = (state.study.index + step + total) % total;
    renderStudy();
  }

  function finishStudyRound() {
    const study = state.study;
    if (!study) return;
    const learnedCount = study.words.filter((word) => state.learned.has(word.id)).length;
    const complete = $('#studyComplete');
    const heading = complete.querySelector('h3');

    $('#studyBody').hidden = true;
    complete.hidden = false;

    heading.textContent = learnedCount === study.words.length ? '这一轮，收好了。' : '这一轮，过完了。';
    if (learnedCount === 0) {
      $('#completeText').textContent = '慢慢来。下次再见到它们时，你会更眼熟一点。';
    } else if (learnedCount === study.words.length) {
      $('#completeText').textContent = `这一轮的 ${study.words.length} 个词，已经全部收进你的词汇林。`;
    } else {
      $('#completeText').textContent = `这一轮的 ${study.words.length} 个词里，有 ${learnedCount} 个已经收进词汇林。`;
    }

    $('#restartRound').focus({ preventScroll: true });
  }

  function markCurrentWord(value) {
    const study = state.study;
    if (!study) return;
    const word = study.words[study.index];
    const wasLearned = state.learned.has(word.id);
    const wasWrong = state.wrong.has(word.id);

    setLearned(word.id, value, { silent: true });

    if (!value) {
      addWrong(word.id, 'unfamiliar');
      showToast(`已加入错词集：「${word.word}」`);
    } else if (wasWrong) {
      showToast(`已加入已掌握，并从错词集移出：「${word.word}」`);
    } else if (!wasLearned) {
      showToast(`已加入已掌握：「${word.word}」`);
    }

    if (study.index >= study.words.length - 1) {
      finishStudyRound();
      return;
    }

    study.index += 1;
    renderStudy();
  }

  function restartStudyRound() {
    if (!state.study) return;
    state.study.index = 0;
    $('#studyComplete').hidden = true;
    $('#studyBody').hidden = false;
    renderStudy();
    $('#revealBtn').focus({ preventScroll: true });
  }

  /* ── Quiz ──────────────────────────────────────────────── */

  function makeQuestion(word, pool, index) {
    const kind = index % 3 === 2 ? 'word' : 'meaning';
    const distractorPool = uniqueBy(
      pool.filter((item) => {
        if (item.id === word.id) return false;
        return kind === 'meaning' ? item.meaning !== word.meaning : item.word !== word.word;
      }),
      kind === 'meaning' ? 'meaning' : 'word'
    );
    const distractors = shuffle(distractorPool).slice(0, 3);
    const choices = shuffle([word, ...distractors]);

    return {
      word,
      kind,
      prompt: kind === 'meaning' ? '这个单词是什么意思？' : '选出对应的日语单词',
      display: kind === 'meaning' ? word.word : word.meaning,
      sub: kind === 'meaning'
        ? (word.reading === word.word ? '选择最接近的中文释义' : word.reading)
        : '从下面四个选项中选出正确的一项',
      correctText: kind === 'meaning' ? word.meaning : word.word,
      options: choices.map((choice) => ({
        text: kind === 'meaning' ? choice.meaning : choice.word,
        correct: choice.id === word.id
      }))
    };
  }

  function buildQuestions(levelId) {
    const pool = wordsByLevel[levelId];
    const selected = shuffle(pool).slice(0, Math.min(10, pool.length));
    return selected.map((word, index) => makeQuestion(word, pool, index));
  }

  function buildQuestionsForWords(words) {
    return words.map((word, index) =>
      makeQuestion(word, wordsByLevel[word.level] || VOCAB, index)
    );
  }

  function startQuiz() {
    const levelId = state.level;
    const questions = buildQuestions(levelId);
    if (!questions.length) return;

    state.quiz = {
      level: levelId,
      questions,
      index: 0,
      score: 0,
      answered: false,
      mode: 'normal'
    };

    $('#quizTitle').textContent = '词汇小测';
    $('#quizKicker').textContent = `${levelId} · ${questions.length} ${questions.length === 1 ? 'QUESTION' : 'QUESTIONS'}`;
    $('#quizStage').hidden = false;
    $('#quizResult').hidden = true;
    renderQuiz();
    openModal($('#quizModal'));
  }

  function startWrongQuiz() {
    const entries = getSelectedWrongEntries();
    if (!entries.length) {
      showToast('错词集还是空的，先去做一次小测吧');
      return;
    }

    const words = shuffle(entries.map((entry) => entry.word)).slice(0, 10);
    const questions = buildQuestionsForWords(words);
    state.quiz = {
      level: '错词集',
      questions,
      index: 0,
      score: 0,
      answered: false,
      mode: 'wrong'
    };

    $('#quizTitle').textContent = '错词重练';
    $('#quizKicker').textContent = `错词重练 · ${questions.length} ${questions.length === 1 ? 'QUESTION' : 'QUESTIONS'}`;
    $('#quizStage').hidden = false;
    $('#quizResult').hidden = true;
    renderQuiz();
    openModal($('#quizModal'));
  }

  function renderQuiz() {
    const quiz = state.quiz;
    if (!quiz) return;
    const question = quiz.questions[quiz.index];
    const total = quiz.questions.length;

    $('#quizProgressText').textContent = `第 ${quiz.index + 1} / ${total} 题`;
    $('#quizScoreText').textContent = `${quiz.score} 分`;
    $('#quizBar').style.width = `${((quiz.index + 1) / total) * 100}%`;

    $('#quizQuestionLabel').textContent = question.prompt;
    $('#quizWord').textContent = question.display;
    $('#quizWord').lang = question.kind === 'meaning' ? 'ja' : 'zh-CN';
    setLongClass($('#quizWord'), question.display);
    $('#quizReading').textContent = question.sub;
    $('#quizReading').lang = question.kind === 'meaning' ? 'ja' : 'zh-CN';
    $('#quizAudioBtn').hidden = question.kind !== 'meaning';
    $('#quizAudioBtn').setAttribute('aria-label', `朗读 ${question.word.word}`);

    $('#quizOptions').innerHTML = question.options
      .map(
        (option, index) => `
          <button class="quiz-option" type="button" data-option="${index}">
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span lang="${question.kind === 'meaning' ? 'zh-CN' : 'ja'}">${escapeHTML(option.text)}</span>
          </button>
        `
      )
      .join('');

    quiz.answered = false;
    $('#quizFeedback').hidden = true;
    $('#quizFeedback').classList.remove('is-wrong');
    $('#quizDontKnowBtn').hidden = false;
    $('#quizDontKnowBtn').disabled = false;
    $('#nextQuestion').textContent = quiz.index === total - 1 ? '查看结果' : '下一题';
  }

  function answerQuiz(optionIndex, { dontKnow = false } = {}) {
    const quiz = state.quiz;
    if (!quiz || quiz.answered) return;
    const question = quiz.questions[quiz.index];
    const selected = dontKnow ? null : question.options[optionIndex];
    if (!dontKnow && !selected) return;

    const isCorrect = Boolean(selected?.correct);
    quiz.answered = true;
    if (isCorrect) quiz.score += 1;

    const buttons = $$('#quizOptions .quiz-option');
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (question.options[index].correct) button.classList.add('is-correct');
      if (!dontKnow && index === optionIndex && !isCorrect) button.classList.add('is-wrong');
    });

    if (isCorrect) {
      if (quiz.mode === 'wrong') removeWrong(question.word.id);
    } else {
      addWrong(question.word.id, 'quiz');
    }

    const feedback = $('#quizFeedback');
    feedback.hidden = false;
    feedback.classList.toggle('is-wrong', !isCorrect);
    $('#feedbackIcon').textContent = isCorrect ? '✓' : '×';

    if (isCorrect) {
      $('#feedbackTitle').textContent = quiz.mode === 'wrong' ? '答对了，已移出错词集' : '答对了';
    } else if (dontKnow) {
      $('#feedbackTitle').textContent = '已加入错词集';
    } else {
      $('#feedbackTitle').textContent = '差一点，已加入错词集';
    }

    const word = question.word;
    if (isCorrect) {
      $('#feedbackText').textContent =
        `「${question.display}」— ${question.correctText}` +
        (quiz.mode === 'wrong' ? '。已从错词集移除。' : '');
    } else {
      $('#feedbackText').textContent =
        `正确答案是「${question.correctText}」。${word.word}（${word.reading}）＝ ${word.meaning}。已加入错词集。`;
    }

    $('#quizScoreText').textContent = `${quiz.score} 分`;
    $('#quizDontKnowBtn').hidden = true;
    $('#nextQuestion').focus({ preventScroll: true });
  }

  function nextQuizQuestion() {
    const quiz = state.quiz;
    if (!quiz) return;

    if (quiz.index < quiz.questions.length - 1) {
      quiz.index += 1;
      renderQuiz();
      $('#quizOptions .quiz-option')?.focus({ preventScroll: true });
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const quiz = state.quiz;
    if (!quiz) return;
    const total = quiz.questions.length;
    const percent = Math.round((quiz.score / total) * 100);
    const isWrongMode = quiz.mode === 'wrong';

    $('#quizStage').hidden = true;
    $('#quizResult').hidden = false;
    $('#resultScore').textContent = String(quiz.score);
    $('#resultRing').style.setProperty('--score', String(percent));

    if (isWrongMode) {
      if (quiz.score === total) {
        $('#resultTitle').textContent = '错词清掉了。';
      } else if (quiz.score >= total * 0.6) {
        $('#resultTitle').textContent = '不错，再巩固一下。';
      } else {
        $('#resultTitle').textContent = '再看一遍，就会了。';
      }
      const remaining = state.wrong.size;
      const remainingInFilter = getSelectedWrongEntries().length;
      $('#resultText').textContent =
        `答对 ${quiz.score} / ${total} 题 · 错词重练` +
        (remaining ? ` · 错词集还有 ${remaining} 个` : ' · 错词集已清空');
      $('#retryQuiz').textContent = remainingInFilter ? '再练错词' : '做普通小测';
    } else {
      if (quiz.score === total) {
        $('#resultTitle').textContent = '全部答对，漂亮。';
      } else if (quiz.score >= total * 0.8) {
        $('#resultTitle').textContent = '很稳，再走一轮。';
      } else if (quiz.score >= total * 0.6) {
        $('#resultTitle').textContent = '基础不错，再巩固一下。';
      } else {
        $('#resultTitle').textContent = '没关系，回场景里再看看。';
      }
      $('#resultText').textContent = `答对 ${quiz.score} / ${total} 题 · ${quiz.level} 词汇`;
      $('#retryQuiz').textContent = '再来一次';
    }

    if (!isWrongMode) {
      const previousBest = Number.isFinite(state.quizBest[quiz.level]) ? state.quizBest[quiz.level] : -1;
      if (quiz.score > previousBest) {
        state.quizBest[quiz.level] = quiz.score;
        persist();
        updateQuizSummary();
        if (quiz.score >= 8) {
          showToast(`新的最佳成绩 · ${quiz.level} ${quiz.score} / ${total}`);
        }
      }
    }

    $('#retryQuiz').focus({ preventScroll: true });
  }

  /* ── Wrong-answer book ─────────────────────────────────── */

  function wrongDateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    if (todayKey(date) === todayKey()) return '今天';
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  function wrongItemHTML(entry) {
    const word = entry.word;
    const scene = sceneMap[word.scene];
    const section = sectionMap[word.section];
    const sourceLabel = entry.lastSource === 'unfamiliar' ? '还不熟' : '测验答错';
    const meta = [word.level, scene?.zh, section?.zh, sourceLabel].filter(Boolean).join(' · ');
    const reading = word.reading !== word.word
      ? `<span class="wrong-read" lang="ja">${escapeHTML(word.reading)}</span>`
      : '';

    return `
      <div class="wrong-item" data-wrong-item="${word.id}">
        <button class="word-audio" type="button" data-wrong-audio="${word.id}" aria-label="朗读 ${escapeHTML(word.word)}">
          ${icon('speaker')}
        </button>
        <div class="wrong-info">
          <div class="wrong-line">
            <span class="wrong-word" lang="ja">${escapeHTML(word.word)}</span>
            ${reading}
          </div>
          <p class="wrong-meaning">${escapeHTML(word.meaning)}</p>
          <p class="wrong-meta">${escapeHTML(meta)}</p>
        </div>
        <div class="wrong-stats">
          <span>错 ${entry.count} 次</span>
          <small>${wrongDateLabel(entry.lastWrong)}</small>
        </div>
        <button class="wrong-remove" type="button" data-wrong-remove="${word.id}"
          aria-label="移出错词集：${escapeHTML(word.word)}" title="移出错词集">
          ${icon('close')}
        </button>
      </div>
    `;
  }

  function renderWrongBook() {
    const allEntries = getWrongEntries();
    const counts = Object.fromEntries(
      LEVELS.map((level) => [
        level.id,
        allEntries.filter((entry) => entry.word.level === level.id).length
      ])
    );

    if (state.wrongLevel !== 'all' && !counts[state.wrongLevel]) {
      state.wrongLevel = 'all';
    }

    const levelEntries = getWrongEntries(state.wrongLevel);
    const sceneCounts = new Map();
    levelEntries.forEach((entry) => {
      sceneCounts.set(entry.word.scene, (sceneCounts.get(entry.word.scene) || 0) + 1);
    });

    const sceneOptions = [
      `<option value="all">全部场景（${levelEntries.length}）</option>`
    ];
    LEVELS.forEach((level) => {
      if (state.wrongLevel !== 'all' && state.wrongLevel !== level.id) return;
      scenesForLevel(level.id).forEach((scene) => {
        const count = sceneCounts.get(scene.id) || 0;
        if (!count) return;
        const prefix = state.wrongLevel === 'all' ? `${level.id} · ` : '';
        sceneOptions.push(
          `<option value="${scene.id}">${prefix}${escapeHTML(scene.zh)}（${count}）</option>`
        );
      });
    });

    const validSceneIds = new Set(sceneCounts.keys());
    if (state.wrongScene !== 'all' && !validSceneIds.has(state.wrongScene)) {
      state.wrongScene = 'all';
    }

    const sceneSelect = $('#wrongSceneFilter');
    sceneSelect.innerHTML = sceneOptions.join('');
    sceneSelect.value = state.wrongScene;
    sceneSelect.disabled = levelEntries.length === 0;
    $('#wrongSceneFilterWrap').hidden = levelEntries.length === 0;

    $('#wrongLevelFilters').innerHTML = [
      `<button type="button" class="wrongbook-level${state.wrongLevel === 'all' ? ' is-active' : ''}" data-wrong-level="all" aria-pressed="${state.wrongLevel === 'all'}">全部 <span>${allEntries.length}</span></button>`,
      ...LEVELS.map(
        (level) =>
          `<button type="button" class="wrongbook-level${state.wrongLevel === level.id ? ' is-active' : ''}" data-wrong-level="${level.id}" aria-pressed="${state.wrongLevel === level.id}">${level.id} <span>${counts[level.id]}</span></button>`
      )
    ].join('');

    const entries = getSelectedWrongEntries();
    const levelOrder = new Map(LEVELS.map((level, index) => [level.id, index]));
    const sceneOrder = new Map();
    LEVELS.forEach((level) => {
      scenesForLevel(level.id).forEach((scene, index) => sceneOrder.set(scene.id, index));
    });
    entries.sort((a, b) => {
      const levelDifference = (levelOrder.get(a.word.level) ?? 99) - (levelOrder.get(b.word.level) ?? 99);
      if (levelDifference) return levelDifference;
      const sceneDifference = (sceneOrder.get(a.word.scene) ?? 99) - (sceneOrder.get(b.word.scene) ?? 99);
      if (sceneDifference) return sceneDifference;
      return String(b.lastWrong).localeCompare(String(a.lastWrong));
    });

    const groups = new Map();
    entries.forEach((entry) => {
      const key = `${entry.word.level}:${entry.word.scene}`;
      if (!groups.has(key)) {
        groups.set(key, {
          level: entry.word.level,
          scene: sceneMap[entry.word.scene],
          items: []
        });
      }
      groups.get(key).items.push(entry);
    });

    $('#wrongSummary').textContent = state.wrongLevel === 'all' && state.wrongScene === 'all'
      ? `${entries.length} 个待复习`
      : `${entries.length} 个待复习 · 共 ${allEntries.length} 个`;
    $('#wrongList').innerHTML = [...groups.values()]
      .map(
        (group) => `
          <div class="wrong-group">
            <div class="wrong-group-head">
              <span class="wrong-group-level">${group.level}</span>
              <span>${escapeHTML(group.scene?.zh || '未分类')}</span>
              <small>${group.items.length} 词</small>
            </div>
            ${group.items.map(wrongItemHTML).join('')}
          </div>
        `
      )
      .join('');
    $('#wrongList').hidden = entries.length === 0;
    $('#wrongEmpty').hidden = entries.length !== 0;
    $('#retryWrongBtn').disabled = entries.length === 0;
    $('#retryWrongBtn').textContent = entries.length
      ? `重练 ${Math.min(10, entries.length)} 个错词`
      : '暂无可重练';
    $('#clearWrongBtn').disabled = allEntries.length === 0;
  }

  function openWrongBook() {
    state.wrongLevel = 'all';
    state.wrongScene = 'all';
    renderWrongBook();
    openModal($('#wrongModal'));
  }

  function clearWrongBook() {
    if (!state.wrong.size) return;
    if (!window.confirm('确定清空全部错词记录吗？')) return;
    state.wrong.clear();
    persist();
    updateWrongSummary();
    renderWrongBook();
    renderLibrary(false);
  }

  /* ── Mastered words ───────────────────────────────────── */

  function masteredItemHTML(word) {
    const scene = sceneMap[word.scene];
    const section = sectionMap[word.section];
    const meta = [word.level, scene?.zh, section?.zh].filter(Boolean).join(' · ');
    const reading = word.reading !== word.word
      ? `<span class="wrong-read" lang="ja">${escapeHTML(word.reading)}</span>`
      : '';

    return `
      <div class="wrong-item" data-mastered-item="${word.id}">
        <button class="word-audio" type="button" data-mastered-audio="${word.id}" aria-label="朗读 ${escapeHTML(word.word)}">
          ${icon('speaker')}
        </button>
        <div class="wrong-info">
          <div class="wrong-line">
            <span class="wrong-word" lang="ja">${escapeHTML(word.word)}</span>
            ${reading}
          </div>
          <p class="wrong-meaning">${escapeHTML(word.meaning)}</p>
          <p class="wrong-meta">${escapeHTML(meta)}</p>
        </div>
        <div class="wrong-stats">
          <span class="mastered-tag">已掌握</span>
        </div>
        <button class="wrong-remove" type="button" data-mastered-remove="${word.id}"
          aria-label="取消已掌握：${escapeHTML(word.word)}" title="取消已掌握">
          ${icon('close')}
        </button>
      </div>
    `;
  }

  function renderMasteredBook() {
    const allEntries = getMasteredEntries();
    const counts = Object.fromEntries(
      LEVELS.map((level) => [
        level.id,
        allEntries.filter((word) => word.level === level.id).length
      ])
    );

    if (state.masteredLevel !== 'all' && !counts[state.masteredLevel]) {
      state.masteredLevel = 'all';
    }

    const levelEntries = getMasteredEntries(state.masteredLevel);
    const sceneCounts = new Map();
    levelEntries.forEach((word) => {
      sceneCounts.set(word.scene, (sceneCounts.get(word.scene) || 0) + 1);
    });

    const sceneOptions = [
      `<option value="all">全部场景（${levelEntries.length}）</option>`
    ];
    LEVELS.forEach((level) => {
      if (state.masteredLevel !== 'all' && state.masteredLevel !== level.id) return;
      scenesForLevel(level.id).forEach((scene) => {
        const count = sceneCounts.get(scene.id) || 0;
        if (!count) return;
        const prefix = state.masteredLevel === 'all' ? `${level.id} · ` : '';
        sceneOptions.push(
          `<option value="${scene.id}">${prefix}${escapeHTML(scene.zh)}（${count}）</option>`
        );
      });
    });

    const validSceneIds = new Set(sceneCounts.keys());
    if (state.masteredScene !== 'all' && !validSceneIds.has(state.masteredScene)) {
      state.masteredScene = 'all';
    }

    const sceneSelect = $('#masteredSceneFilter');
    sceneSelect.innerHTML = sceneOptions.join('');
    sceneSelect.value = state.masteredScene;
    sceneSelect.disabled = levelEntries.length === 0;
    $('#masteredSceneFilterWrap').hidden = levelEntries.length === 0;

    $('#masteredLevelFilters').innerHTML = [
      `<button type="button" class="wrongbook-level${state.masteredLevel === 'all' ? ' is-active' : ''}" data-mastered-level="all" aria-pressed="${state.masteredLevel === 'all'}">全部 <span>${allEntries.length}</span></button>`,
      ...LEVELS.map(
        (level) =>
          `<button type="button" class="wrongbook-level${state.masteredLevel === level.id ? ' is-active' : ''}" data-mastered-level="${level.id}" aria-pressed="${state.masteredLevel === level.id}">${level.id} <span>${counts[level.id]}</span></button>`
      )
    ].join('');

    const entries = getSelectedMasteredEntries();
    const levelOrder = new Map(LEVELS.map((level, index) => [level.id, index]));
    const sceneOrder = new Map();
    LEVELS.forEach((level) => {
      scenesForLevel(level.id).forEach((scene, index) => sceneOrder.set(scene.id, index));
    });
    entries.sort((a, b) => {
      const levelDifference = (levelOrder.get(a.level) ?? 99) - (levelOrder.get(b.level) ?? 99);
      if (levelDifference) return levelDifference;
      const sceneDifference = (sceneOrder.get(a.scene) ?? 99) - (sceneOrder.get(b.scene) ?? 99);
      if (sceneDifference) return sceneDifference;
      return (wordOrder.get(a.id) ?? 0) - (wordOrder.get(b.id) ?? 0);
    });

    const groups = new Map();
    entries.forEach((word) => {
      const key = `${word.level}:${word.scene}`;
      if (!groups.has(key)) {
        groups.set(key, {
          level: word.level,
          scene: sceneMap[word.scene],
          items: []
        });
      }
      groups.get(key).items.push(word);
    });

    $('#masteredSummary').textContent = state.masteredLevel === 'all' && state.masteredScene === 'all'
      ? `${entries.length} 个已掌握`
      : `${entries.length} 个已掌握 · 共 ${allEntries.length} 个`;
    $('#masteredList').innerHTML = [...groups.values()]
      .map(
        (group) => `
          <div class="wrong-group">
            <div class="wrong-group-head">
              <span class="wrong-group-level">${group.level}</span>
              <span>${escapeHTML(group.scene?.zh || '未分类')}</span>
              <small>${group.items.length} 词</small>
            </div>
            ${group.items.map(masteredItemHTML).join('')}
          </div>
        `
      )
      .join('');
    $('#masteredList').hidden = entries.length === 0;
    $('#masteredEmpty').hidden = entries.length !== 0;
    $('#masteredReviewBtn').disabled = entries.length === 0;
    $('#masteredReviewBtn').textContent = entries.length
      ? `复习 ${Math.min(10, entries.length)} 词`
      : '暂无可复习';
  }

  function openMasteredBook() {
    state.masteredLevel = 'all';
    state.masteredScene = 'all';
    renderMasteredBook();
    openModal($('#masteredModal'));
  }

  function removeMastered(wordId) {
    const word = wordMap.get(wordId);
    if (!word || !state.learned.has(wordId)) return;
    setLearned(wordId, false, { silent: true });
    renderMasteredBook();
    showToast(`已取消已掌握：「${word.word}」`);
  }

  function startMasteredReview() {
    const entries = getSelectedMasteredEntries();
    if (!entries.length) return;
    const words = shuffle(entries).slice(0, 10);
    openStudy(words, {
      kicker: 'MASTERED · REVIEW',
      title: '掌握复习',
      subtitle: `从 ${entries.length} 个已掌握词中随机抽取 ${words.length} 个`
    });
  }

  /* ── Modals ────────────────────────────────────────────── */

  function getOpenModal() {
    return $('.modal[aria-hidden="false"]');
  }

  function openModal(modal) {
    if (!modal) return;
    const previousFocus = state.lastFocus;
    closeAllModals(false);
    const activeElement = document.activeElement;
    state.lastFocus =
      activeElement && activeElement.closest('.modal') ? previousFocus : activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const panel = modal.querySelector('.modal-panel');
    if (panel) {
      panel.setAttribute('tabindex', '-1');
      panel.focus({ preventScroll: true });
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    if (!getOpenModal()) {
      document.body.classList.remove('modal-open');
    }

    let focusTarget = state.lastFocus;
    if (focusTarget && !focusTarget.isConnected) {
      focusTarget = state.study?.meta?.sceneId
        ? $(`.scene-card[data-scene="${state.study.meta.sceneId}"]`)
        : $('#reviewBtn');
    }
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
    state.lastFocus = null;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearSpeechButton();
  }

  function closeAllModals(restoreFocus = true) {
    $$('.modal[aria-hidden="false"]').forEach((modal) => {
      modal.setAttribute('aria-hidden', 'true');
    });
    if (restoreFocus && state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus({ preventScroll: true });
    }
    state.lastFocus = null;
    document.body.classList.remove('modal-open');
  }

  function trapFocus(event) {
    const modal = getOpenModal();
    if (!modal || event.key !== 'Tab') return;

    const focusable = $$(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      modal
    ).filter((element) => element.offsetParent !== null && !element.hidden);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const panel = modal.querySelector('.modal-panel');

    if (document.activeElement === panel) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (!modal.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ── Speech ────────────────────────────────────────────── */

  function refreshVoices() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    jaVoice = voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('ja')) || null;
  }

  function clearSpeechButton() {
    if (activeSpeechButton) {
      activeSpeechButton.classList.remove('is-speaking');
      activeSpeechButton = null;
    }
  }

  function exampleSpeechText(value) {
    return String(value)
      .replace(/(^|[\n。！？」])\s*[A-ZＡ-Ｚ]\s*(?=[「:：])/g, '$1')
      .replace(/(^|\n)\s*[A-ZＡ-Ｚ]\s*[:：]\s*/g, '$1')
      .replace(/[「」]/g, '')
      .replace(/\n+/g, '。')
      .replace(/。{2,}/g, '。')
      .trim();
  }

  function speak(text, button) {
    if (!text) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      showToast('当前浏览器不支持语音朗读');
      return;
    }

    refreshVoices();
    window.speechSynthesis.cancel();
    clearSpeechButton();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.86;
    utterance.pitch = 1;
    if (jaVoice) utterance.voice = jaVoice;

    if (button) {
      activeSpeechButton = button;
      button.classList.add('is-speaking');
      const clear = () => {
        if (activeSpeechButton === button) clearSpeechButton();
      };
      utterance.onend = clear;
      utterance.onerror = clear;
    }

    window.speechSynthesis.speak(utterance);
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  }

  /* ── Feedback ──────────────────────────────────────────── */

  function showToast(message) {
    const stack = $('#toastStack');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">✓</span><span>${escapeHTML(message)}</span>`;
    stack.append(toast);

    window.setTimeout(() => {
      toast.classList.add('is-out');
      window.setTimeout(() => toast.remove(), 280);
    }, 2500);
  }

  /* ── Events ────────────────────────────────────────────── */

  function onActivate(container, selector, callback) {
    container.addEventListener('click', (event) => {
      const target = event.target.closest(selector);
      if (target) callback(target);
    });

    container.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target.closest(selector);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      callback(target);
    });
  }

  function bindEvents() {
    onActivate($('#levelGrid'), '[data-level]', (card) => setLevel(card.dataset.level));
    onActivate($('#sceneGrid'), '[data-scene]', (card) => openStudyScene(card.dataset.scene));

    $('#sceneFilters').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-scene]');
      if (!chip) return;
      state.sceneFilter = chip.dataset.scene;
      renderSectionFilter();
      renderLibrary(true);
    });

    $('#sectionFilter').addEventListener('change', (event) => {
      state.sectionFilter = event.target.value;
      renderLibrary(true);
    });

    $('#statusToggle').addEventListener('click', (event) => {
      const button = event.target.closest('[data-status]');
      if (!button) return;
      state.statusFilter = button.dataset.status;
      renderLibrary(true);
    });

    $('#searchInput').addEventListener('input', (event) => {
      state.query = event.target.value;
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => renderLibrary(true), 90);
    });

    $('#searchInput').addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      window.clearTimeout(searchTimer);
      if (event.target.value) {
        event.target.value = '';
        state.query = '';
        renderLibrary(true);
      } else {
        event.target.blur();
      }
    });

    $('#resetFiltersBtn').addEventListener('click', () => {
      window.clearTimeout(searchTimer);
      state.query = '';
      state.sceneFilter = 'all';
      state.sectionFilter = 'all';
      state.statusFilter = 'all';
      $('#searchInput').value = '';
      renderFilterChips();
      renderSectionFilter();
      renderLibrary(true);
      $('#sceneFilters .filter-chip')?.focus({ preventScroll: true });
    });

    $('#loadMoreBtn').addEventListener('click', () => {
      state.visibleCount += LIBRARY_PAGE_SIZE;
      renderLibrary(false);
    });

    $('#wordList').addEventListener('click', (event) => {
      const exampleButton = event.target.closest('[data-example-speak]');
      if (exampleButton) {
        const word = wordMap.get(exampleButton.dataset.exampleSpeak);
        if (word && word.example) speak(exampleSpeechText(word.example), exampleButton);
        return;
      }

      const speakButton = event.target.closest('[data-speak]');
      if (speakButton) {
        const word = wordMap.get(speakButton.dataset.speak);
        if (word) speak(word.word, speakButton);
        return;
      }

      const learnButton = event.target.closest('[data-learn]');
      if (learnButton) {
        const wordId = learnButton.dataset.learn;
        setLearned(wordId, !state.learned.has(wordId));
      }
    });

    $('#reviewBtn').addEventListener('click', openReview);
    $('#randomWordBtn').addEventListener('click', openRandomWord);

    $('#todayAudioBtn').addEventListener('click', () => {
      const word = getTodayWord();
      if (word) speak(word.word, $('#todayAudioBtn'));
    });

    $('#todayExampleAudioBtn').addEventListener('click', () => {
      const word = getTodayWord();
      if (word && word.example) speak(exampleSpeechText(word.example), $('#todayExampleAudioBtn'));
    });

    $('#todayMarkBtn').addEventListener('click', () => {
      const word = getTodayWord();
      if (word) setLearned(word.id, !state.learned.has(word.id));
    });

    $('#startQuizBtn').addEventListener('click', startQuiz);
    $('#retryQuiz').addEventListener('click', () => {
      if (state.quiz?.mode === 'wrong' && getSelectedWrongEntries().length) {
        startWrongQuiz();
      } else {
        startQuiz();
      }
    });
    $('#nextQuestion').addEventListener('click', nextQuizQuestion);
    $('#quizDontKnowBtn').addEventListener('click', () => {
      answerQuiz(null, { dontKnow: true });
    });

    $('#quizOptions').addEventListener('click', (event) => {
      const option = event.target.closest('[data-option]');
      if (option) answerQuiz(Number(option.dataset.option));
    });

    $('#quizAudioBtn').addEventListener('click', () => {
      if (!state.quiz) return;
      const question = state.quiz.questions[state.quiz.index];
      if (question) speak(question.word.word, $('#quizAudioBtn'));
    });

    $('#openWrongBookBtn').addEventListener('click', openWrongBook);
    $('#wrongBookNav').addEventListener('click', (event) => {
      event.preventDefault();
      openWrongBook();
    });

    $('#wrongLevelFilters').addEventListener('click', (event) => {
      const button = event.target.closest('[data-wrong-level]');
      if (!button) return;
      state.wrongLevel = button.dataset.wrongLevel;
      state.wrongScene = 'all';
      renderWrongBook();
    });

    $('#wrongSceneFilter').addEventListener('change', (event) => {
      state.wrongScene = event.target.value;
      renderWrongBook();
    });

    $('#wrongList').addEventListener('click', (event) => {
      const audioButton = event.target.closest('[data-wrong-audio]');
      if (audioButton) {
        const word = wordMap.get(audioButton.dataset.wrongAudio);
        if (word) speak(word.word, audioButton);
        return;
      }

      const removeButton = event.target.closest('[data-wrong-remove]');
      if (removeButton) {
        removeWrong(removeButton.dataset.wrongRemove);
        renderWrongBook();
        $('#wrongLevelFilters .wrongbook-level.is-active')?.focus({ preventScroll: true });
      }
    });

    $('#retryWrongBtn').addEventListener('click', startWrongQuiz);
    $('#clearWrongBtn').addEventListener('click', clearWrongBook);
    $('#wrongToQuiz').addEventListener('click', () => {
      closeModal($('#wrongModal'));
      startQuiz();
    });

    $('#openMasteredBtn').addEventListener('click', openMasteredBook);
    $('#masteredNav').addEventListener('click', (event) => {
      event.preventDefault();
      openMasteredBook();
    });

    $('#masteredLevelFilters').addEventListener('click', (event) => {
      const button = event.target.closest('[data-mastered-level]');
      if (!button) return;
      state.masteredLevel = button.dataset.masteredLevel;
      state.masteredScene = 'all';
      renderMasteredBook();
    });

    $('#masteredSceneFilter').addEventListener('change', (event) => {
      state.masteredScene = event.target.value;
      renderMasteredBook();
    });

    $('#masteredList').addEventListener('click', (event) => {
      const audioButton = event.target.closest('[data-mastered-audio]');
      if (audioButton) {
        const word = wordMap.get(audioButton.dataset.masteredAudio);
        if (word) speak(word.word, audioButton);
        return;
      }

      const removeButton = event.target.closest('[data-mastered-remove]');
      if (removeButton) {
        removeMastered(removeButton.dataset.masteredRemove);
        $('#masteredLevelFilters .wrongbook-level.is-active')?.focus({ preventScroll: true });
      }
    });

    $('#masteredReviewBtn').addEventListener('click', startMasteredReview);
    $('#masteredToScenes').addEventListener('click', () => {
      closeModal($('#masteredModal'));
      $('#scenes').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#mobileWrongBtn').addEventListener('click', openWrongBook);
    $('#mobileMasteredBtn').addEventListener('click', openMasteredBook);

    $('#revealBtn').addEventListener('click', revealStudyAnswer);
    $('#prevCard').addEventListener('click', () => moveStudy(-1));
    $('#nextCard').addEventListener('click', () => moveStudy(1));
    $('#markLearnedBtn').addEventListener('click', () => markCurrentWord(true));
    $('#markAgainBtn').addEventListener('click', () => markCurrentWord(false));
    $('#restartRound').addEventListener('click', restartStudyRound);

    $('#studyScopes').addEventListener('click', (event) => {
      const scopeButton = event.target.closest('[data-scope]');
      if (scopeButton) setStudyScope(scopeButton.dataset.scope);
    });

    $('#fcAudio').addEventListener('click', () => {
      if (!state.study) return;
      const word = state.study.words[state.study.index];
      if (word) speak(word.word, $('#fcAudio'));
    });

    $('#fcExampleAudio').addEventListener('click', () => {
      if (!state.study) return;
      const word = state.study.words[state.study.index];
      if (word && word.example) speak(exampleSpeechText(word.example), $('#fcExampleAudio'));
    });

    document.addEventListener('click', (event) => {
      const closer = event.target.closest('[data-close]');
      if (!closer) return;
      const modal = closer.closest('.modal');
      if (modal) closeModal(modal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        trapFocus(event);
        return;
      }

      const modal = getOpenModal();

      if (event.key === 'Escape' && modal) {
        event.preventDefault();
        closeModal(modal);
        return;
      }

      if (
        event.key === '/' &&
        !modal &&
        !isFormField(document.activeElement) &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        $('#searchInput').focus();
        return;
      }

      if (modal?.id !== 'studyModal' || $('#studyBody').hidden) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveStudy(-1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveStudy(1);
        return;
      }

      if (event.key === ' ' && !isInteractive(event.target)) {
        event.preventDefault();
        if ($('#revealBtn').hidden) {
          moveStudy(1);
        } else {
          revealStudyAnswer();
        }
      }
    });

    const header = $('.site-header');
    window.addEventListener(
      'scroll',
      () => header.classList.toggle('is-scrolled', window.scrollY > 8),
      { passive: true }
    );

    window.addEventListener('focus', rolloverDay);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) rolloverDay();
    });
  }

  /* ── Start ─────────────────────────────────────────────── */

  loadProgress();
  bindEvents();
  renderAll();
})();
