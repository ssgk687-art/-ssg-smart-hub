# SSG SMART HUB — repaired static web app

## Files to publish together in the existing GitHub repository
- `index.html` — website layout, styles, navigation, tool panels and metadata.
- `assets/app.js` — browser-side functionality for the eight tool categories.
- `site.webmanifest` — install metadata and launcher icons.
- `icons/icon-192.png`, `icons/icon-512.png` — PWA / Apple touch icons.
- `sw.js` — same-origin app-shell caching for basic offline shell access.
- `_headers` — Cloudflare Pages security headers and CSP.
- `robots.txt` — allows search engines to crawl public pages.

## Included functionality
- Image: resize, compress, convert, crop, manual erase/restore background editor, undo/redo, replacement color/image, PNG/JPG export.
- PDF: inspect metadata, merge up to 10 files / 80 MB / 500 pages, extract selected pages, open/print.
- Text: word/character/sentence counts, case conversion, clean spaces, copy and TXT download.
- QR: generate and download PNG.
- Color: HEX/RGB/HSL conversion.
- Creator: local template-based captions and hashtags (not AI).
- Web utilities: unit conversion, date calculations, reverse/sort/deduplicate text.
- Learning Center, About, Contact, Privacy, Terms, Disclaimer and Cookie Policy pages.
- English, Urdu and Hindi interface translations. Translation is dictionary-based; browser-generated content and some technical output remain in the language of the tool.

## Privacy and costs
- No accounts, database, analytics, advertising, paid API, server-side file upload or backend are included.
- Image and PDF files are processed in the visitor's browser.
- PDF-Lib and QRCode.js are loaded from pinned public cdnjs URLs; those two tools require internet access.
- The service worker caches only the same-origin app shell. PDF and QR libraries are not cached for offline use.
- No third-party analytics or AdSense is active in this build.

## Deploy
Publish the complete folder structure at the repository root using Cloudflare Pages. Do not upload only `index.html`; the referenced assets, manifest, icons, service worker and `_headers` are part of this build.

## Launch items requiring the site owner / final domain
- Add the final HTTPS canonical URL, `og:url`, and a domain-specific `sitemap.xml` after the domain is selected.
- Add and verify a monitored support email address.
- Review privacy, cookie and terms text against the actual final hosting, analytics and advertising setup and applicable local requirements.
- Add analytics / AdSense only after the owner chooses and configures the services and required disclosures/consent.
- Complete live tests on the deployed domain, including mobile devices and CDN-dependent PDF/QR tools.

This package has not been deployed to the user's GitHub or Cloudflare account. Browser test results and remaining launch checks are documented in `AUDIT-REPORT.md`.
