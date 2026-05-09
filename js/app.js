// State, event handlers, and init.
// Loads after topics.js, questions.js, render.js so all globals are ready.

let currentTopic = 'home';
let filterMode   = 'all';
const state = JSON.parse(localStorage.getItem('ckad-state') || '{}');

function saveState() {
  localStorage.setItem('ckad-state', JSON.stringify(state));
  updateScoreBadge();
  renderSidebar();
}

function markCard(id, val) {
  state[id] = val;
  saveState();
  renderMain();
}

function getTopicProgress(topicId) {
  const qs = QUESTIONS.filter(q => q.topic === topicId);
  const known = qs.filter(q => state[q.id] === 'known').length;
  return { total: qs.length, known };
}

function updateScoreBadge() {
  const known = QUESTIONS.filter(q => state[q.id] === 'known').length;
  document.getElementById('known-count').textContent = known;
  document.getElementById('total-count').textContent = QUESTIONS.length;
}

function showTopic(id) {
  currentTopic = id;
  filterMode = 'all';
  renderSidebar();
  renderMain();
  document.getElementById('main').scrollTop = 0;
  closeSidebar();
}

function setFilter(mode) {
  filterMode = mode;
  renderMain();
}

function toggleCard(id)   { document.getElementById(`card-${id}`).classList.toggle('open'); }
function toggleHint(id)   { document.getElementById(`hint-${id}`).classList.toggle('show'); }
function toggleAnswer(id) { document.getElementById(`answer-${id}`).classList.toggle('show'); }

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Mobile sidebar
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('show');
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.contains('open') ? closeSidebar() : openSidebar();
}

// Theme: persist in localStorage; default to dark to match the existing look.
const THEME_KEY = 'k8s-practice-theme';
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
  }
  document.querySelector('meta[name="theme-color"]').setAttribute(
    'content', theme === 'dark' ? '#282a36' : '#f4f1ea'
  );
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
document.getElementById('menu-btn').addEventListener('click', toggleSidebar);
document.getElementById('sidebar-backdrop').addEventListener('click', closeSidebar);
document.getElementById('theme-btn').addEventListener('click', toggleTheme);

updateScoreBadge();
renderSidebar();
renderMain();
