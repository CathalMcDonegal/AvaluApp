(() => {
  const KEY='avaluapp-data-v1';
  let active=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const findStudent=()=>{
    const data=read(),h=document.querySelector('.student-head h1'); if(!h)return null;
    const name=(h.textContent||'').trim().toLowerCase();
    for(const c of data.courses||[])for(const g of c.groups||[])for(const s of g.students||[]){
      if(`${s.firstName||''} ${s.lastName||''}`.trim().toLowerCase()===name)return {c,g,s};
    } return null;
  };
  const stats=(s,t)=>{
    const vals=s.assessments?.[t]||{},all=Object.values(vals).map(v=>String(v?.value||'').toUpperCase()).filter(Boolean);
    return {done:all.length,final:s.finalGrades?.[t]||'',aa:s.aaPi?.[t]||'',obs:(s.observations?.[t]||'').trim()};
  };
  const label=v=>({AE:'Assoliment excel·lent',AN:'Assoliment notable',AS:'Assoliment satisfactori',NA:'No assoliment'})[String(v||'').toUpperCase()]||'Pendent';
  const add=()=>{
    if(document.querySelector('.student-profile-summary'))return;
    const info=findStudent();if(!info)return; const {c,g,s}=info;
    const current=document.querySelector('.tabs button.active')?.textContent||'1a Avaluació',t=current.includes('2a')?'2':'1',a=stats(s,1),b=stats(s,2),cur=t==='2'?b:a;
    const evolution=a.final&&b.final ? `${a.final} → ${b.final}` : (b.final||a.final||'—');
    const box=document.createElement('section');box.className='student-profile-summary';
    box.innerHTML=`<div class="profile-summary-head"><div><p class="eyebrow">FITXA DE L’ALUMNE</p><h2>Visió general</h2><p class="muted">${esc(c.name)} · ${esc(g.name)}</p></div><div class="profile-final"><span>FINAL actual</span><strong>${esc(b.final||a.final||'—')}</strong></div></div><div class="profile-summary-grid"><article><span>📘</span><div><strong>1a Avaluació</strong><small>${a.done} ítems valorats · ${esc(a.final||'Sense final')}</small><b>${esc(label(a.final||''))}</b></div></article><article><span>📗</span><div><strong>2a Avaluació</strong><small>${b.done} ítems valorats · ${esc(b.final||'Sense final')}</small><b>${esc(label(b.final||''))}</b></div></article><article><span>📈</span><div><strong>Evolució</strong><small>1a → 2a Avaluació</small><b>${esc(evolution)}</b></div></article><article><span>🎯</span><div><strong>AA / PI</strong><small>Valoració actual</small><b>${esc(cur.aa||'—')}</b></div></article></div><div class="profile-observations"><div><strong>📝 Observacions</strong><p>${esc(cur.obs||'Encara no hi ha observacions.')}</p></div><button class="secondary profile-word" type="button">📄 Generar informe Word</button></div>`;
    const assessment=document.querySelector('.assessment'); if(assessment)assessment.parentElement.insertBefore(box,assessment);
    box.querySelector('.profile-word')?.addEventListener('click',()=>document.querySelector('#word')?.click()); active=box;
  };
  new MutationObserver(()=>{if(active&&!document.body.contains(active))active=null;add()}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',add);
})();
