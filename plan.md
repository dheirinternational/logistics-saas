# DHEIR International — Customer Experience Plan

**Version:** 1.0  
**Status:** Build blueprint for landing, ecommerce surfaces, and customer portal (`/base/*`). Admin excluded.  
**Authority:** Extends [`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md). Where this doc conflicts, `VISUAL_IDENTITY.md` wins on tokens and anti-patterns; this doc wins on information architecture and template synthesis.

**References:**
- **Mood:** [inklin.space](https://inklin.space/) (calm, blur-resolve, light premium)
- **Competitors:** [GIG China→Nigeria](https://giglogistics.com/shipping-from-china-to-nigeria-ghana/), [Uhutex](https://www.uhutex.com/), [YY Cargo](https://yycargonigeria.com/), [G-Line](https://www.g-linelogistics.com/), [Nicargo](https://nicargoltd.com/)
- **Template boards:** Logistics + ecommerce Pinterest selections (May 2026) — structure only, recolored and retyped to DHEIR tokens

---

## Table of contents

1. [North star](#1-north-star)
2. [Product story on one page](#2-product-story-on-one-page)
3. [Architecture: public vs authenticated](#3-architecture-public-vs-authenticated)
4. [Template synthesis map](#4-template-synthesis-map)
5. [Global design system (customer)](#5-global-design-system-customer)
6. [Motion, scroll, and atmosphere](#6-motion-scroll-and-atmosphere)
7. [Public landing `/`](#7-public-landing-)
8. [Public ecommerce browse (optional phase)](#8-public-ecommerce-browse-optional-phase)
9. [Customer portal shell](#9-customer-portal-shell)
10. [Portal routes — screen-by-screen](#10-portal-routes--screen-by-screen)
11. [Shared component library](#11-shared-component-library)
12. [Content migration](#12-content-migration)
13. [Implementation phases](#13-implementation-phases)
14. [Sign-off checklist](#14-sign-off-checklist)
15. [Author notes](#15-author-notes)

---

## 1. North star

**DHEIR is logistics-first.** Ecommerce is a second lane in the same account: “we ship your China purchases” and “we sell curated goods you can order to Nigeria.”

**Visitor outcome (public):** In under 60 seconds they understand China → Nigeria forwarding, trust the operator, and tap **Create account** or **Log in**.

**Customer outcome (app):** After login they always know **what to do next** — copy warehouse address, register a package, pay a balance, track status — without WhatsApp unless they choose it.

**Design outcome:** One visual language from `/` through `/auth/*` through `/base/*`. Cabinet for moments; Satoshi for work; Tabler for icons; DHEIR blue for action; no legacy red nav blob, no full-page `#e6f3ff`, no mixed icon libraries.

---

## 2. Product story on one page

### Act I — Problem
Buying from China is easy. **Getting it to Nigeria with one clear operator** is not.

### Act II — Promise
DHEIR is the calm place between both: **one warehouse address, one portal, air and sea, delivery home.**

### Act III — Path
Sign up → copy China address → packages arrive → we quote → you pay → we ship → you track.

### Act IV — Optional lane
**Shop curated imports** inside the same account (marketplace). Same pipeline, same trust.

### Conversion hierarchy
1. **Primary:** Create account / Get warehouse address  
2. **Secondary:** Log in  
3. **Tertiary:** WhatsApp (FAB, not hero)  
4. **Quaternary:** Browse shop (teaser → signup gate for purchase)

---

## 3. Architecture: public vs authenticated

```
┌─────────────────────────────────────────────────────────────┐
│  PUBLIC (no session)                                          │
│  /              Marketing landing (logistics story)           │
│  /shop          Optional: window-shop catalog (read-only)     │
│  /auth/*        Login, signup (DONE — reference implementation)│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ signup / login
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMER APP (/base/*) — requires session, role: customer   │
│  Shell: top bar + scroll main + bottom nav                    │
│  Home · Packages hub · Quote · Account (+ marketplace paths)  │
└─────────────────────────────────────────────────────────────┘
```

**Root `/` behavior (replace current redirect-to-login):**
- No session → render landing  
- Session customer → `/base`  
- Session admin → `/admin`

---

## 4. Template synthesis map

Templates are **wireframe and composition references**, not color or font sources. Map each to DHEIR tokens.

### Logistics templates (landing + trust)

| Reference (board) | Steal | Do not steal |
|-------------------|-------|----------------|
| Pathfinder-style hero | Full-bleed photography + left-aligned headline + single CTA | Auto carousel, yellow/orange palette, “WHO WE ARE” corporate tone |
| Professional logistics (air/sea/road cards) | Three service cards, image footers, icon + label | Red/navy dominance, serif corporate fonts |
| Transplix-style “Who we are” | Overlapping image collage, 24/7 badge chip | Navy/orange system, shopping cart in primary nav |
| Qesco-style band | **Post-login:** track-by-reference module | Yellow/black industrial theme on marketing |
| Warehouse hero (U R First) | Authentic warehouse/port photography, mission bullets | Orange/black blocks, heavy B2B consultation forms on landing |
| Multi-route / world map | Subtle dot map or **route-line SVG** (identity §8D) | Busy globes, dark entire sections |

### Ecommerce templates (shop lane only)

| Reference (board) | Use on | Steal | Do not steal |
|-------------------|--------|-------|----------------|
| Commerce X | Landing § Shop teaser | 2×2 category tiles, clean product row, dual hero CTAs | Grey-only palette; generic “tech gadgets” copy |
| CRESCENDO | Landing teaser + `/base/marketplace` | Featured 3-up cards, “Shop by category” horizontal cards | Blue gradient hero unlike DHEIR wash |
| lapakbaju | `/base/marketplace` | Filter chips, product grid density, purple→map to `dheir-blue` | Purple brand; sidebar filters v1 can be chips only |
| BR.F / Nextgen | `/base/marketplace/[id]` | PDP: gallery left, size/color, sticky add-to-cart, shipping accordion | Fashion-only IA; black/white fashion branding |
| wearism | Promo strips | Soft promo pill: delivery estimate / offer code | Playful mascots; pink palette |

### Harmonization rule
Every screen passes the **80% neutral / 10% blue / ≤5% warm accent** ratio from `VISUAL_IDENTITY.md`. Template accent colors (orange, yellow, purple, red) are **not** imported.

---

## 5. Global design system (customer)

### Tokens
Use existing CSS variables: `dheir-page`, `dheir-surface`, `dheir-blue`, `dheir-ink`, `dheir-muted`, `shadow-dheir-soft`, `dheir-input`, `dheir-btn-primary`. No new hex in components.

### Typography
- **Cabinet:** landing hero, section titles, dashboard greeting, card titles  
- **Satoshi:** everything else, especially ₦ amounts (`tabular-nums`)  
- **Max 65ch** on marketing paragraphs  

### Icons
**Tabler only** on customer surfaces. Retire `react-icons` / `Bs*` / `Fa*` in touched files during portal revamp.

### Photography & illustration
| Context | Asset direction |
|---------|-----------------|
| Landing hero | Real logistics: warehouse, containers, package handling — desaturated optional, **light scrim** for text |
| Landing shop teaser | Product photos from `products` table / Cloudinary |
| Portal empty states | Simple Tabler icon + one line copy |
| Background threads | SVG route line China→Nigeria at 40% blue opacity (identity §8D) |

**External images:** Prefer client-owned warehouse photos; fallback licensed stock with warm-neutral grade. No 3D forklifts breaking grid unless subtle footer decoration.

### Layout widths
| Surface | Max width |
|---------|-----------|
| Landing | 1120px centered |
| Shop teaser / marketing sections | 1120px |
| Customer app main | Full bleed mobile; optional 480px centered column tablet+ for readability |
| Marketplace grid | 2 col mobile / 3–4 col `md+` |

---

## 6. Motion, scroll, and atmosphere

### Principles (from identity)
- Blur-resolve on **hero and section titles once**  
- Net-lift on **step cards and dashboard quick actions once**  
- **No** motion on forms, payment flows, tables  
- `prefers-reduced-motion`: opacity-only  

### Approved UI additives

#### A. Sticky marketing header
- Landing nav: transparent over hero → `dheir-surface` + hairline border after 80px scroll  
- Reuse blur backdrop optional: `backdrop-filter: blur(12px)` at 80% white  

#### B. Sticky scroll + section reveal (landing)
- **Not** full-page scroll-jacking  
- Intersection Observer toggles `is-visible` on `.blur-reveal` and `.net-lift` per section  
- Stagger: 80ms hero children; 60ms step grid (max 8 items)  

#### C. Sticky scroll + element grow (limited)
**Use once:** “How it works” step cards on desktop — inactive step `scale(0.98)`, active step `scale(1)` + `shadow-lift` as user scrolls through section (scroll-driven or focus index).  
**Do not use** on product grids (feels retail-gimmicky).

#### D. Gradients
| Allowed | Forbidden |
|---------|-----------|
| `--dheir-bg-hero-wash` horizontal band behind hero/CTA | Full-viewport blue gradient |
| Soft wash `#EEF4FF → #FAFAF8` 120px fade between sections | Orange/red gradient panels |
| Optional: 3% opacity blue radial behind hero image | Dark overlay &gt; 40% on photos |

#### E. Background threads
- Single SVG **route line** under “How it works” — stroke draws on enter viewport  
- Optional: faint dot grid at 4% opacity in FAQ section only  
- No parallax on more than one layer  

#### F. WhatsApp FAB
- Fixed bottom-right **above** portal bottom nav on app; landing only (no nav overlap)  
- `IconBrandWhatsapp`, green `#25D366`, soft shadow  
- Does not replace primary CTAs  

---

## 7. Public landing `/`

**Layout shell:** `MarketingLayout` — header, main, footer. No bottom nav.

### 7.0 Landing implementation status (May 2026)

| # | Section | Status | Code |
|---|---------|--------|------|
| 1 | Header | Shipped | `components/marketing/MarketingHeader.tsx` |
| 2 | Hero | Shipped | `components/marketing/HeroSection.tsx`, `lib/marketing/hero.ts` — single image, overlay nav pill |
| 3 | Social proof | Shipped (dummy marquee; wire `/api/reviews` later) | `components/marketing/SocialProofSection.tsx`, `lib/marketing/dummyReviews.ts` |
| 4 | How it works | Shipped | `components/marketing/HowItWorksSection.tsx`, `lib/marketing/howItWorksSteps.ts`, `components/marketing/RouteLine.tsx` |
| 5 | Services | Shipped | `components/marketing/ServicesSection.tsx`, `lib/marketing/services.ts` |
| 6 | Trust & policies | Shipped | `components/marketing/TrustSection.tsx`, `lib/marketing/trustItems.ts` |
| 7 | Shop teaser | Shipped | `ShopTeaserSection`, `lib/marketing/shopCatalog.ts` |
| 8 | FAQ | Shipped | `FAQSection`, `assets/faqs/faqs` |
| 9 | Final CTA band | Pending | §7.9 |
| 10 | Footer | Shipped | `MarketingFooter`, `lib/marketing/siteContact.ts` |

**Page entry:** `app/page.tsx` — guests see landing; customers/admins redirect to portal.

### 7.1 Header
| Element | Spec |
|---------|------|
| Logo | Flat icon + Cabinet wordmark “DHEIR” / Satoshi “International” muted |
| Nav anchors | How it works · Services · Shop · FAQ |
| Actions | Log in (ghost) · **Get started** (primary) |

### 7.2 Hero (logistics — Pathfinder / GIG narrative, DHEIR skin)
**Composition:** 55/45 split desktop; stacked mobile.

| Zone | Content |
|------|---------|
| Left | `display-hero` Cabinet: “Calm shipping from China home.” Sub: one line on warehouse + tracking + Nigeria delivery. CTAs: **Create free account** (primary), **See how it works** (secondary, anchor). |
| Right | Hero image in `radius-xl` frame, `shadow-dheir-soft`, optional soft wash bleed behind |
| Motion | Blur-reveal stagger headline → sub → CTAs |

**Do not:** carousel, video autoplay, stock ticker.

### 7.3 Social proof (early — competitor learnings)
- **v1 shipped:** infinite horizontal marquee of review cards (6 dummy reviews, duplicated loop, pause on hover) — `SocialProofSection`, `.reviews-marquee` in `globals.css`  
- **v1.1:** swap dummies for `/api/reviews` (public GET) when ready  
- Star row + Satoshi quote + first name  
- Placement **before** long prose (G-Line / Nicargo put trust high)  

### 7.4 How it works (4 steps — Qesco / professional logistics structure)

**Visual model (required):** one **100vw outer box** with a **section background**; inside it, **tall inner boxes** (step cards). Each card is **image on top (large, not a thumbnail)**, **text/content underneath**. The image must read as a real photo panel, not a decorative strip.

```
┌──────────────────────────── 100vw band (.how-it-works-band) ────────────────────────────┐
│  .how-it-works-band__bg — gradient: hero-wash → blue-muted → page                       │
│  [header copy — max-width 1120px, padded]                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  tall cards (460–560px)              │
│  │  IMAGE  │ │         │ │         │ │         │  ~58–62% of card height (flex 1.6)   │
│  │substantial│         │ │         │ │         │  min-h 260px mobile / 300px desktop  │
│  ├─────────┤ │         │ │         │ │         │                                      │
│  │  text   │ │         │ │         │ │         │  step label, Cabinet title, body     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                                      │
│  [RouteLine SVG — stroke draw on scroll]                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Band (outer box):**
| Property | Spec |
|----------|------|
| Width | `100vw` — `.how-it-works-band` breaks out of page max-width via `margin-left/right: calc(50% - 50vw)` |
| Background | `.how-it-works-band__bg` — vertical gradient `hero-wash` → `blue-muted` → `page` |
| Section id | `#how-it-works` (header nav + hero secondary CTA anchor) |

**Layout (inner track):**
| Breakpoint | Behavior |
|------------|----------|
| Mobile | Horizontal scroll + `scroll-snap` on `.how-it-works-track`; cards `min(82vw, 300px)` wide |
| Desktop | 4-column grid inside `max-width: 1120px` |

**Card anatomy (tall boxes):**
| Zone | Spec |
|------|------|
| Image (top) | `flex: 1.6` vs content `flex: 1` (~58–62% of card), `min-height` 260px mobile / 300px desktop, `object-cover`, step number overlay (Cabinet, white) |
| Content (bottom) | “Step N” label (`dheir-blue`), Cabinet title, Satoshi description on `dheir-surface` |
| Card shell | `min-h` 460px mobile, 560px desktop; `rounded-2xl`, `shadow-dheir-soft`, `net-lift` stagger 60ms |

| Step | Title |
|------|-------|
| 1 | Create your account |
| 2 | Copy your China warehouse address |
| 3 | We receive, measure, and quote |
| 4 | Pay and ship to Nigeria |

**Motion & motif:**
- Cards: `NetLift` stagger on first view (`lib/motion/dheir.ts`)  
- Footer motif: `RouteLine` — China → Nigeria path, `stroke-dashoffset` draw on scroll (`--dheir-blue` 40% opacity)  

**Assets:** step photos in `lib/marketing/howItWorksSteps.ts` (Unsplash placeholders until client photography).  

**Do not:** icon-only steps, tiny 80px thumbs, equal-height icon row, or cards shorter than ~440px.  

### 7.5 Services (air / sea / express — three full-scale columns)

**Shipped:** `components/marketing/ServicesSection.tsx`, `lib/marketing/services.ts`, `.services-section` in `globals.css`.

**Layout:** `100vw` triptych — **three separate full-height rectangles** (not small cards in a row). Desktop: `grid-cols-3`, each column `min-height: 100svh`. Mobile: stacked columns `min-height: ~88svh`. Narrow `gap` shows page background between columns so lanes read as distinct panels.

**Distinct feel on arrive** (scroll, `IntersectionObserver`, once):
| Lane | Visual | Motion |
|------|--------|--------|
| Air | Cool blue wash, sky/plane photo | Content rises + blur resolve |
| Sea | Deep teal/navy scrim, port/containers | Content slides in from left + slower blur |
| Express | Warm orange scrim, warehouse | Content scale-up + warm label tint |

Each column: full-bleed photo, variant scrim, Cabinet title + Satoshi body (white on scrim), “Learn more” → `#faq`. Section id: `#services`.

**Not** separate routes in v1.

### 7.6 Trust & policies (dial + left nav — template layout)

**Shipped:** `components/marketing/TrustSection.tsx`, `lib/marketing/trustItems.ts`.

**Layout:** White section. Left: vertical list with thumb + label (active = bold + pointer line from dial). Center: large tick-mark **dial** SVG, headline with **China to Nigeria** in `dheir-blue`, soft **detail card** (thumb, title, body, “Explore services” pill). Bottom: thin **progress bar** by topic index.

**Topics (6):** Accurate CBM · Onitsha · Kano · Waybill states · Lithium policy · 1CBM+ inspection — copy shortened from `/base` notice.

**Not** full Terms/Privacy (separate legal pages).

### 7.7 Shop teaser (ecommerce — Commerce X / CRESCENDO mashup)

**Shipped:** `ShopTeaserSection`, `ShopProductCard`, `ShopCategoryCard`, `lib/marketing/shopCatalog.ts`.

**Placement:** After trust, before FAQ. **Two blocks** — shop highlighter (showcase copy + online images, not DB).

| Block | Spec |
|-------|------|
| Intro | Title, sub, trust line; **See all products** → signup |
| **Featured products** | 4 cards: Bag ₦10k, Proclean Jugs pink ₦30k, Vase ₦110k, Silver Watch ₦122.3k (client samples) |
| **Shop by category** | 3 CRESCENDO-style cards: Fashion, Entertainment, Home essentials |
| Cards | Commerce X product tiles + category panels with **Explore category** → signup |
| Footer | Browse catalog · View cart when count > 0 |

**Data:** Static `shopCatalog.ts` with Unsplash placeholders until admin catalog is public on landing.

### 7.8 FAQ

**Shipped:** `FAQSection`, `FAQAccordionItem`, content from `assets/faqs/faqs` (same as `/base` home).

Accordion on `dheir-surface` band: Cabinet questions (16 to 17px), Satoshi answers (15 to 16px, line-height 1.65 to 1.7), `max-width` 3xl list / 65ch answer. Tabler `IconChevronDown`, 250ms grid height transition. First item open by default. No em/en dashes in copy.

### 7.9 Final CTA band
Full-width `--dheir-bg-hero-wash`, blur-reveal headline: “Get your China warehouse address today.” Dual CTA same as hero.

### 7.10 Footer

**Shipped:** `components/marketing/MarketingFooter.tsx`, `lib/marketing/siteContact.ts`, `/legal/refunds`.

**Design:** Full-width **dark** band (`#0a0c10`) with `public/worldmap_white_bg.png` as background (bottom-centered, gradient overlay for legibility). White/muted Satoshi text, Cabinet brand lockup.

| Column | Content |
|--------|---------|
| Brand | Logo, tagline |
| Contact | Email, phone (from `/base` support: +234 705 913 6729) |
| Explore | Anchors: How it works, Services, Shop, FAQ |
| Legal | Terms, Privacy, Shipping & service conditions, Refund & payment rules |
| Social | Facebook, Instagram, TikTok (URLs in `siteContact.ts`) |
| Bottom | © year DHEIR International |

Legal routes use `LegalPlaceholder` until counsel supplies full text.

### 7.11 Landing page order (final)
1. Header ✓  
2. Hero ✓  
3. Social proof ✓ (marquee; API later)  
4. How it works ✓  
5. Services ✓  
6. Trust & policies ✓  
7. Shop teaser ✓  
8. FAQ ✓  
9. Final CTA band  
10. Footer ✓  

---

## 8. Public ecommerce browse (optional phase)

**Route:** `/shop` (optional v1.1)

| Feature | v1 launch | v1.1 |
|---------|-----------|------|
| Product grid | Teaser on landing only | Full catalog read-only |
| Product detail | — | `/shop/[id]` read-only |
| Add to cart | — | Redirect signup |
| Filters | — | Category chips (lapakbaju-style) |

**Rationale:** Launch can ship landing teaser + in-app marketplace; public `/shop` reduces scope if deadline tight.

---

## 9. Customer portal shell

Replace `app/base/layout.tsx` gray shell + legacy `NavBar`.

### 9.1 Shell structure
```
┌─────────────────────────────────────┐
│ TopBar: icon/wordmark · notif? · avatar │  56px
├─────────────────────────────────────┤
│ Main (scroll)                         │  bg-dheir-page
│                                       │  p-4 md:p-5
├─────────────────────────────────────┤
│ BottomNav (4 items)                   │  72px + safe-area
└─────────────────────────────────────┘
```

### 9.2 Bottom navigation (identity target)
| Tab | Path | Icon | Notes |
|-----|------|------|-------|
| Home | `/base` | `IconHome` | Dashboard |
| Packages | `/base/all_packages` or hub | `IconPackage` | Hub sub-routes via tiles |
| Quote | `/base/estimate` | `IconCalculator` | |
| Account | `/base/profile` | `IconUser` | Marketplace link inside |

**Remove:** red sliding blob (`bg-accent-red` circle). **Use:** 2px blue underline or soft pill, `dheir-spring-tab` 200ms.

**Marketplace:** Accessible from Home quick tile + Account menu — not required as fifth tab unless client insists at sign-off.

### 9.3 Top bar
- Cabinet “DHEIR” small or icon-only centered/left  
- Avatar → profile  
- Optional: announcements dot  

### 9.4 Page header pattern (portal)
Repeated across inner pages:
- Back: `IconArrowLeft` + Satoshi “Back”  
- Title: `display-card` Cabinet  
- Sub: `body-sm` muted  

---

## 10. Portal routes — screen-by-screen

### 10.1 Home `/base` (dashboard — identity §10)
**Replace** marketing carousel home with **operations dashboard**.

| Priority | Block | Pattern |
|----------|-------|---------|
| 1 | Greeting | “Good afternoon, {first_name}” blur-reveal once/session |
| 2 | Warehouse address card | Primary CTA: copy full address, `IconCopy`, success toast |
| 3 | Status chips | Horizontal scroll: pending packages, payment due, in transit |
| 4 | Quick actions 2×2 | net-lift: Add package · All packages · Pending payments · Marketplace |
| 5 | Announcements | Compact list (max 3) |
| 6 | Recent activity | Optional v1.1 |

**Remove from home:** long SEO about blocks, review composer, FAQ (moved to landing).

### 10.2 Packages cluster
| Route | Revamp focus |
|-------|----------------|
| `/base/add_package` | `AuthField`-style inputs, clear steps |
| `/base/all_packages` | List cards + status chips semantic colors |
| `/base/waiting_to_be_stored` | Same list pattern |
| `/base/waiting_to_be_released` | Same |
| `/base/warehouse_address` | Copy-first hero card |
| `/base/my_address` | Nigeria delivery address form |
| `/base/request_mail` | Keep flow; Tabler icons; section progress |

### 10.3 Shipments & orders
| Route | Revamp focus |
|-------|----------------|
| `/base/orders` | Shipment list cards |
| `/base/orders/[id]` | Timeline status |
| `/base/orders_shipped` | Filter + cards |

### 10.4 Payments
| Route | Revamp focus |
|-------|----------------|
| `/base/pending_payments` | Amount + ref + pay CTA (Monnify or manual per ops plan) |
| `/base/payment_receipts` | History with status chips |
| `/base/verify_payment` | Minimal verifying state (already server redirect) |

**Manual payment interim:** Bank details card + upload receipt + “Under review” chip (when built).

### 10.5 Marketplace (ecommerce — lapakbaju + Commerce X + PDP templates)
| Route | Layout |
|-------|--------|
| `/base/marketplace` | Header search · category chips · product grid 2/3 col · `ProductCard` component |
| `/base/marketplace/[id]` | PDP: gallery, price ₦, stock, add to cart, **shipping note** accordion (Nextgen-style: “Delivery via DHEIR forwarding”) |
| `/base/marketplace/cart` | Checkout summary · address block · order CTA |

**Product card spec:**
- Image `aspect-square` `radius-lg`  
- Name Satoshi 500  
- Price `data` tabular ₦  
- Badge: NEW / LOW STOCK optional  
- `IconShoppingCart` add — not legacy red buttons  

### 10.6 Account & profile
| Route | Revamp focus |
|-------|----------------|
| `/base/profile` | Avatar, stats, CTA grid (migrate `profileCtaButtonsProps` to Tabler tiles) |
| `/base/edit_profile` | Auth form patterns |

### 10.7 Tools
| Route | Revamp focus |
|-------|----------------|
| `/base/estimate` | Wizard steps, calm results cards, ₦ tabular |
| `/base/announcements/[id]` | Article layout |

---

## 11. Shared component library

Build under `components/customer/` (or extend `components/auth/` + `components/marketing/`).

### Marketing
| Component | Used on |
|-----------|---------|
| `MarketingLayout` | `/`, `/shop` |
| `MarketingHeader` | sticky header |
| `MarketingFooter` | dark footer, map bg, legal + social |
| `HeroSection` | landing |
| `SocialProofSection` | reviews marquee |
| `HowItWorksSection` | `#how-it-works` tall image-top step cards |
| `RouteLine` | how-it-works band motif |
| `ServicesSection` | `#services` full-height triptych columns |
| `TrustCard` | policies |
| `ShopTeaser` | featured products |
| `FAQSection` | |
| `CTABand` | |
| `ReviewCards` | |

### Portal
| Component | Used on |
|-----------|---------|
| `PortalShell` | `app/base/layout` |
| `PortalTopBar` | |
| `PortalBottomNav` | |
| `PortalPageHeader` | inner pages |
| `WarehouseAddressCard` | home, warehouse page |
| `StatusChip` | semantic colors |
| `QuickActionTile` | 2×2 grid |
| `PackageListCard` | package routes |
| `PaymentCard` | pending payments |
| `ProductCard` | marketplace |
| `ProductGallery` | PDP |
| `EmptyState` | Tabler + one line |

### Reuse from auth (already built)
`BlurReveal`, `AuthField` (forms), `dheir-btn-primary`, `dheir-input`, motion tokens from `lib/motion/dheir.ts`.

---

## 12. Content migration

| Source today | Destination |
|--------------|-------------|
| `/base` carousel, about, FAQ, reviews | `/` landing sections |
| `assets/faqs/faqs` | Landing FAQ |
| `/api/reviews` | Landing social proof |
| `ctaButtonsProps` | Dashboard quick actions (icons → Tabler) |
| Competitor-inspired copy | Rewrite in brand voice (short, verb-first) — do not plagiarize |

**Hero line (approved direction):** align with auth panel: *“Calm shipping from China home.”* / *“One place for your warehouse address, packages, and delivery to Nigeria.”*

---

## 13. Implementation phases

### Phase 0 — Foundation (partially done)
- [x] Auth revamp  
- [x] `VISUAL_IDENTITY.md`, tokens in `globals.css`  
- [x] Root `/` routing logic (guest landing; session → portal)  
- [ ] Tabler migration strategy documented per PR  

### Phase 1 — Landing (launch-critical)
- [x] Header, hero, social proof, how it works, services (`app/page.tsx`)  
- [ ] `MarketingLayout` + footer wrapper  
- [ ] Final CTA band  
- [ ] Public reviews fetch (replace dummy marquee)  
- [ ] SEO metadata + Open Graph  
- [ ] Lighthouse: LCP image prioritized  

### Phase 2 — Portal shell + home
- [ ] `PortalShell` + bottom nav revamp  
- [ ] Dashboard home  
- [ ] Warehouse address card  

### Phase 3 — Packages + payments UI
- [ ] Package list/add flows  
- [ ] Pending payments (Monnify + manual path per ops)  

### Phase 4 — Marketplace
- [ ] Grid + PDP + cart styling  
- [ ] Align with shop teaser on landing  

### Phase 5 — Remaining routes
- [ ] Estimate, orders, profile, request mail, announcements  

### Phase 6 — Polish
- [ ] Motion QA, reduced-motion  
- [ ] Cross-browser, 320px width  
- [ ] Sign-off checklist §14  

**Admin:** explicitly out of scope for this plan.

---

## 14. Sign-off checklist

### Landing
- [ ] Stranger understands business in 10s  
- [ ] Primary CTA is signup  
- [ ] Logistics story before shop teaser  
- [ ] Matches auth visual system  
- [ ] Mobile 320px usable  
- [ ] No login wall on `/`  

### Portal
- [ ] Bottom nav: no red blob; blue active state  
- [ ] Tabler only on touched screens  
- [ ] Warehouse copy is primary home action  
- [ ] ₦ uses tabular nums  
- [ ] Marketplace feels same family as dashboard  

### Brand
- [ ] 80/10/3/5 color ratio respected  
- [ ] Cabinet not used below 16px UI  
- [ ] WhatsApp FAB only green element  

---

## 15. Author notes

### On the template boards
The logistics pins and ecommerce pins are **correctly separated**. That is how you harmonize: **one DHEIR skin, two compositional grammars.** Logistics pins own vertical rhythm, photography, and step narratives. Ecommerce pins own card density, grids, and PDP structure. If you paste orange Pathfinder or purple lapakbaju colors into the landing, it will feel like two brands.

### On “bulletproof and perfect”
Perfect for v1 means **coherent story + safe money flows + no dead ends**, not infinite polish. Prioritize: public landing, dashboard + warehouse copy, package add, pending payments (however ops confirms), marketplace happy path. A beautiful landing with a broken pay flow is worse than the reverse.

### On the mashup
GIG and Uhutex win on **words** (“warehouse at checkout”, “personal shopper”). DHEIR can win on **product**: logged-in portal, tracking, payments, optional catalog. The landing should say that explicitly in one line near the shop teaser: *“Track everything in your account — not just WhatsApp updates.”*

### On scope vs 5-day launch
If deadline is fixed: ship **Phase 1 + Phase 2** only; marketplace grid styling can lag if teaser on landing points to basic in-app shop. Do not block launch on `/shop` public catalog.

### On client alignment
Confirm with Ronke:
1. Shop teaser on landing — yes/no  
2. Marketplace as fifth tab vs inside Account  
3. Hero photography — client asset vs stock  
4. Manual bank transfer UI vs Monnify-only messaging on pending payments  

### Risk
Revamping every `/base` route at once will thrash QA. Follow phase order; keep auth as the reference implementation and diff new screens against `AuthPageShell` spacing and token usage.

---

*This document is the customer-experience source of truth until superseded by a signed change request from the client.*
