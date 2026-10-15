# ИП Девятова С.С. — новый сайт

Переделанный сайт официального партнёра СКБ Контур **ИП Девятова Светлана Сергеевна**.

*   Старый сайт: https://ipdss.ru
*   Новый сайт: https://system785.github.io/ipdss/
*   Репозиторий: https://github.com/system785/ipdss

## Структура

*   `index.html` — главная: первый блок с каруселью услуг и фото довольных предпринимателей (прокрутка в обе стороны)
*   `products.html` — каталог всех сервисов Контура
*   `about.html` — о компании, `contacts.html` — контакты и офисы
*   `news.html` — новости и акции, `privacy.html` — политика конфиденциальности
*   18 страниц продуктов: `ca.html`, `diadoc.html`, `elba.html`, `sverka-nds.html`, `ofd.html`, `market.html`, ...
*   `robots.txt`, `sitemap.xml` — SEO-файлы со ссылкой на адрес нового сайта
*   `assets/` — стили, скрипты, оригинальный логотип, иконки продуктов и фотографии

## SEO

Заголовки расмечены тегами `h1`/`h2`/`h3`, на каждой странице есть уникальные
`title`, `description`, canonical, Open Graph, микроразметка schema.org
(ProfessionalService, Product, FAQPage, BreadcrumbList), файлы robots и sitemap.

## Сборка

```bash
py -3 build.py
```

Генератор пересобирает все HTML-страницы, robots.txt и sitemap.xml.
