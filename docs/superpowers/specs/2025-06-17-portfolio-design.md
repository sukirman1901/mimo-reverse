# Portfolio Website — Design Spec

## Overview

Personal portfolio website for a programmer, using the Awesomic design system (rounded midnight marketplace aesthetic). Built progressively: Phase 1 = core portfolio, Phase 2 = blog + CMS, Phase 3 = e-commerce.

## Design System

Full Awesomic design system applied via Tailwind v4 `@theme` block. Key tokens:

- **Colors:** Obsidian `#09090b`, Ink `#18181b`, Graphite `#3f3f46`, Slate `#52525b`, Steel `#71717a`, Ash `#a1a1aa`, Pebble `#d4d4d8`, Fog `#ececee`, Mist `#f4f4f5`, Snow `#ffffff`, Ember `#ff5a00`, Orchid Flash `#fe45e2`
- **Typeface:** Cosmica (weights 300-700), substitute: DM Sans / Plus Jakarta Sans
- **Radii:** Cards 36px, Pill 10000px, Badges 12px, Buttons 36px/14-16px, Inputs 14px
- **Spacing:** 4px base, scale up to 120px. Section gap 80px. Card padding 24-28px
- **Shadows:** Multi-layer pill button shadow, subtle inset card borders, md drop shadow
- **Surfaces (4-step):** Canvas `#f4f4f5`, Card White `#ffffff`, Card Muted `#ececee`, Dark `#09090b`

## Approach

**Progressive (recommended):** Phase 1 first (hero, portfolio grid, about/skills, stats, contact, testimonials, brand collab, YouTube, project details). Phase 2 = Payload CMS + blog. Phase 3 = built-in e-commerce via Stripe.

## Architecture

### Tech Stack
- Astro v5 (SSG)
- React islands for interactive components
- Tailwind v4 with Awesomic `@theme` tokens
- TypeScript

### Project Structure
```
kirman/
├── src/
│   ├── components/          # React interactive islands
│   │   ├── Hero.astro
│   │   ├── HeroCyclingWord.tsx
│   │   ├── PortfolioGrid.tsx
│   │   ├── StatsCounter.tsx
│   │   ├── ContactForm.tsx
│   │   └── Navbar.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── projects/[slug].astro
│   ├── styles/
│   │   └── awesomic.css
│   ├── data/
│   │   ├── projects.json
│   │   ├── skills.json
│   │   ├── stats.json
│   │   ├── testimonials.json
│   │   └── brands.json
│   └── assets/
│       └── images/
├── public/
├── astro.config.mjs
├── tailwind.config.mjs       # Tailwind v4 @theme
├── package.json
```

### React Islands (JS-enabled)
Only 4 components need client-side JavaScript:
1. **HeroCyclingWord.tsx** — cycles through 3-4 words, opacity fade
2. **PortfolioGrid.tsx** — horizontal scroll + drag interaction, auto-scroll loop
3. **StatsCounter.tsx** — number animation on viewport entry (spring easing)
4. **ContactForm.tsx** — form state + (future) API submission

Everything else: static Astro components, zero JS.

## Page Layout

### Navigation
- Sticky top bar, ~40px height. Transparent initially, `#f4f4f5` on scroll
- Inline links: About, Projects, Blog, Contact
- Pill CTA button right edge (Obsidian `#09090b`)
- Mobile: hamburger → dark slide-in panel
- `backdrop-filter: blur(5-17px)` for frosted scroll state

### Hero — 2-column split
- **Left:** Display 56-64px Cosmica weight 700 `#09090b`. One cycling accent word `#a1a1aa` via React island.
- **Right:** Body 16px `#18181b`. Email input (Snow, 14px radius). Pill CTA button.
- Mobile: single column, display scales to 40px.

### Portfolio Grid — Horizontal scroll
- Tall 36px-radius tiles, full-bleed screenshots
- Dark overlay badges bottom-left (transparent + white text + border `rgba(255,255,255,0.3)`, 12px radius)
- One tile may use `#fe45e2` decorative wash
- Auto-scroll loop (8-50s linear), CSS scroll-snap + drag via React island
- Mobile: touch scroll, no auto-scroll

### About/Skills — Dark Panel
- `#09090b` background, 36px radius
- Inline weight contrast: lead-in `#a1a1aa` weight 400, key phrase `#ffffff` weight 600
- Skill badges: dark filled `#3f3f46` background, `#fafafa` text, 12px radius

### Stats — Mist canvas
- 4 stat blocks inline
- Numerals 40px weight 700 `#09090b`, descriptor 13px weight 400 `#71717a`
- No card borders

### Testimonials — White cards
- `#ffffff`, 36px radius, 28px padding
- Avatar, quote, name, role
- Optional Ember badge for YC affiliation

### Brand Collaboration — Logo strip
- Horizontal scrolling logos, continuous ticker (`reverseloop`)
- `#09090b` background strip

### YouTube Embed
- Latest video thumbnail + link
- White card, 36px radius

### Contact/Social — Footer
- GitHub, LinkedIn, Twitter/X, YouTube, email
- Outlined White Button for email CTA

## Data Models

### projects.json
```json
{
  "slug": "string",
  "title": "string",
  "category": ["string"],
  "client": "string",
  "thumbnail": "/images/projects/...webp",
  "images": ["string"],
  "description": "string",
  "techStack": ["string"],
  "role": "string",
  "year": number,
  "liveUrl": "string?",
  "featured": boolean
}
```
Other data files follow similar flat-JSON patterns for skills, stats, testimonials, and brands.

## Project Detail Page (`/projects/[slug]`)
- **Hero:** Title 56px, category badges, client name
- **Images:** 36px radius, stacked vertically (Astro image optimization → .webp)
- **Description:** Body 16px, tech stack badges, role, timeline
- **Dark panel:** Challenges/approach — inline weight contrast
- **CTA:** Outlined White Button "View Live Site" / "Back to All Projects"

## Motion & Animation

| Element | Pattern | Duration | Easing |
|---------|---------|----------|--------|
| Cycling word | opacity fade | 0.3s, 3s interval | ease |
| Portfolio scroll | CSS scroll-snap + drag | 8-50s loop | linear |
| Brand ticker | CSS continuous | 30s loop | linear |
| Stats counter | num 0→target on viewport | 0.35s | spring (0.175, 0.885, 0.32, 1.275) |
| Button hover | translateY(-1px) | 0.2s | ease |
| Card hover | scale(1.01) | 0.2s | ease |
| Badge hover | opacity shift | 0.2s | ease |

**Never** animate `background-color` or `color`. Transform + opacity only.

## Future Phases

### Phase 2 — Blog + Payload CMS
- CMS integration replaces JSON data sources
- Blog pages under `/blog/` with Payload headless CMS
- Blog post types: title, body, cover image, tags, published date

### Phase 3 — E-commerce
- Digital product storefront
- Stripe payment integration
- Cart state (React island or Zustand)
- Order management

## Do's and Don'ts (Awesomic)

### Do
- 36px radius primary cards and portfolio tiles
- Multi-layer shadow on primary pill button only
- Ember/Orchid Flash for badges only (max 2-3 uses per page)
- Cosmica weight contrast on same line (300-400 lead-in, 600-700 keyword)
- Backdrop-filter blur on overlays

### Don't
- No chromatic CTA color (only `#09090b` filled)
- No card radius below 28px
- No second typeface
- No drop shadows on cards (use bg color steps)
- No letter-spacing overrides
- No text on Orchid Flash decorative wash at body size
