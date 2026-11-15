# 34456.com — Money, by the numbers

Free salary, take-home pay, loan, compound-interest and budget calculators, guides, videos, lead generation, contests, careers and sponsorship pages. Static HTML/CSS/JS — runs on GitHub Pages free plan (main branch, root).

## Deploy
1. Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.
2. Custom domain: enter `34456.com`, then at your registrar add A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Tick **Enforce HTTPS**.
3. Submit `https://34456.com/sitemap.xml` in Google Search Console, then apply in AdSense (ads.txt is included).
4. In AdSense → Privacy & messaging, enable the Google-certified consent message for EEA/UK/Switzerland.

## Forms
All forms post to one inbox through FormSubmit. The address is assembled at runtime in `assets/js/app.js` and never appears in page source text or links. The **first** submission triggers a one-time FormSubmit activation email — click it once.

## Optional instant payments
Add PayPal / Stripe / Buy Me a Coffee links in `SITE.pay` at the top of `assets/js/app.js`; buttons appear on `support.html` automatically.

## Structure
- `index.html`, `salary.html` (programmatic: `salary.html?amount=52000&per=year`)
- `tools/` — 9 calculators · `guides/` — 6 articles
- `get-matched.html` (lead gen), `support.html`, `contests.html`, `careers.html`, `advertise.html`, `videos.html`
- `about`, `contact`, `privacy`, `terms`, `disclaimer` (trademark & copyright), `404`, `thanks`
- `docs/RESEARCH-AND-PROMPTS.md` — research, idea and phase-wise build prompts

## Trademark & copyright
"34456" is used only as a descriptive domain name; no trademark rights are claimed in the number. See `disclaimer.html`.
