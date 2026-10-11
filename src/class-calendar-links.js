(() => {
  const addLinks = () => {
    document.querySelectorAll('.group-card').forEach(card => {
      if (card.querySelector('.class-calendar-link')) return;
      const open = card.querySelector('.open[data-id]');
      if (!open) return;
      const a = document.createElement('a');
      a.className = 'secondary class-calendar-link';
      a.href = './calendar.html?group=' + encodeURIComponent(open.dataset.id);
      a.textContent = '📅 Calendari';
      a.title = 'Calendari d’aquesta classe';
      a.addEventListener('click', e => e.stopPropagation());
      open.parentElement.insertBefore(a, open.nextSibling);
    });
  };
  new MutationObserver(addLinks).observe(document.body, {childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded', addLinks);
})();