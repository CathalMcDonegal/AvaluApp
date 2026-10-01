import { store } from './store.js';

const app = document.querySelector('#app');

function render() {
  const courses = store.getCourses();
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="brand-mark">A</span><span>AvaluApp</span></div>
      <button class="icon-btn" id="settings" title="Configuració">⚙</button>
    </header>
    <main class="container">
      <section class="hero">
        <div>
          <p class="eyebrow">GESTIÓ EDUCATIVA</p>
          <h1>Els meus cursos</h1>
          <p class="muted">Organitza classes, alumnes i avaluacions des d'un sol lloc.</p>
        </div>
        <button class="primary" id="new-course">+ Crear curs</button>
      </section>
      <section class="stats">
        <div class="stat"><strong>${courses.length}</strong><span>Cursos</span></div>
        <div class="stat"><strong>${courses.reduce((n,c)=>n+(c.groups?.length||0),0)}</strong><span>Classes</span></div>
        <div class="stat"><strong>${courses.reduce((n,c)=>n+(c.groups||[]).reduce((m,g)=>m+(g.students?.length||0),0),0)}</strong><span>Alumnes</span></div>
      </section>
      <section class="course-grid">
        ${courses.length ? courses.map(courseCard).join('') : emptyState()}
      </section>
    </main>
  `;

  document.querySelector('#new-course').onclick = createCourse;
  document.querySelector('#settings').onclick = () => alert('La configuració d’ítems i plantilles arribarà a la següent fase.');
  document.querySelectorAll('[data-course]').forEach(b => b.onclick = () => openCourse(b.dataset.course));
}

function courseCard(course) {
  return `<article class="card course-card" data-course="${course.id}">
    <div class="card-icon">📚</div>
    <div class="course-main">
      <h2>${escapeHtml(course.name)}</h2>
      <p>${escapeHtml(course.year)} · ${course.groups.length} ${course.groups.length===1?'classe':'classes'}</p>
    </div>
    <div class="course-arrow">→</div>
  </article>`;
}

function emptyState() {
  return `<div class="empty"><div class="empty-icon">📘</div><h2>Comencem?</h2><p>Crea el teu primer curs per començar a organitzar les classes i els alumnes.</p><button class="primary" id="empty-create">Crear primer curs</button></div>`;
}

function createCourse() {
  const name = prompt('Nom del curs (ex.: 5è de Primària)');
  if (!name?.trim()) return;
  const year = prompt('Curs acadèmic (ex.: 2026-2027)', '2026-2027') || '2026-2027';
  const course = store.addCourse({name:name.trim(), year:year.trim()});
  openCourse(course.id);
}

function openCourse(id) {
  const course = store.getCourses().find(c=>c.id===id);
  if (!course) return;
  app.innerHTML = `
    <header class="topbar"><button class="back" id="back">←</button><div class="brand"><span class="brand-mark">A</span><span>${escapeHtml(course.name)}</span></div><span class="pill">${escapeHtml(course.year)}</span></header>
    <main class="container">
      <section class="hero compact"><div><p class="eyebrow">CURS</p><h1>Classes</h1><p class="muted">Crea grups i afegeix-hi els alumnes.</p></div><button class="primary" id="new-group">+ Crear classe</button></section>
      <section class="group-grid">${course.groups.length ? course.groups.map(groupCard).join('') : '<div class="empty"><div class="empty-icon">👥</div><h2>Encara no hi ha classes</h2><p>Crea una classe per començar a afegir alumnes.</p></div>'}</section>
    </main>`;
  document.querySelector('#back').onclick=render;
  document.querySelector('#new-group').onclick=()=>createGroup(course.id);
}

function groupCard(group) {
  return `<article class="card group-card"><div class="group-badge">${escapeHtml(group.name.slice(0,1).toUpperCase())}</div><div><h2>${escapeHtml(group.name)}</h2><p>${group.students.length} alumnes</p></div><button class="secondary" onclick="window.__addStudent('${group.id}')">+ Alumne</button></article>`;
}

window.__addStudent = id => {
  const first = prompt('Nom de l’alumne');
  if (!first?.trim()) return;
  const last = prompt('Cognoms') || '';
  store.addStudent(id,{firstName:first.trim(),lastName:last.trim()});
  const course = store.getCourses().find(c=>c.groups.some(g=>g.id===id));
  openCourse(course.id);
};

function createGroup(courseId) {
  const name=prompt('Nom de la classe (ex.: A, B, C, 5A...)');
  if (!name?.trim()) return;
  store.addGroup(courseId,{name:name.trim()});
  openCourse(courseId);
}

function escapeHtml(value='') {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

render();
