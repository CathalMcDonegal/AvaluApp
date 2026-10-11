(() => {
  const STORE_KEY = 'avaluapp-data-v1';
  let lastHost = null;

  const readData = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
  };

  const currentGroup = () => {
    const data = readData();
    const heading = [...document.querySelectorAll('h1,h2')].find(el => /alumn|classe|avalu/i.test(el.textContent || ''));
    const names = [...document.querySelectorAll('.student-row')].map(row => row.textContent.replace(/🗑/g,'').trim().toLowerCase()).filter(Boolean);
    for (const c of data.courses || []) for (const g of c.groups || []) {
      const groupNames = (g.students || []).map(s => `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase());
      if (names.length && groupNames.some(n => names.includes(n))) return {c,g};
    }
    const title = heading?.textContent?.trim().toLowerCase() || '';
    for (const c of data.courses || []) for (const g of c.groups || []) {
      if (title === (g.name || '').toLowerCase()) return {c,g};
    }
    return null;
  };

  const actionButton = (selector, fallbackText) => {
    const el = document.querySelector(selector);
    if (el) return () => el.click();
    const el2 = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes(fallbackText));
    return el2 ? () => el2.click() : null;
  };

  const add = () => {
    const studentList = document.querySelector('.student-list');
    const grid = document.querySelector('#grid');
    const addStudent = document.querySelector('#add');
    const importBtn = document.querySelector('#import');
    if (!studentList || !grid || document.querySelector('.class-dashboard')) return;

    const info = currentGroup();
    const count = info?.g?.students?.length ?? document.querySelectorAll('.student-row').length;
    const courseName = info?.c?.name || 'Classe';
    const groupName = info?.g?.name || '';
    const calendarHref = info?.g?.id ? `./calendar.html?group=${encodeURIComponent(info.g.id)}` : './calendar.html';

    const host = document.createElement('section');
    host.className = 'class-dashboard';
    host.innerHTML = `
      <div class="dashboard-heading">
        <div><p class="eyebrow">PANELL DE CONTROL</p><h2>${groupName ? 'Gestiona '+escapeHtml(groupName) : 'Gestiona la classe'}</h2><p class="muted">${escapeHtml(courseName)} · ${count} alumnes</p></div>
        <span class="dashboard-status">● Classe activa</span>
      </div>
      <div class="dashboard-grid">
        <button class="dashboard-card students" data-action="students"><span class="dashboard-icon">👥</span><span><strong>Alumnes</strong><small>${count} alumnes · llista i fitxes</small></span><b>→</b></button>
        <button class="dashboard-card assessment" data-action="assessment"><span class="dashboard-icon">📊</span><span><strong>Avaluació</strong><small>Graella de notes de tota la classe</small></span><b>→</b></button>
        <a class="dashboard-card calendar" href="${calendarHref}"><span class="dashboard-icon">📅</span><span><strong>Calendari</strong><small>Sortides, activitats, exàmens...</small></span><b>→</b></a>
        <button class="dashboard-card add-student" data-action="add"><span class="dashboard-icon">➕</span><span><strong>Afegir alumnes</strong><small>Un alumne o importar Excel</small></span><b>→</b></button>
      </div>`;

    studentList.parentElement.insertBefore(host, studentList);
    host.querySelector('[data-action="students"]').onclick = () => studentList.scrollIntoView({behavior:'smooth', block:'start'});
    host.querySelector('[data-action="assessment"]').onclick = () => grid.click();
    host.querySelector('[data-action="add"]').onclick = () => {
      if (addStudent) addStudent.click();
      else if (importBtn) importBtn.click();
    };
    lastHost = host;
  };

  const escapeHtml = v => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  new MutationObserver(() => {
    if (lastHost && !document.body.contains(lastHost)) lastHost = null;
    add();
  }).observe(document.body, {childList:true, subtree:true});
  window.addEventListener('DOMContentLoaded', add);
})();