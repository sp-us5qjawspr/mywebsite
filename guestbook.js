/* SP/US5QJA — Radio Guestbook (GitHub Discussions #1 via giscus) */
(() => {
  'use strict';
  const start = () => {
    if (document.getElementById('radio-guestbook-button')) return;
    const buttons = [...document.querySelectorAll('button, input[type="button"], a')];
    const refresh = buttons.find(el => /обновить страницу/i.test((el.textContent || el.value || '').trim()));
    if (!refresh) { console.warn('Guestbook: refresh button not found'); return; }

    const css = document.createElement('style');
    css.textContent = `
      #radio-guestbook-button{margin-left:12px;padding:10px 16px;border:1px solid #27b4d6;border-radius:7px;background:#09658d;color:#fff;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
      #radio-guestbook-button:hover{background:#087da9}
      #radio-guestbook-panel{position:fixed;z-index:9999;top:100px;right:24px;width:min(720px,calc(100vw - 32px));max-height:calc(100vh - 120px);overflow:auto;box-sizing:border-box;padding:16px;background:#0a2039;border:1px solid #2b6384;border-radius:12px;box-shadow:0 14px 48px #0009;color:#e5f4ff}
      #radio-guestbook-panel[hidden]{display:none!important}
      #radio-guestbook-panel .rg-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
      #radio-guestbook-panel h2{font-size:20px;margin:0;color:#fff}
      #radio-guestbook-panel .rg-close{border:1px solid #47738d;border-radius:6px;background:#143a55;color:white;padding:6px 11px;cursor:pointer;font-size:20px}
      #radio-guestbook-panel .rg-note{font-size:13px;color:#b9d5e7;margin:0 0 16px}
      @media(max-width:700px){#radio-guestbook-button{margin:8px 0 0 0}#radio-guestbook-panel{top:12px;right:8px;width:calc(100vw - 16px);max-height:calc(100vh - 24px)}}
    `;
    document.head.appendChild(css);

    const btn = document.createElement('button');
    btn.id = 'radio-guestbook-button';
    btn.type = 'button';
    btn.textContent = '💬 Общение / Guestbook';
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-controls','radio-guestbook-panel');
    refresh.insertAdjacentElement('afterend', btn);

    const panel = document.createElement('section');
    panel.id = 'radio-guestbook-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label','Гостевая книга радиолюбителей');
    panel.innerHTML = '<div class="rg-header"><h2>📻 Общение / Radio Guestbook</h2><button class="rg-close" type="button" aria-label="Закрыть гостевую книгу">×</button></div><p class="rg-note">Добро пожаловать! Оставьте позывной, локатор и сообщение. Для отправки нужен аккаунт GitHub. 73!</p><div id="radio-guestbook-comments"></div>';
    document.body.appendChild(panel);

    let loaded = false;
    const close = () => {panel.hidden = true;btn.setAttribute('aria-expanded','false');};
    btn.addEventListener('click', () => {
      if (!panel.hidden) {close();return;}
      panel.hidden = false;
      btn.setAttribute('aria-expanded','true');
      const rect = btn.getBoundingClientRect();
      if (window.innerWidth > 700) panel.style.top = Math.max(8,Math.min(rect.bottom + 10,window.innerHeight - 180))+'px';
      if (!loaded) {
        loaded = true;
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        Object.entries({repo:'sp-us5qjawspr/mywebsite','repo-id':'R_kgDOVc2eVA',mapping:'number',term:'1','reactions-enabled':'1','emit-metadata':'0','input-position':'top',theme:'dark',lang:'ru'}).forEach(([k,v])=>script.setAttribute('data-'+k,v));
        script.setAttribute('crossorigin','anonymous');
        script.async = true;
        document.getElementById('radio-guestbook-comments').appendChild(script);
      }
    });
    panel.querySelector('.rg-close').addEventListener('click',close);
    document.addEventListener('keydown', e => {if(e.key === 'Escape' && !panel.hidden) close();});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
