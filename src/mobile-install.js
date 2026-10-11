(()=>{
  let deferredPrompt=null,button=null;
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const remove=()=>{if(button)button.remove();button=null};
  const create=()=>{
    if(installed()||button||!deferredPrompt)return;
    button=document.createElement('button');button.type='button';button.className='pwa-install';button.innerHTML='⬇️';button.title='Instal·lar AvaluApp';button.setAttribute('aria-label','Instal·lar AvaluApp');
    button.onclick=async()=>{
      if(!deferredPrompt)return;
      const promptEvent=deferredPrompt;deferredPrompt=null;
      promptEvent.prompt();
      try{await promptEvent.userChoice}catch{}
      remove();
    };
    document.body.appendChild(button);
  };
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;create()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;remove()});
  window.addEventListener('DOMContentLoaded',()=>{if(installed())remove()});
})();