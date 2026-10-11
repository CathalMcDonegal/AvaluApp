(()=>{
  let deferredPrompt=null,button=null;
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const remove=()=>{if(button)button.remove();button=null};
  const create=()=>{
    if(installed()||button)return;
    button=document.createElement('button');button.type='button';button.className='pwa-install';button.innerHTML='📲 Instal·la AvaluApp';button.title='Instal·la AvaluApp';
    button.onclick=async()=>{
      if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;remove();return}
      const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(ios?'Per instal·lar AvaluApp: toca Compartir → Afegir a la pantalla d’inici.':'Si el navegador no mostra directament la instal·lació, obre el menú ⋮ i tria «Instal·la aplicació» o «Afegir a la pantalla d’inici».');
    };
    document.body.appendChild(button);
  };
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;create()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;remove()});
  window.addEventListener('DOMContentLoaded',()=>setTimeout(create,500));
})();