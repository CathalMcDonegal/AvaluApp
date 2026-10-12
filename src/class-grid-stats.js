(() => {
  let mounted=null;
  const enhance=()=>{
    const grid=document.querySelector('#grid');
    if(!grid||mounted===grid)return;
    mounted=grid;
    const host=grid.closest('.class-grid-card')||grid.parentElement;
    if(!host)return;
    const table=grid.querySelector('table')||grid;
    const rows=()=>[...table.querySelectorAll('tbody tr')].filter(r=>!r.hidden);
    const criteria=(r)=>{const s=[...r.querySelectorAll('select')];return s.length>=3?s.slice(1,-1):s};
    const panel=document.createElement('div');panel.className='grid-stats-panel';
    panel.innerHTML='<div class="grid-stat"><strong class="gs-total">0</strong><span>Alumnes</span></div><div class="grid-stat complete"><strong class="gs-complete">0</strong><span>Complets</span></div><div class="grid-stat pending"><strong class="gs-pending">0</strong><span>Pendents</span></div><div class="grid-stat ae"><strong class="gs-ae">0</strong><span>AE</span></div><div class="grid-stat an"><strong class="gs-an">0</strong><span>AN</span></div><div class="grid-stat as"><strong class="gs-as">0</strong><span>AS</span></div><div class="grid-stat na"><strong class="gs-na">0</strong><span>NA</span></div>';
    host.parentElement.insertBefore(panel,host);
    const update=()=>{
      const rs=rows();let complete=0,ae=0,an=0,as=0,na=0;
      rs.forEach(r=>{
        const vals=criteria(r).map(s=>String(s.value||'').toUpperCase().trim());
        const missing=vals.length===0||vals.some(v=>!v||v==='—');
        if(!missing)complete++;
        vals.forEach(v=>{const g=v.replace(/[()*]/g,'');if(g==='AE')ae++;if(g==='AN')an++;if(g==='AS')as++;if(g==='NA')na++});
      });
      panel.querySelector('.gs-total').textContent=rs.length;
      panel.querySelector('.gs-complete').textContent=complete;
      panel.querySelector('.gs-pending').textContent=rs.length-complete;
      panel.querySelector('.gs-ae').textContent=ae;
      panel.querySelector('.gs-an').textContent=an;
      panel.querySelector('.gs-as').textContent=as;
      panel.querySelector('.gs-na').textContent=na;
    };
    grid.addEventListener('change',update);
    new MutationObserver(update).observe(grid,{childList:true,subtree:true,attributes:true});
    update();
  };
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',enhance);
})();