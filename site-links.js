/* Update only site URLs after GitHub username change. Existing map and WSPR scripts are untouched. */
(() => {
  const url = 'https://sp-us5qjawspr.github.io/mywebsite/';
  const apply = () => {
    const link = document.getElementById('siteLink');
    if (link) link.value = url;
    const badge = document.querySelector('img.hits-counter');
    if (badge) badge.src = 'https://hits.sh/sp-us5qjawspr.github.io/mywebsite.svg?label=%D0%9F%D1%80%D0%BE%D1%81%D0%BC%D0%BE%D1%82%D1%80%D1%8B&color=19b99f&labelColor=17334a';
    const qr = document.querySelector('.qr-card img');
    if (qr) qr.src = 'qr-site.png';
    // Existing sharing handlers are installed by app.js. Register capture-phase
    // handlers to prevent them from sharing the old URL.
    const copy = document.getElementById('copySiteLink');
    if (copy) copy.addEventListener('click', async event => {
      event.stopImmediatePropagation();
      const notice = document.getElementById('shareNotice');
      try { await navigator.clipboard.writeText(url); if(notice) notice.textContent='Новая ссылка скопирована!'; }
      catch (_) { if(link) {link.focus(); link.select();} if(notice) notice.textContent='Нажми Ctrl+C, чтобы скопировать ссылку.'; }
    }, true);
    const share = document.getElementById('shareSiteLink');
    if (share) share.addEventListener('click', async event => {
      event.stopImmediatePropagation();
      const notice = document.getElementById('shareNotice');
      if(navigator.share) {
        try { await navigator.share({title:'SP/US5QJA WSPR Monitor', url}); }
        catch(e) { if(e.name!=='AbortError' && notice) notice.textContent='Используй кнопку «Копировать».'; }
      } else if(copy) copy.click();
    }, true);
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
