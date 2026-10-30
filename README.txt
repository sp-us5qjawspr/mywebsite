SP/US5QJA — смена адреса сайта (без замены карты, графиков и данных)

Новый адрес: https://sp-us5qjawspr.github.io/mywebsite/

1. Загрузите в корень репозитория mywebsite два файла:
   site-links.js
   qr-site.png
2. Откройте index.html в редакторе GitHub и ДОБАВЬТЕ перед </body> строку:
   <script src="site-links.js?v=1" defer></script>
3. Commit changes; дождитесь публикации и нажмите Ctrl+Shift+R.

Важно: НЕ заменяйте существующие app.js, style.css, update.py и workflow.
Скрипт исправляет ссылки, кнопку Поделиться и адрес счетчика просмотров.
Счетчик по новому адресу может начать отсчет отдельно от старого.
