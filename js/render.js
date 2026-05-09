// Rendering: sidebar, home (focus hero + browse strips), topic detail.
// All three functions read from globals: state, currentTopic, filterMode, TOPICS, QUESTIONS, FOCUS_ORDER.

function renderSidebar() {
  const renderTopicBtn = (t) => {
    const prog = getTopicProgress(t.id);
    const pct  = prog.total ? Math.round(prog.known / prog.total * 100) : 0;
    return `
      <button class="topic-btn ${currentTopic === t.id ? 'active' : ''}" onclick="showTopic('${t.id}')" id="nav-${t.id}">
        <i class="ph ph-${t.icon}"></i> ${t.label}
        <span class="count">${prog.known}/${prog.total}</span>
      </button>
      <div class="progress-mini"><div class="progress-mini-fill" style="width:${pct}%"></div></div>`;
  };

  const focus     = focusTopics();
  const ckaOther  = TOPICS.filter(t => t.cert === 'cka' && !t.focus);
  const ckadOther = TOPICS.filter(t => (t.cert || 'ckad') === 'ckad' && !t.focus);

  let html = `
    <div class="sidebar-section">Navigation</div>
    <button class="topic-btn ${currentTopic === 'home' ? 'active' : ''}" onclick="showTopic('home')" id="nav-home">
      <i class="ph ph-house"></i> Overview
    </button>
    <div class="sidebar-section" style="margin-top:8px">Focus</div>`;
  focus.forEach(t => { html += renderTopicBtn(t); });
  html += `<div class="sidebar-section" style="margin-top:14px">CKA</div>`;
  ckaOther.forEach(t => { html += renderTopicBtn(t); });
  html += `<div class="sidebar-section" style="margin-top:14px">CKAD</div>`;
  ckadOther.forEach(t => { html += renderTopicBtn(t); });

  document.getElementById('sidebar').innerHTML = html;
}

function renderHome(main) {
  const focus = focusTopics();

  const renderFocusCard = (t) => {
    const prog = getTopicProgress(t.id);
    const pct  = prog.total ? Math.round(prog.known / prog.total * 100) : 0;
    const qs   = QUESTIONS.filter(q => q.topic === t.id);

    const titles = qs.length
      ? `<ul class="fc-titles">${qs.slice(0, 4).map(q => {
          const isKnown = state[q.id] === 'known';
          const isFail  = q.difficulty === 'fail';
          return `<li class="${isKnown ? 'known' : ''} ${isFail ? 'priority' : ''}">${q.title}</li>`;
        }).join('')}${qs.length > 4 ? `<li class="more">+${qs.length - 4} more</li>` : ''}</ul>`
      : `<div class="fc-empty">No questions yet, drill from KodeKloud labs.</div>`;

    return `
      <div class="focus-card" onclick="showTopic('${t.id}')">
        <div class="fc-head">
          <i class="ph ph-${t.icon}"></i>
          <h3>${t.label}</h3>
          <span class="fc-count">${prog.known}/${prog.total}</span>
        </div>
        ${titles}
        <div class="fc-progress"><div class="fc-fill" style="width:${pct}%"></div></div>
      </div>`;
  };

  main.innerHTML = `<div class="focus-hero">${focus.map(renderFocusCard).join('')}</div>`;
}

function renderTopic(main) {
  const topic = TOPICS.find(t => t.id === currentTopic);
  if (!topic) return;
  let qs = QUESTIONS.filter(q => q.topic === currentTopic);
  if (filterMode === 'failed')  qs = qs.filter(q => q.difficulty === 'fail');
  if (filterMode === 'unknown') qs = qs.filter(q => state[q.id] !== 'known');
  if (filterMode === 'known')   qs = qs.filter(q => state[q.id] === 'known');

  let html = `
    <div class="topic-header">
      <h2><i class="ph ph-${topic.icon}"></i> ${topic.label}</h2>
    </div>
    <div class="docs-nav">
      <h3><i class="ph ph-book-open"></i> Docs</h3>
      <div class="docs-nav-grid">`;
  topic.docLinks.forEach(dl => {
    html += `<div class="docs-item">
      <div class="path">${topic.docsPath}</div>
      <a href="${dl.url}" target="_blank"><i class="ph ph-arrow-up-right"></i> ${dl.label}</a>
      <div class="search-tip"><i class="ph ph-lightbulb"></i> ${dl.tip}</div>
    </div>`;
  });
  html += `</div></div>
    <div class="filter-row">
      <button class="filter-btn ${filterMode==='all'?'active':''}" onclick="setFilter('all')">All (${QUESTIONS.filter(q=>q.topic===currentTopic).length})</button>
      <button class="filter-btn ${filterMode==='failed'?'active':''}" onclick="setFilter('failed')">Priority (${QUESTIONS.filter(q=>q.topic===currentTopic&&q.difficulty==='fail').length})</button>
      <button class="filter-btn ${filterMode==='unknown'?'active':''}" onclick="setFilter('unknown')">Needs Practice (${QUESTIONS.filter(q=>q.topic===currentTopic&&state[q.id]!=='known').length})</button>
      <button class="filter-btn ${filterMode==='known'?'active':''}" onclick="setFilter('known')" style="color:var(--green)">Known (${QUESTIONS.filter(q=>q.topic===currentTopic&&state[q.id]==='known').length})</button>
    </div>`;

  if (qs.length === 0) {
    html += `<div class="empty-state"><i class="ph ph-check-circle"></i><p>No questions in this filter.</p></div>`;
  } else {
    qs.forEach((q, i) => {
      const isKnown = state[q.id] === 'known';
      const needsReview = state[q.id] === 'review';
      const statusText = isKnown ? '<i class="ph ph-check-circle"></i> Marked as known' : needsReview ? '<i class="ph ph-warning"></i> Needs review' : '';
      html += `
      <div class="q-card ${q.difficulty === 'fail' ? 'failed' : ''} ${isKnown ? 'known' : ''}" id="card-${q.id}">
        <div class="q-header" onclick="toggleCard('${q.id}')">
          <span class="q-num">Q${i+1}</span>
          <span class="q-title">${q.title}</span>
          <span class="q-meta">
            ${q.difficulty === 'fail' ? '<span class="tag tag-fail">PRIORITY</span>' : ''}
            ${q.difficulty === 'hard' ? '<span class="tag tag-hard">HARD</span>' : ''}
            ${q.difficulty === 'medium' ? '<span class="tag tag-med">MEDIUM</span>' : ''}
            ${q.difficulty === 'easy' ? '<span class="tag tag-easy">EASY</span>' : ''}
          </span>
          <i class="ph ph-caret-right chevron"></i>
        </div>
        <div class="q-body" id="body-${q.id}">
          <div class="q-scenario">${q.scenario}</div>
          <button class="hint-btn" onclick="toggleHint('${q.id}')"><i class="ph ph-book-open"></i> Show Docs Hint</button>
          <button class="answer-btn" onclick="toggleAnswer('${q.id}')"><i class="ph ph-check-circle"></i> Show Answer</button>
          <div class="hint-panel" id="hint-${q.id}">
            <h4>Where to find this in the docs</h4>
            <div class="hint-row"><span class="hint-label">Path:</span> <span>${q.hint.path}</span></div>
            <div class="hint-row"><span class="hint-label">URL:</span> <a href="${q.hint.url}" target="_blank">${q.hint.url}</a></div>
            <div class="hint-row"><span class="hint-label">Tip:</span> <span class="hint-search">${q.hint.tip}</span></div>
          </div>
          <div class="answer-panel" id="answer-${q.id}">
            <h4>Answer</h4>
            <div class="explanation">${q.answer.explanation}</div>
            <pre>${escapeHtml(q.answer.yaml)}</pre>
          </div>
          <div class="mark-row">
            <button class="mark-known" onclick="markCard('${q.id}','known')"><i class="ph ph-check-circle"></i> Got it</button>
            <button class="mark-review" onclick="markCard('${q.id}','review')"><i class="ph ph-arrows-clockwise"></i> Need more practice</button>
            <span class="mark-status">${statusText}</span>
          </div>
        </div>
      </div>`;
    });
  }
  main.innerHTML = html;
}

function renderMain() {
  const main = document.getElementById('main');
  if (currentTopic === 'home') {
    renderHome(main);
  } else {
    renderTopic(main);
  }
}
