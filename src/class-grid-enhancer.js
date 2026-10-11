(() => {
  let mounted=null;
  const enhance=()=>{
    const grid=document.querySelector('#grid');
    if(!grid||mounted===grid)return;
    mounted=grid;
    const host=grid.closest('.class-grid-card')||grid.parentElement;
    if(!host)return;
    const toolbar=document.createElement('div');toolbar.className='grid-toolbar';
    toolbar.innerHTML='<div class="grid-filter"><button class="grid-filter-btn active" data-filter="all">Tots</button><button class="grid-filter-btn" data-filter="pending">Pendents</button><button class="grid-filter-btn" data-filter="complete">Complets</button></div><label class="grid-search">🔎 <input type="search" placeholder="Buscar alumne…"></label>';
    host.parentElement.insertBefore(toolbar,host);
    const apply=()=>{
      const q=toolbar.querySelector('input').value.trim().toLowerCase();
      const filter=toolbar.querySelector('.grid-filter-btn.active')?.dataset.filter||'all';
      [...grid.querySelectorAll('tbody tr')].forEach(row=>{
        const text=row.textContent.toLowerCase();
        const selects=[...row.querySelectorAll('select')];
        const values=selects.map(s=>String(s.value||'').toUpperCase());
        const hasMissing=values.some(v=>!v||v==='—');
        const visibleName=!q||text.includes(q);
        const visibleFilter=filter==='all'||(filter==='pending'&&hasMissing)||(filter==='complete'&&!hasMissing);
        row.hidden=!(visibleName&&visibleFilter);
      });
    };
    toolbar.querySelector('input').addEventListener('input',apply);
    toolbar.querySelectorAll('.grid-filter-btn').forEach(b=>b.addEventListener('click',()=>{toolbar.querySelectorAll('.grid-filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');apply()}));
    const colorize=()=>grid.querySelectorAll('select').forEach(s=>{const v=String(s.value||'').toUpperCase().replace(/[()*]/g,'');s.dataset.grade=v;s.classList.toggle('grid-grade-empty',!v||v==='—')});
    grid.addEventListener('change',()=>{colorize();apply()});
    colorize();apply();
  };
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',enhance);
})();