# 34456.com — Research, Website Idea & Phase-wise Build Prompts

## 1. Research: the number "34456"

| Lens | Finding | Use on the site |
|---|---|---|
| **Commerce** | 34456 is used as a generic 5-digit part/catalogue code by electronics and industrial distributors (e.g. a clean-room document holder). No brand owns the number. | Neutral, brandable, no trademark conflict. |
| **Business** | Short numeric .com: easy to say on a call, hard to misspell, language-neutral. Reads naturally as **"34 456"**, digits nearly ascending (3-4-4-5-6) = "step-by-step growth". | Brand line: **34·456 — Money, by the numbers.** |
| **Economy** | **$34,456/yr = $16.57/hr** (2,080 h) = $662.62/wk, $1,325.23 bi-weekly, $2,871.33/mo. Sits in the entry-level/early-career pay band, ≈2.3× US federal minimum wage. 2026 US single filer: ~$1,955 federal tax + ~$2,636 FICA → ~$29,865 take-home. | Flagship programmatic page "$34,456 a year is how much an hour?" and the core salary-tool positioning. |
| **AI** | People increasingly ask AI assistants about pay; answers still need correct arithmetic + current tax rules. | Raise Script Builder outputs a ready-made AI-coach prompt; tools give verifiable numbers. |
| **People** | Behind the number: job seekers, hourly workers, freelancers deciding on offers, rent, loans. | Lead-gen "Free Pay Review", contests, careers. |
| **Math** | 34456 = 2³ × 59 × 73; 16 divisors; proper-divisor sum 32,144 (deficient); binary 1000011010011000; hex 0x8698; octal 103230; digit sum 22, root 4. | Number Lab tool + explainer guide. |

### Demand evidence
- "salary to hourly calculator" ≈ 40.5K monthly searches, "hourly to salary" ≈ 27K, "mortgage calculator" ≈ 3.35M (Semrush data on calcxml.com).
- Large sites (Talent.com, OysterLink, CalculateMe, SuperMoney) publish one page per salary amount ("$34,500 a year is how much an hour") — proven programmatic SEO pattern.
- Finance/insurance/loans/career keywords carry some of AdSense's highest CPCs.

## 2. Chosen idea (most usable + profitable)

**34456.com — Salary, Paycheck & Money Calculator Lab.** Free, private, instant calculators (salary↔hourly, take-home pay US+Canada 2026, loan/mortgage, compound interest, 50/30/20 budget, job-offer compare, freelance rate, raise script builder + AI prompt, number lab) + fact-checked guides + curated YouTube lessons.

Revenue stack: AdSense (high-CPC finance niche) → lead gen (Free Pay Review: sell opted-in leads to coaches, recruiters, tax pros, advisors) → sponsorships (calculator "presented by", guide series, contest prizes, video) → reader support → domain/site acquisition inquiries.

## 3. Benchmark sites studied (25)
Deep-fetched: calculator.net, smartasset.com, omnicalculator.com, talent.com, levels.fyi, bankrate.com, paycheckcity.com, investor.gov, gigacalculator.com.
Reviewed via search results/known structure: calculateme.com, oysterlink.com, supermoney.com, financer.com, ustax.tools, calcxml.com, everhour.com, britetodo.com, compoundladder.com, tax-calculator.us, paybrackets.com, pennycalc.com, fedratecalc.com, nerdwallet.com, careerbeacon.com, richify.ai.

Features adopted: instant results as you type; unadjusted vs adjusted (holidays/PTO) tables; per-period breakdown; tax "where your money goes" bar; marginal vs effective rate; amortization chart + schedule; rate-variance bands (investor.gov); share/copy buttons; programmatic amount URLs (`salary.html?amount=52000&per=year`) with nearby-amount links; formula callouts; FAQs with FAQPage schema; breadcrumbs; related tools; advisor-matching lead form (SmartAsset); negotiation services CTA (Levels.fyi); editorial trust signals + disclosures (Bankrate); state/country selector (Talent, PaycheckCity).

## 4. Phase-wise build prompts

**Phase 1 — Foundation & brand**
> Build a static, GitHub-Pages-ready site for 34456.com ("34·456 — Money, by the numbers"). Plain HTML/CSS/vanilla JS, no build step required to serve. Dark/light theme, Inter + Space Grotesk, violet→cyan gradient, sticky header, mobile burger nav, footer with tools/get-involved/company/legal columns. On top of every page show: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" linking to https://web.works/contact. Add the AdSense script (ca-pub-6620975821265271) in every `<head>`, `ads.txt`, `robots.txt`, `sitemap.xml`, manifest, favicon, OG image, canonical + Open Graph + JSON-LD (WebSite, Organization, BreadcrumbList).

**Phase 2 — Calculator engine**
> Write `calc.js` with pure, tested functions: salary conversion across 8 pay periods with holiday/vacation adjustment; 2026 US federal tax (IRS Rev. Proc. 2025-32 brackets for single/MFJ/HoH, standard deduction, SS 6.2% to $184,500, Medicare 1.45% + 0.9%), optional state %; 2026 Canada federal tax (14/20.5/26/29/33%, BPA $16,452, CPP 5.95% $3,500–$74,600, CPP2 4% to $85,000, EI 1.63% to $68,900) + provincial %; loan amortization with extra payments; compound growth with frequency + variance; number facts. Add canvas line charts and stacked bars. Verify with Node.

**Phase 3 — Tool pages**
> Create 9 tool pages (salary, take-home, loan, compound, budget, offer compare, freelance rate, raise script builder with AI-coach prompt, number lab). Each: H1, lead, input card, live results card, ad slot, long-form explanation with the formula, worked example, FAQ + FAQPage schema, related lead CTA. Salary page reads `?amount=&per=` to become a programmatic "$X a year is how much an hour?" page.

**Phase 4 — Content for AdSense approval**
> Write 6+ original, fact-checked guides (the number 34456; salary vs hourly; 2026 paycheck taxes; how to ask for a raise; 50/30/20 budget; Rule of 72) with Article schema, author/update line, related tools and disclaimers. Add About, Contact, Privacy (with Google advertising-cookie language and opt-out links), Terms, Disclaimer with trademark/copyright disclosure, cookie notice, 404.

**Phase 5 — Monetization & conversion**
> Add a 3-step lead form "Free Pay Review" (goal → situation → contact, consent + optional partner-intro opt-in), Support page (4 allocation buckets: operations, promotion, hiring talent, contests & prizes; tiers; pledge form; optional PayPal/Stripe/BMC links via config), Contests page (monthly 34456 Challenge with entry form + official rules: no purchase necessary, 18+, void where prohibited), Careers page (6 roles + application), Advertise page (sponsorship, lead partners, domain acquisition). Video library with privacy-enhanced lite YouTube embeds.

**Phase 6 — Forms with hidden inbox**
> Route every form to one inbox via FormSubmit AJAX; assemble the address at runtime in JS so it never appears in HTML, text or links. Honeypot spam trap, validation, success/failure messages, mailto fallback that also never prints the address.

**Phase 7 — QA, deploy, grow**
> Headless-browser test every page (no JS errors, calculators produce correct values, mobile 390px layout), check broken links, confirm the inbox string is absent from all files. Push to GitHub WEBWORKSA1/34456-com (main), enable Pages (main / root), add custom domain 34456.com + HTTPS, submit sitemap to Search Console, then apply to AdSense and enable Google's certified CMP for EEA/UK traffic.

## 5. Expansion roadmap
State-by-state take-home pages (50 + DC) and province pages; hourly-wage pages ($10–$100); cost-of-living "is $X enough in [city]"; tax-refund estimator; debt-payoff (snowball/avalanche); retirement/401(k); currency salary converter; newsletter; embeddable calculator widgets for backlinks; Spanish/French versions.
