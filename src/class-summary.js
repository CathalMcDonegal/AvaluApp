(() => {
  const STORE_KEY='avaluapp-data-v1';
  let mounted=null;
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  const findGroup=()=>{
    const data=read();
    const rows=[...document.querySelectorAll('.student-row')];
    const names=rows.map(r=>norm(r.textContent.replace(/🗑/g,''))).filter(Boolean);
    for(const c of data.courses||[]) for(const g of c.groups||[]){
      const gn=(g.students||[]).map(s=>norm(`${s.firstName||''} ${s.lastName||''}`));
      if(names.length&&gn.some(n=>names.includes(n)))return {c,g};
      const title=norm([...document.querySelectorAll('h1,h2')].map(x=>x.textContent).find(t=>t&&g.name&&norm(t)===norm(g.name))||'');
      if(title)return {c,g};
    }
    return null;
  };
  const label=v=>({AE:'AE',AN:'AN',AS:'AS',NA:'NA'}[String(v||'').toUpperCase()]||'—');
  const stats=(s,t)=>{const a=s?.assessments?.[t]||{};const vals=Object.values(a).map(x=>String(x?.value||'').toUpperCase()).filter(Boolean);const counts={AE:0,AN:0,AS:0,NA:0};vals.forEach(v=>{if(counts[v]!=null)counts[v]++});return {done:vals.length,final:s?.finalGrades?.[t]||'',aa:s?.aaPi?.[t]||'',obs:s?.observations?.[t]||'',counts};};
  const add=()=>{
    if(mounted&&document.body.contains(mounted))return;
    const info=findGroup(); if(!info)return;
    const {c,g}=info; const students=g.students||[];
    const rows=students.map((s,i)=>{
      const a=stats(s,1),b=stats(s,2); const ev=a.final&&b.final?`${label(a.final)} → ${label(b.final)}`:(b.final?label(b.final):(a.final?label(a.final):'—'));
      const obs=a.obs||b.obs?'📝':'';
      return `<tr><td class="summary-name"><button class="summary-student" data-name="${esc(`${s.firstName||''} ${s.lastName||''}`)}">${esc(`${s.firstName||''} ${s.lastName||''}`)}</button></td><td>${label(a.final)}</td><td>${label(b.final)}</td><td><strong>${ev}</strong></td><td>${a.aa||b.aa?'✓':'—'}</td><td>${obs}</td></tr>`;
    }).join('');
    const complete=students.filter(s=>stats(s,2).final).length;
    const host=document.createElement('section');host.className='class-summary-panel';host.innerHTML=`<div class="summary-panel-head"><div><p class="eyebrow">VISIÓ GLOBAL</p><h2>Resum de la classe</h2><p class="muted">Consulta ràpidament l’evolució de tot el grup.</p></div><div class="summary-progress"><strong>${complete}/${students.length}</strong><span>amb nota final 2a</span></div></div><div class="summary-table-wrap"><table class="class-summary-table"><thead><tr><th>Alumne</th><th>1a</th><th>2a</th><th>Evolució</th><th>AA/PI</th><th>Obs.</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No hi ha alumnes.</td></tr>'}</tbody></table></div>`;
    const list=document.querySelector('.student-list'); if(!list)return;
    list.parentElement.insertBefore(host,list); mounted=host;
    host.querySelectorAll('.summary-student').forEach(btn=>btn.onclick=()=>{const target=[...document.querySelectorAll('.student-row')].find(r=>norm(r.textContent.replace(/🗑/g,''))===norm(btn.dataset.name));target?.scrollIntoView({behavior:'smooth',block:'center'});target?.querySelector('button, a')?.focus?.();});
  };
  new MutationObserver(()=>add()).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',add);
})();