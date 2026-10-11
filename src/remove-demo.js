(()=>{
 const remove=()=>document.querySelector('#demo')?.remove();
 window.addEventListener('DOMContentLoaded',remove);
 new MutationObserver(remove).observe(document.body,{childList:true,subtree:true});
})();