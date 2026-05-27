# DHEIR International — Visual Identity System

**Version:** 1.0  
**Status:** Source of truth for UI/UX revamp (landing → auth → customer app). Admin UI deferred.  
**Audience:** Designers, frontend engineers, and AI agents implementing this codebase.

**Product context:** China → Nigeria freight forwarding (warehouse address, package intake, shipment, delivery). Mobile-first **web app** (browser, not native App Store build). Admin portal comes in a later phase.

**Reference feel:** Premium, calm, light-mode “safety net” UX — soft containment, trust, clarity. Motion inspired by [inklin](https://inklin.space/) (blur-to-sharp text reveals), not generic Framer template animations.

---

## Table of contents

1. [Brand essence](#1-brand-essence)
2. [Logo & lockups](#2-logo--lockups)
3. [Typography](#3-typography)
4. [Color system](#4-color-system)
5. [Spacing & layout](#5-spacing--layout)
6. [Surfaces, radius, borders, shadows](#6-surfaces-radius-borders-shadows)
7. [Iconography (Tabler)](#7-iconography-tabler)
8. [Motion & animation](#8-motion--animation)
9. [Components](#9-components)
10. [Page-level application](#10-page-level-application)
11. [Voice & microcopy](#11-voice--microcopy)
12. [Anti-patterns (do not ship)](#12-anti-patterns-do-not-ship)
13. [Implementation notes (Next.js / Tailwind)](#13-implementation-notes-nextjs--tailwind)
14. [Sign-off checklist](#14-sign-off-checklist)

---

## 1. Brand essence

### Positioning

| Dimension | Definition |
|-----------|------------|
| **Category** | Cross-border forwarding: China warehouse → Nigeria delivery |
| **Promise** | Clear, reliable handling — customers always know what happens next |
| **Emotional goal** | *“I landed somewhere calm; competent people are already handling this.”* — a **safety net**, not hype |
| **Conversion goals** | Visitors **stay** on the site; customers **refer** others because the product feels trustworthy |
| **Tone** | Premium calm, soft light mode, crafted — **not** ordinary SaaS, **not** cheap courier clip-art |

### Brand sentence (internal)

> **DHEIR is the calm place between buying in China and receiving in Nigeria.**

### What we are NOT

- Dark-mode-first “stealth” logistics UI  
- Neon startup gradients and bounce animations  
- Dense corporate tables on the customer mobile experience  
- Login wall as the first impression for strangers  

### Architecture split (revamp)

| Layer | Route pattern | Auth |
|-------|---------------|------|
| **Public marketing** | `/` (landing), optional `/estimate` later | None |
| **Auth** | `/auth/login`, `/auth/signup`, password/email flows | Public |
| **Customer app** | `/app/*` or refactored `/customer/*` | Required (`role: customer`) |
| **Admin** | `/admin/*` | Required (`role: admin`) — **visual system phase 2** |

**Critical product rule:** Marketing homepage content must **not** sit behind login. Today’s gated `/customer` marketing copy moves to public `/`.

---

## 2. Logo & lockups

### Master logo (client asset)

The official mark includes:

- Circular emblem: **blue** ring, transport silhouettes (air / sea / road), **red** dynamic swooshes  
- Wordmark: **“D_HEIR”** in bold blue (often with 3D/extruded treatment in print assets)  
- Subtitle: **“International”** in muted **orange/brown**  
- Plain text: **“DHEIRINTERNATIONAL”** in grey (all-caps sans)

**Digital UI rule:** Do not rely on 3D extrusion, heavy drop shadows, or busy backgrounds behind the logo in the product. Surround the mark with **quiet space** so it reads premium in a soft UI.

### Color extraction from logo (harmonize, do not reinvent)

| Swatch | Hex (reference) | Role in UI |
|--------|-----------------|------------|
| Logo blue | `#005EFF` | Primary trust, links, focus, key icons |
| Swoosh red | `#F26430` | Accent pulse — CTAs sparingly, urgent status |
| International orange | `#C4783B` – `#D4864E` | Warmth, secondary labels, human touches |
| Neutral grey | `#6B7280` area | Muted text, plain wordmark reference |

### Lockup variants

| Variant | Use |
|---------|-----|
| **Full** | Landing hero, footer, print, email headers |
| **Icon + wordmark (flat)** | App header, auth panel — wordmark set in **Cabinet Grotesk**, not raster 3D text |
| **Icon only** | Favicon, compact mobile header when space is tight |

### Clear space & minimum size

- Clear space: minimum **height of the “D”** in the wordmark on all sides  
- Digital minimum height: **32px** for icon; **24px** only for favicon  
- Never place the full 3D raster logo on colored gradients that fight the blue/orange palette  

### Backgrounds allowed behind logo

- `#FAFAF8` (page)  
- `#FFFFFF` (card)  
- `#EEF4FF` (soft hero wash — logo blue at ~6–8% opacity feel)  

### Backgrounds NOT allowed

- Full-width saturated `#e6f3ff` page floods (legacy)  
- Red/orange panels behind the full lockup  
- Stock photos with no scrim behind a busy mark  

---

## 3. Typography

### Families

| Role | Family | Source | License |
|------|--------|--------|---------|
| **Display / brand voice** | **Cabinet Grotesk** | [Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk) | Confirm Fontshare commercial terms before client handoff |
| **UI / body / data** | **Satoshi** | [Fontshare](https://www.fontshare.com/fonts/satoshi) | Same |
| **Fallback** | `system-ui, -apple-system, sans-serif` | — | — |

**Load discipline:** Cabinet — max **3 weights** (600, 700, 800). Satoshi — max **3 weights** (400, 500, 600). Subset for Latin. Do not load entire families.

### Why this pairing

- **Cabinet** = distinctive headlines, landing hero, section titles, welcome moments  
- **Satoshi** = readable body, forms, nav labels, money, tracking codes, tables (admin later)  
- **Cabinet must never be the only family** across the product — logistics UI needs Satoshi for small type and numerals  

### Type scale (mobile-first; scale up ~1.125× at `md:` where noted)

| Token | Font | Weight | Size | Line height | Letter-spacing | Use |
|-------|------|--------|------|-------------|----------------|-----|
| `display-hero` | Cabinet | 800 | 36px → 44px `md` | 1.1 | -0.03em | Landing hero only |
| `display-section` | Cabinet | 700 | 24px → 28px `md` | 1.15 | -0.02em | Section titles |
| `display-card` | Cabinet | 600 | 18px → 20px `md` | 1.2 | -0.01em | Card titles, dashboard greeting |
| `lead` | Satoshi | 500 | 18px | 1.5 | 0 | Intro paragraphs |
| `body` | Satoshi | 400 | 15px → 16px `md` | 1.6 | 0 | Default copy |
| `body-sm` | Satoshi | 400 | 14px | 1.5 | 0 | Secondary copy |
| `label` | Satoshi | 500 | 13px | 1.4 | 0.01em | Form labels, nav labels |
| `caption` | Satoshi | 500 | 12px | 1.4 | 0.02em | Hints, timestamps |
| `button` | Satoshi | 600 | 14px → 15px `md` | 1 | 0.02em | Buttons (Cabinet optional on marketing CTA only) |
| `data` | Satoshi | 500 | 14px | 1.4 | 0 | Codes, ₦, kg — **always `font-variant-numeric: tabular-nums`** |

### Typography rules

1. **Cabinet below 16px:** only for logo-adjacent lockups, not UI chrome  
2. **All caps:** brand name in footer OK; never all-caps paragraphs  
3. **Bold spam:** max one bold line per card  
4. **Paragraph width:** 65ch max on landing prose  
5. **Headline + body font mixing on one line:** avoid  

---

## 4. Color system

### Design intent

Light mode only for v1. Palette derived from logo (blue, red, orange) but **muted and spacious** — inklin-like restraint. Blue leads interaction; orange adds warmth; red is a **pulse** (≤5% of pixels per screen).

### Core tokens

```css
/* Page & surfaces */
--dheir-bg-page:        #FAFAF8;   /* warm off-white — the "net" */
--dheir-bg-surface:     #FFFFFF;   /* cards, modals, auth panel */
--dheir-bg-elevated:    #FFFFFF;   /* same hue, shadow separates */
--dheir-bg-hero-wash:   #EEF4FF;   /* soft blue tint — hero/CTA bands only */

/* Text */
--dheir-text-primary:   #12141A;
--dheir-text-muted:     #8B919E;
--dheir-text-inverse:   #FFFFFF;

/* Brand — from logo */
--dheir-blue:           #1A5FFF;   /* primary UI blue (slightly softened from #005EFF) */
--dheir-blue-hover:     #0D4EDB;
--dheir-blue-muted:     #EEF4FF;   /* backgrounds */
--dheir-red:            #F26430;   /* swoosh — urgent accent only */
--dheir-red-hover:      #E05524;
--dheir-orange:         #D4864E;   /* International subtitle warmth */
--dheir-orange-muted:   #FDF6F0;

/* Borders */
--dheir-border:         rgba(18, 20, 26, 0.08);
--dheir-border-strong:  rgba(18, 20, 26, 0.12);

/* Focus */
--dheir-focus-ring:     #1A5FFF;
```

### Semantic: customer status (app only — not brand colors)

Use soft **background + darker text** pairs (chips, list rows):

| Status | Background | Text / icon |
|--------|------------|-------------|
| Expected | `#FFFBEB` | `#D97706` |
| In warehouse / stored | `#EFF6FF` | `#2563EB` |
| Payment due | `#FFF7ED` | `#EA580C` |
| Shipped / in transit | `#F5F3FF` | `#7C3AED` |
| Delivered | `#ECFDF5` | `#059669` |
| Cancelled / error | `#FEF2F2` | `#DC2626` |

### Usage ratios (per screen)

| Color | Target |
|-------|--------|
| Neutrals (page, card, text) | ~80–85% |
| Blue (interactive) | ~10% |
| Orange (warmth) | ~3–5% |
| Red (pulse) | ≤5% |

### Legacy tokens to retire

From `app/globals.css` — **do not carry forward** as primary patterns:

- `--color-primary: #e6f3ff` as full-page background  
- Uncontrolled `accent-red` large panels (`bg-red-400/10` style blocks)  
- Competing red sliding tab indicator without brand motion spec  

### Tailwind mapping (suggested when implementing)

Map tokens in `@theme` to names like `dheir-page`, `dheir-surface`, `dheir-blue`, etc. Do not hardcode hex in components once tokens exist.

---

## 5. Spacing & layout

### Base unit

**4px grid.** All spacing multiples of 4.

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon-text gap |
| `space-3` | 12px | Inline groups |
| `space-4` | 16px | Card padding mobile, page gutter |
| `space-5` | 20px | Page gutter comfortable |
| `space-6` | 24px | Card padding desktop |
| `space-8` | 32px | Section inner gap |
| `space-12` | 48px | Section breaks mobile |
| `space-16` | 64px | Section breaks |
| `space-24` | 96px | Landing section rhythm |

### Layout widths

| Context | Width |
|---------|-------|
| Landing content | `max-width: 1120px` centered |
| Auth card | `max-width: 440px` form column |
| Customer app | Full bleed mobile; optional `max-width: 480px` centered on tablet+ for readability |
| Admin (later) | `max-width: 1440px` fluid tables |

### Customer app shell

```
┌─────────────────────────────────────┐
│ Top bar: wordmark/icon · avatar     │  56px height
├─────────────────────────────────────┤
│                                     │
│  Scrollable main (dashboard, etc.)  │  padding: 16–20px
│                                     │
├─────────────────────────────────────┤
│ Bottom nav (4 items)                │  72px + safe-area
└─────────────────────────────────────┘
```

**Bottom nav items (revamp target):** Home · Packages · Quote · Account  
(Markplace demoted to Account or Home tile unless client insists on tab — document decision at sign-off.)

### Landing section order

1. Header (logo, nav anchors, Log in, Get started)  
2. Hero (headline, sub, CTAs, optional soft wash)  
3. Social proof (marquee of review cards; API when wired)  
4. How it works (100vw band + tall image-top step cards + route-line motif)  
5. Services (three full-height columns — air / sea / consolidated; distinct scroll reveal per lane)  
6. Trust / policies (single soft card, short bullets)  
7. Shop teaser (curated goods — same pipeline)  
8. FAQ accordion  
9. Final CTA band (`--dheir-bg-hero-wash`)  
10. Footer (dark band + world map background)  

### Marketing footer (dark)

| Token | Value |
|-------|--------|
| Background base | `#0a0c10` |
| Map asset | `/worldmap_white_bg.png`, bottom-centered, ~55% opacity with top gradient scrim |
| Text primary | `rgba(255,255,255,0.88)` |
| Text muted | `rgba(255,255,255,0.55 to 0.78)` |
| Links hover | full white |
| Social buttons | 40px circle, `1px` border `white/14`, hover `white/12` fill |

**Columns:** brand · contact (email, phone) · explore anchors · legal + social. Satoshi 14 to 15px body; labels 11px caps. No wall of links beyond legal + four nav anchors.

**Code:** `.marketing-footer` in `globals.css`, `MarketingFooter.tsx`, `lib/marketing/siteContact.ts`.

### Full-bleed section bands (landing)

Use when a section needs to **break out of** the `1120px` content column and span the viewport with its own atmosphere (gradient wash, alternate rhythm).

| Token / class | Rule |
|---------------|------|
| Outer wrapper | `width: 100vw`, `max-width: 100vw`, centered breakout: `margin-left/right: calc(50% - 50vw)` |
| Inner background | Child (e.g. `.how-it-works-band__bg`) carries the gradient or wash — not the page `bg-page` alone |
| Content | Headlines and grids still respect `max-width: 1120px` + horizontal padding inside the band |

**Reference implementation:** `.how-it-works-band` / `.how-it-works-band__bg` in `app/globals.css` — see [`plan.md` §7.4](./plan.md#74-how-it-works-4-steps--qesco--professional-logistics-structure).

### Tall image-top cards (“how it works” pattern)

Professional logistics templates (Qesco-style) use **vertical story cards**, not icon rows.

| Zone | Ratio / size | Typography & surface |
|------|----------------|----------------------|
| **Image (top)** | ~58–62% of card height (`flex` ~1.6 vs text 1); `min-height` 260px mobile / 300px desktop; `object-cover` | Step index overlay: Cabinet, white, top-left; optional subtle gradient scrim at image bottom |
| **Content (bottom)** | Remaining height; padding 20–24px | “Step N” label in `--dheir-blue`; title Cabinet 600–700; body Satoshi 14–15px muted |
| **Card shell** | `min-height` 460px mobile, 560px desktop | `bg-dheir-surface`, `radius-lg` (16px), `shadow-dheir-soft` |

**Image rule:** The photo must feel **substantial** — a real panel, not a 64px icon or thumbnail strip. Replace Unsplash placeholders with client warehouse/port photography when available.

**Motion:** `net-lift` stagger 60ms per card; optional `RouteLine` SVG below the grid (§8.D).

**Anti-pattern:** Short cards (&lt;440px), icon-only steps, or images under ~50% of card height.

---

## 6. Surfaces, radius, borders, shadows

### Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 8px | Chips, small tags |
| `radius-md` | 12px | Inputs, buttons |
| `radius-lg` | 16px | Cards |
| `radius-xl` | 24px | Hero panels, modals |
| `radius-full` | 9999px | Pills, avatars, icon buttons |

### Borders

- **Default:** no border on cards — use shadow + surface contrast  
- **Hairline:** `1px solid var(--dheir-border)` on inputs, dividers, bottom nav top edge  
- **Focus:** `2px solid var(--dheir-focus-ring)` with `outline-offset: 2px` — no glow halos  
- **Never:** 2–3px decorative borders on marketing sections  

### Shadows (single system)

```css
/* shadow-soft — default card */
--dheir-shadow-soft:
  0 2px 8px rgba(18, 20, 26, 0.04),
  0 12px 40px rgba(26, 95, 255, 0.06);

/* shadow-lift — hover / emphasis */
--dheir-shadow-lift:
  0 4px 12px rgba(18, 20, 26, 0.06),
  0 16px 48px rgba(26, 95, 255, 0.08);

/* shadow-none — flat inside cards */
```

Blue in shadow ties to logo without loud UI blue blocks.

### Buttons (touch)

- Min height **48px** on mobile primary actions  
- Horizontal padding **20–24px**  
- `active:scale(0.98)` on primary only — remove global aggressive scale on all `<button>` when refactoring  

---

## 7. Iconography (Tabler)

### Library (mandatory)

Use **[Tabler Icons](https://tabler.io/icons)** via `@tabler/icons-react` (or SVG sprite if bundle size requires).

**Do not mix** with `react-icons`, Lucide, Phosphor, or emoji-style icons in customer-facing UI.

### Style

| Property | Value |
|----------|-------|
| Variant | **Outline** (`stroke={1.5}` or Tabler default 1.5–2) |
| Sizes | 20px inline with label · 24px nav · 32px empty states |
| Color idle | `#8B919E` (`--dheir-text-muted`) |
| Color active | `#1A5FFF` (`--dheir-blue`) |
| Color warm accent | `#D4864E` sparingly |

### Recommended Tabler icon mapping

| Concept | Tabler icon name |
|---------|------------------|
| Home / dashboard | `IconHome` |
| Packages | `IconPackage` |
| Quote / estimate | `IconCalculator` |
| Account / profile | `IconUser` |
| Warehouse address | `IconMapPin` or `IconBuildingWarehouse` |
| Add package | `IconPackageImport` |
| Shipment / truck | `IconTruck` |
| Air | `IconPlane` |
| Sea | `IconShip` |
| Payment | `IconCreditCard` |
| Pending | `IconClock` |
| Copy | `IconCopy` |
| Success | `IconCircleCheck` |
| WhatsApp (external) | `IconBrandWhatsapp` — use brand green only on WhatsApp FAB |
| Menu / close | `IconMenu2` / `IconX` |
| Chevron | `IconChevronRight` |
| Logout | `IconLogout` |
| Marketplace (if kept) | `IconShoppingBag` |

Logo already contains literal transport graphics — UI icons stay **minimal outline** to avoid “cartoon on cartoon.”

---

## 8. Motion & animation

### Principles

1. **Crafted, not template** — no stock Framer “fade up on every child”  
2. **Few hero moments** — landing, auth welcome, first dashboard paint  
3. **Safety net metaphor** — fog → focus (blur resolving to sharp type)  
4. **Stillness elsewhere** — forms, tables, payment screens stay calm  
5. **`prefers-reduced-motion`** — blur reveals become opacity-only fades  

### Easing (brand)

```css
--dheir-ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* soft landing */
--dheir-ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
--dheir-spring-tab: cubic-bezier(0.34, 1.56, 0.64, 1); /* subtle tab underline only */
```

### A. Text reveal — “blur resolve” (inklin-adjacent)

**Use on:** landing hero lines, section titles (first view), auth welcome headline, dashboard welcome (once per session).

**Do not use on:** form labels, table cells, error messages, every FAQ row.

**Initial state:**

```css
.blur-reveal {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(8px);
}
```

**Final state:**

```css
.blur-reveal.is-visible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
  transition:
    opacity 0.8s var(--dheir-ease-out),
    filter 0.9s var(--dheir-ease-out),
    transform 0.8s var(--dheir-ease-out);
}
```

**Stagger:** children delay **80ms, 160ms, 240ms** (headline → subhead → CTA group).

**Implementation:** Intersection Observer with `threshold: 0.2`, `once: true`. Class `is-visible` toggled on enter.

### B. Section / card — “net lift”

**Use on:** landing feature cards, how-it-works steps, dashboard quick-action tiles (first enter).

```css
.net-lift {
  opacity: 0;
  filter: blur(4px);
  transform: scale(0.98) translateY(12px);
}
.net-lift.is-visible {
  opacity: 1;
  filter: blur(0);
  transform: scale(1) translateY(0);
  transition: all 0.7s var(--dheir-ease-out);
}
```

Stagger grid children **60ms** apart. Max **8 items** per viewport stagger to avoid performance issues.

### C. Hero background — “soft curtain” (optional)

Slow **20–30s** linear infinite animation on a `linear-gradient` angle for `--dheir-bg-hero-wash` only. Opacity change **<3%** — must be barely perceptible.

### D. Brand motif — “route line” (landing)

Single SVG stroke under “How it works”: China → Nigeria path **draws** on scroll (`stroke-dashoffset` 0.8s–1.2s). One color: `--dheir-blue` at 40% opacity. No animated map pins bouncing.

### E. Micro-interactions

| Action | Motion |
|--------|--------|
| Primary button hover | Background → `--dheir-blue-hover`, shadow `shadow-lift`, 150ms |
| Primary button active | `scale(0.98)`, 100ms |
| Copy warehouse address | Brief ring pulse green `#059669` 400ms + toast “Copied” |
| Bottom nav switch | Content crossfade 200ms; active indicator **underline slide** with `--dheir-spring-tab` — **no** large red sliding blob |
| Accordion FAQ | Height transition 250ms `ease-out`; chevron rotate 180deg |
| Modal / sheet | `translateY(100%)` → `0` on mobile sheet, 300ms `dheir-ease-out` |

### F. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .blur-reveal,
  .net-lift {
    filter: none;
    transform: none;
    transition: opacity 0.3s ease;
  }
}
```

### Performance rules

- Animate **only** `transform`, `opacity`, `filter` on small node counts  
- No `blur()` on large full-screen layers during scroll  
- No infinite parallax on more than one element per page  

---

## 9. Components

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| **Primary** | `--dheir-blue` | white | none |
| **Secondary** | white | `--dheir-text-primary` | `1px --dheir-border` |
| **Warm** | `--dheir-orange-muted` | `--dheir-orange` | none — rare |
| **Danger** | `--dheir-red` | white | none — payment overdue only |
| **Ghost** | transparent | `--dheir-blue` | none |

### Inputs

- Background: white  
- Border: `1px --dheir-border`  
- Radius: `12px`  
- Font: Satoshi 16px (prevents iOS zoom)  
- Focus: 2px ring `--dheir-focus-ring`  

### Cards

- Background: `--dheir-bg-surface`  
- Radius: `16px`  
- Shadow: `--dheir-shadow-soft`  
- Padding: `16px` mobile / `24px` desktop  

### Chips (status)

- Radius: `full`  
- Padding: `6px 12px`  
- Satoshi 500, 12px  
- Use semantic status background/text pairs from §4  

### Bottom navigation (customer)

- Bar: white, `1px` top border `--dheir-border`, height 72px + safe-area  
- Icons: Tabler 24px  
- Label: Satoshi 11px 500  
- Active: `--dheir-blue` icon + label; inactive: `--dheir-text-muted`  
- Indicator: 2px underline or soft pill behind icon — **not** oversized decorative shape  

### WhatsApp FAB

- Tabler `IconBrandWhatsapp`  
- Brand green `#25D366` acceptable **only** on this FAB  
- Position: fixed bottom-right above nav; shadow soft  
- Does not replace primary site CTAs  

---

## 10. Page-level application

### Public landing `/`

| Element | Typography | Color / surface | Motion |
|---------|------------|---------------|--------|
| Hero headline | Cabinet 800 display-hero | Text primary on `bg-page` or soft wash | blur-reveal stagger |
| Subhead | Satoshi 500 lead | muted | blur-reveal |
| CTAs | Satoshi 600 button | primary + secondary | blur-reveal last |
| How it works band | Section label Satoshi 600 caps; headline Cabinet 700 | full-bleed gradient wash on `100vw` band | blur-reveal on header only |
| Step cards (tall) | Cabinet 600–700 titles; Satoshi body | `dheir-surface` cards in band; large image top | net-lift stagger 60ms |
| Route line motif | — | `--dheir-blue` 40% stroke | dash draw 1.1s on enter |
| FAQ title | Cabinet 700 | primary | blur-reveal once |
| FAQ body | Satoshi 400 body-sm | muted | none |
| Footer | Cabinet brand; Satoshi links | dark `#0a0c10` + map image | none |

### Auth `/auth/*`

| Element | Notes |
|---------|-------|
| Layout | Desktop: split — left brand panel (`hero-wash` + Cabinet quote), right white card form |
| Signup | Show step progress; OTP; post-signup **welcome + customer code + copy warehouse** |
| Motion | Panel headline blur-reveal; form fields static |

### Customer dashboard (post-login home)

| Priority | Content |
|----------|---------|
| 1 | Greeting — Cabinet display-card |
| 2 | **Copy warehouse address** — primary card, Satoshi data, Tabler copy icon |
| 3 | Status summary chips — horizontal scroll |
| 4 | Quick actions 2×2 — net-lift on first paint |
| 5 | Recent activity list — Satoshi body-sm |

### Admin `/admin/*` (phase 2)

- Satoshi-first; Cabinet only in sidebar wordmark  
- Cooler optional page bg `#F4F5F7`  
- Tables: readable 14px, tabular nums — minimal motion  

---

## 11. Voice & microcopy

### Principles

- Short. Verb-first.  
- Benefits over jargon: “Copy warehouse address” not “View warehouse module”.  
- Calm reassurance after actions: “Package registered — we’ll notify you when it arrives.”

### Examples

| Context | Copy |
|---------|------|
| Hero CTA | Get your warehouse address / Create free account |
| Signup | Create your account to ship from China with one tracking place |
| Empty packages | No packages yet — add your first incoming package |
| Payment due | Balance due — pay securely to release shipment |
| Error | Something went wrong — try again or message us on WhatsApp |

### Avoid

- “Successfully successfully…”  
- ALL CAPS blocks of policy text on home  
- 10px legal dumps (legacy pattern)  

---

## 12. Anti-patterns (do not ship)

| Anti-pattern | Why |
|--------------|-----|
| Login as `/` for strangers | Kills conversion |
| Cabinet for 12px table/data text | Illegible |
| `react-icons` mix with Tabler | Inconsistent stroke |
| Red sliding bottom-nav blob (legacy) | Off-brand, playful wrong tone |
| Full-page `#e6f3ff` wash | Cheap, not premium |
| Framer-style fade-up on every element | Ordinary, janky on mobile |
| Blur animation on forms/lists | Motion sickness, performance |
| 3D logo with drop shadow in app header | Dated, fights soft UI |
| More than 2 font families | Broken system |
| Red + blue heroes competing equal weight | Visual noise |
| Tiny step thumbnails or icon-only “how it works” | Breaks logistics-premium story; use tall image-top cards |

---

## 13. Implementation notes (Next.js / Tailwind)

### Fonts

Load via `next/font/local` or Fontshare CDN per project setup. Apply:

- `font-display` → Cabinet on `className` for display tokens  
- `font-sans` → Satoshi as default body on `<body>`  

Remove or demote Geist as default when revamp lands unless used as fallback only.

### Icons

```bash
npm install @tabler/icons-react
```

Import only icons used — tree-shake per route where possible.

### CSS variables

Define tokens in `app/globals.css` under `@theme` (Tailwind v4) matching §4–§6. Migrate legacy `--color-accent-*` usages incrementally.

### Motion

Prefer CSS classes + `IntersectionObserver` in small client components (`"use client"`). Avoid heavy animation libraries unless a specific interaction requires it.

### Files agents should read before UI work

- This document: `VISUAL_IDENTITY.md`  
- Landing IA + section specs: `plan.md` (§7)  
- Product flows: `PROJECT_DOCUMENTATION.md`  
- Tokens + band utilities: `app/globals.css` (e.g. `.how-it-works-band`, `.reviews-marquee`)  
- Marketing components: `components/marketing/*`, `lib/marketing/*`  

---

## 14. Sign-off checklist

Before implementation sprint, client/stakeholder confirms:

- [ ] **Primary accent:** blue-led (recommended) vs orange-led  
- [ ] **Cabinet + Satoshi** approved  
- [ ] **Tabler icons** approved  
- [ ] **Bottom nav:** Home · Packages · Quote · Account (marketplace placement)  
- [ ] **Public landing** at `/` approved  
- [ ] **Motion level:** hero + sections only (no excessive scroll FX)  
- [ ] **Digital logo lockup:** flat wordmark in UI OK with full 3D for print  
- [ ] **Admin phase 2** scope excluded from first quote  

---

## Document history

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-21 | Initial system: Cabinet + Satoshi, Tabler, safety-net UX, logo harmonization, inklin-style blur motion |

---

*This file is the canonical brand + UX spec for the DHEIR International revamp. When in doubt, favor calm clarity over decoration.*
