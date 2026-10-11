(()=>{
 const KEY='avaluapp-data-v1';
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
 const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
 const render=()=>{
  document.querySelectorAll('.course-card').forEach(card=>{
   if(card.querySelector('.delete-course'))return;
   const id=card.dataset.id;if(!id)return;
   const b=document.createElement('button');b.type='button';b.className='danger icon-delete delete-course';b.title='Esborrar curs';b.setAttribute('aria-label','Esborrar curs');b.textContent='🗑';
   b.style.cssText='margin-left:auto;flex:0 0 auto;position:relative;z-index:3';
   b.onclick=e=>{e.preventDefault();e.stopPropagation();const d=read(),c=(d.courses||[]).find(x=>x.id===id);if(!c)return;if(confirm('Esborrar el curs «'+c.name+'» i totes les seves classes, alumnes i avaluacions? Aquesta acció no es pot desfer.')){d.courses=(d.courses||[]).filter(x=>x.id!==id);save(d);location.reload()}};
   card.appendChild(b);
  });
 };
 new MutationObserver(render).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('DOMContentLoaded',render);render();
})();