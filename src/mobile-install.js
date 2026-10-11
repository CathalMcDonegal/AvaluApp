(()=>{
  let deferredPrompt=null;
  let banner=null;
  let statusTimer=null;

  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

  const remove=()=>{
    if(banner) banner.remove();
    banner=null;
    if(statusTimer) clearTimeout(statusTimer);
  };

  const status=(text,ms=3500)=>{
    let el=document.querySelector('#pwa-install-status');
    if(!el){
      el=document.createElement('div');
      el.id='pwa-install-status';
      el.style.cssText='position:fixed;left:16px;right:16px;bottom:88px;z-index:10001;background:#0f172a;color:#fff;padding:14px 16px;border-radius:14px;text-align:center;font:700 14px system-ui;box-shadow:0 12px 30px #0005';
      document.body.appendChild(el);
    }
    el.textContent=text;
    clearTimeout(statusTimer);
    statusTimer=setTimeout(()=>el.remove(),ms);
  };

  const create=()=>{
    if(installed()||banner||!document.body) return;
    banner=document.createElement('div');
    banner.className='pwa-install-banner';
    banner.innerHTML='<div class="pwa-install-copy">📲 Instal·la <strong>AvaluApp</strong> a la pantalla d’inici per utilitzar-la com una app.</div><div class="pwa-install-actions"><button type="button" class="pwa-install-do">Instal·lar</button><button type="button" class="pwa-install-dismiss">Ara no</button></div>';
    document.body.appendChild(banner);

    banner.querySelector('.pwa-install-do').addEventListener('click',async()=>{
      if(deferredPrompt){
        const promptEvent=deferredPrompt;
        deferredPrompt=null;
        try{
          promptEvent.prompt();
          const choice=await promptEvent.userChoice;
          if(choice?.outcome==='accepted') status('Instal·lant AvaluApp…',2500);
        }catch{}
        remove();
        return;
      }
      status('Chrome no ha ofert encara la instal·lació directa. Si AvaluApp és oberta en Chrome, toca ⋮ → Afegeix a la pantalla d’inici.',5000);
    });

    banner.querySelector('.pwa-install-dismiss').addEventListener('click',()=>{
      try{sessionStorage.setItem('avaluapp-install-dismissed','1')}catch{}
      remove();
    });
  };

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    create();
  });

  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    status('AvaluApp instal·lada!',2500);
    remove();
  });

  window.addEventListener('DOMContentLoaded',()=>{
    if(installed()) return;
    try{if(sessionStorage.getItem('avaluapp-install-dismissed')) return}catch{}
    create();
  });
})();
