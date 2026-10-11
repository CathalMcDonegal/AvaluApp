(()=>{
 let deferredPrompt=null,button=null;
 const installed=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
 const remove=()=>{if(button)button.remove();button=null};
 const showHelp=()=>{
  if(document.querySelector('.pwa-install-help'))return;
  const box=document.createElement('div');box.className='pwa-install-help';box.innerHTML='<div style="position:fixed;inset:0;background:#0f172a99;z-index:10001;display:grid;place-items:center;padding:20px"><div style="max-width:420px;background:#fff;border-radius:20px;padding:24px;box-shadow:0 20px 60px #0005;font-family:system-ui;color:#172033"><h2 style="margin-top:0">Instal·lar AvaluApp</h2><p>El navegador que tens o la finestra on has obert AvaluApp no està oferint la instal·lació directa.</p><p><strong>Si estàs a Chrome d’Android:</strong> obre aquesta pàgina directament amb Chrome i torna a prémer ⬇️. Quan Chrome ofereixi la instal·lació, s’obrirà automàticament.</p><button type="button" id="close-pwa-help" style="width:100%;padding:12px;border:0;border-radius:12px;background:#0f172a;color:white;font-weight:800">Tancar</button></div></div>';
  document.body.appendChild(box);box.querySelector('#close-pwa-help').onclick=()=>box.remove();
 };
 const create=()=>{
  if(installed()||button)return;
  button=document.createElement('button');button.type='button';button.className='pwa-install';button.innerHTML='⬇️';button.title='Instal·lar AvaluApp';button.setAttribute('aria-label','Instal·lar AvaluApp');
  button.onclick=async()=>{
   if(deferredPrompt){const promptEvent=deferredPrompt;deferredPrompt=null;promptEvent.prompt();try{await promptEvent.userChoice}catch{};remove();return}
   showHelp();
  };
  document.body.appendChild(button);
 };
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;create()});
 window.addEventListener('appinstalled',()=>{deferredPrompt=null;remove()});
 window.addEventListener('DOMContentLoaded',()=>{if(installed())remove();else create()});
})();