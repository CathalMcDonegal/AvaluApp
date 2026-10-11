(()=>{
  let deferredInstallPrompt=null;
  let installBanner=null;
  let statusTimer=null;

  const isInstalled=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

  const hide=()=>{if(installBanner) installBanner.classList.remove('show');};
  const show=()=>{if(!installBanner||isInstalled()) return; installBanner.classList.add('show');};

  const status=(text,ms=4500)=>{
    let el=document.querySelector('#pwa-install-status');
    if(!el){
      el=document.createElement('div');
      el.id='pwa-install-status';
      el.style.cssText='position:fixed;left:12px;right:12px;bottom:150px;z-index:10002;background:#111827;color:#fff;padding:14px 16px;border-radius:14px;text-align:center;font:700 14px system-ui;box-shadow:0 12px 30px #0007';
      document.body.appendChild(el);
    }
    el.textContent=text;
    clearTimeout(statusTimer);
    statusTimer=setTimeout(()=>el.remove(),ms);
  };

  const init=()=>{
    installBanner=document.querySelector('#install-banner');
    if(!installBanner||isInstalled()) return;

    const doInstall=document.querySelector('#btn-do-install');
    const dismiss=document.querySelector('#btn-dismiss-install');

    doInstall?.addEventListener('click',async()=>{
      if(deferredInstallPrompt){
        const prompt=deferredInstallPrompt;
        deferredInstallPrompt=null;
        try{
          prompt.prompt();
          const choice=await prompt.userChoice;
          if(choice?.outcome==='accepted') status('Instal·lant AvaluApp…',2500);
        }catch{}
        hide();
        return;
      }
      status('Chrome encara no ha ofert la instal·lació directa. Toca ⋮ → Afegeix a la pantalla d’inici.',5500);
    });

    dismiss?.addEventListener('click',()=>{
      hide();
      try{sessionStorage.setItem('avaluapp-install-dismissed','1')}catch{}
    });

    try{
      if(!sessionStorage.getItem('avaluapp-install-dismissed')){
        setTimeout(()=>show(),2500);
      }
    }catch{setTimeout(()=>show(),2500)}
  };

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredInstallPrompt=e;
    show();
  });

  window.addEventListener('appinstalled',()=>{
    deferredInstallPrompt=null;
    hide();
    status('AvaluApp instal·lada!',2500);
  });

  window.addEventListener('DOMContentLoaded',init);
})();
