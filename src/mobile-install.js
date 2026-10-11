(() => {
  let deferredPrompt = null;
  let button = null;

  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isMobile = () => window.matchMedia('(max-width: 650px)').matches;

  function removeButton() {
    if (button) button.remove();
    button = null;
  }

  function createButton() {
    if (!isMobile() || isInstalled() || button) return;

    button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-install-button';
    button.innerHTML = '📲 <span>Instal·la AvaluApp</span>';
    button.title = 'Instal·la AvaluApp al mòbil';
    button.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        removeButton();
        return;
      }

      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (ios) {
        alert('Per instal·lar AvaluApp: toca Compartir → Afegir a la pantalla d’inici.');
      } else {
        alert('Obre el menú ⋮ del navegador i tria «Instal·la AvaluApp» o «Afegir a la pantalla d’inici».');
      }
    });
    document.body.appendChild(button);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    createButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    removeButton();
  });

  window.addEventListener('DOMContentLoaded', createButton);
  window.addEventListener('resize', () => {
    if (isInstalled() || !isMobile()) removeButton();
    else createButton();
  });
})();
