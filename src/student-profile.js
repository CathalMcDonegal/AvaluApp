(() => {
  const STORE_KEY='avaluapp-data-v1';
  let last=null;
  const esc=v=>String(v||'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
  const findStudent=()=>{
    const data=read();
    const h=document.querySelector('.student-head h1');
    if(!h)return null;
    const name=h.textContent.trim().toLowerCase();
    for(const c of data.courses||[])for(const g of c.groups||[])for(const s of g.students||[]){
      if(`${s.firstName||''} ${s.lastName||''}`.trim().toLowerCase()===name)return {c,g,s};
    }
    return null;
  };
  const gradeCount=(s,term)=>{
    const vals=s.assessments?.[term]||{};
    const a=Object.values(vals).map(v=>String(v?.value||'').toUpperCase()).filter(Boolean);
    return {done:a.length,total:Math.max(a.length,1)};
  };
  const add=()=>{
    if(document.querySelector('.student-profile-summary'))return;
    const info=findStudent(); if(!info)return;
    const {s}=info;
    const current=document.querySelector('.tabs button.active')?.textContent||'1a Avaluació';
    const term=current.includes('2a')?'2':'1';
    const prev=term==='2'?'1':null;
    const done=gradeCount(s,term), prevDone=prev?gradeCount(s,prev):null;
    const final=s.finalGrades?.[term]||'—';
    const aa=s.aaPi?.[term]||'—';
    const obs=(s.observations?.[term]||'').trim();
    const box=document.createElement('section');box.className='student-profile-summary';
    box.innerHTML=`<div class="profile-summary-title"><div><p class="eyebrow">RESUM DE L’AVALUACIÓ</p><h2>Visió ràpida</h2></div><span class="profile-term">${term==='2'?'2a':'1a'} Avaluació</span></div><div class="profile-summary-grid"><div class="profile-stat"><span>📊 Ítems valorats</span><strong>${done.done}</strong><small>de ${done.total}</small></div><div class="profile-stat"><span>🏁 Nota final</span><strong>${esc(final)}</strong><small>valoració manual</small></div><div class="profile-stat"><span>📌 AA/PI</span><strong>${esc(aa)}</strong><small>${aa==='X'?'marcat':'sense marca'}</small></div><div class="profile-stat"><span>📝 Observacions</span><strong>${obs?'Sí':'—'}</strong><small>${obs?'Hi ha anotacions':'Cap observació'}</small></div></div>${prev?`<div class="profile-evolution"><strong>↗ Evolució</strong><span>1a: ${prevDone.done} ítems valorats · 2a: ${done.done} ítems valorats</span></div>`:''}`;
    const head=document.querySelector('.student-head');head.insertAdjacentElement('afterend',box);last=box;
  };
  new MutationObserver(()=>{if(last&&!document.body.contains(last))last=null;add()}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',add);
})();
