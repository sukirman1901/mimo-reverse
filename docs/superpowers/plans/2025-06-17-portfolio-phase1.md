# Portfolio Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core portfolio website (hero, portfolio grid, about/skills, stats, testimonials, brand collab, YouTube, contact, project detail pages) using the Awesomic design system.

**Architecture:** Astro v5 SSG with 4 React islands for interactive parts (cycling word, portfolio scroll, stats counter, contact form). All content lives in flat JSON files. Tailwind v4 maps the full Awesomic token set via `@theme`.

**Tech Stack:** Astro v5, React, Tailwind v4, TypeScript, Vitest (unit), Playwright (component/e2e optional)

**Scope note:** This plan covers Phase 1 only. Blog + Payload CMS (Phase 2) and e-commerce (Phase 3) are separate sub-projects with their own plans.

---

## File Structure

```
kirman/
├── astro.config.mjs              # Astro + React + Tailwind integration
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── src/
│   ├── styles/global.css         # Tailwind @theme with Awesomic tokens
│   ├── layouts/BaseLayout.astro  # html shell, nav, footer slot
│   ├── lib/
│   │   ├── projects.ts           # load + type projects data
│   │   └── format.ts             # formatStatValue helper
│   ├── data/
│   │   ├── projects.json
│   │   ├── skills.json
│   │   ├── stats.json
│   │   ├── testimonials.json
│   │   └── brands.json
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── HeroCyclingWord.tsx   # React island
│   │   ├── PortfolioGrid.tsx     # React island
│   │   ├── PortfolioTile.astro
│   │   ├── AboutPanel.astro
│   │   ├── StatsCounter.tsx      # React island
│   │   ├── Testimonials.astro
│   │   ├── BrandStrip.astro
│   │   ├── YouTubeSection.astro
│   │   └── ContactForm.tsx       # React island
│   └── pages/
│       ├── index.astro
│       └── projects/[slug].astro
└── tests/
    ├── lib/projects.test.ts
    ├── lib/format.test.ts
    └── components/HeroCyclingWord.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

- [ ] **Step 1: Scaffold Astro project**

Run:
```bash
cd /Users/aaa/Documents/Developer/kirman
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
```
Expected: Astro files created in current directory.

- [ ] **Step 2: Add React + Tailwind integrations**

Run:
```bash
npx astro add react --yes
npm install tailwindcss @tailwindcss/vite
```
Expected: `@astrojs/react` and Tailwind installed; `astro.config.mjs` updated with React.

- [ ] **Step 3: Wire Tailwind v4 Vite plugin into astro.config.mjs**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Run dev server to verify boot**

Run: `npm run dev`
Expected: Server starts at `localhost:4321` with no errors. Stop server after verifying.

- [ ] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold astro + react + tailwind v4"
```

---

## Task 2: Awesomic Design Tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write global.css with full Awesomic @theme**

```css
@import "tailwindcss";

@theme {
  --color-obsidian: #09090b;
  --color-ink: #18181b;
  --color-graphite: #3f3f46;
  --color-slate: #52525b;
  --color-steel: #71717a;
  --color-ash: #a1a1aa;
  --color-pebble: #d4d4d8;
  --color-fog: #ececee;
  --color-mist: #f4f4f5;
  --color-snow: #ffffff;
  --color-ember: #ff5a00;
  --color-orchid-flash: #fe45e2;

  --font-cosmica: 'Cosmica', 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;

  --text-caption: 10px;
  --text-body: 14px;
  --text-body-lg: 16px;
  --text-subheading: 18px;
  --text-heading-sm: 20px;
  --text-heading: 32px;
  --text-heading-lg: 40px;
  --text-display-sm: 56px;
  --text-display: 64px;

  --radius-badge: 12px;
  --radius-input: 14px;
  --radius-card-compact: 28px;
  --radius-card: 36px;
  --radius-hero: 48px;
  --radius-pill: 10000px;

  --shadow-pill: rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px;
  --shadow-md: rgba(0,0,0,0.04) 0px 4px 12px 0px;
}

body {
  background: var(--color-mist);
  color: var(--color-ink);
  font-family: var(--font-cosmica);
}
```

- [ ] **Step 2: Import global.css in a smoke page and verify it loads**

Add `import '../styles/global.css';` to `src/pages/index.astro` frontmatter, put a `<h1 class="text-display-sm text-obsidian">Test</h1>` in the body.

Run: `npm run dev`
Expected: Heading renders at 56px dark on mist background. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add awesomic design tokens"
```

---

## Task 3: Data Layer + Tests

**Files:**
- Create: `src/data/projects.json`, `src/lib/projects.ts`, `src/lib/format.ts`
- Test: `tests/lib/projects.test.ts`, `tests/lib/format.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: vitest in devDependencies.

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node' } });
```

- [ ] **Step 3: Write failing test for format helper**

```ts
// tests/lib/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatStatValue } from '../../src/lib/format';

describe('formatStatValue', () => {
  it('appends suffix to value', () => {
    expect(formatStatValue(20000, '+')).toBe('20,000+');
  });
  it('handles percent suffix', () => {
    expect(formatStatValue(70, '%')).toBe('70%');
  });
  it('handles no suffix', () => {
    expect(formatStatValue(40, '')).toBe('40');
  });
});
```

- [ ] **Step 4: Run test, verify it fails**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: FAIL — cannot find module `format`.

- [ ] **Step 5: Implement format helper**

```ts
// src/lib/format.ts
export function formatStatValue(value: number, suffix: string): string {
  return value.toLocaleString('en-US') + suffix;
}
```

- [ ] **Step 6: Run test, verify pass**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Create projects.json with sample data**

```json
[
  {
    "slug": "sample-app",
    "title": "Sample App",
    "category": ["Web App"],
    "client": "Acme",
    "thumbnail": "/images/projects/sample-thumb.webp",
    "images": ["/images/projects/sample-1.webp"],
    "description": "A sample project.",
    "techStack": ["Astro", "React", "TypeScript"],
    "role": "Full-stack Developer",
    "year": 2024,
    "liveUrl": "https://example.com",
    "featured": true
  }
]
```

- [ ] **Step 8: Write failing test for projects loader**

```ts
// tests/lib/projects.test.ts
import { describe, it, expect } from 'vitest';
import { getAllProjects, getFeaturedProjects, getProjectBySlug } from '../../src/lib/projects';

describe('projects', () => {
  it('loads all projects', () => {
    expect(getAllProjects().length).toBeGreaterThan(0);
  });
  it('filters featured projects', () => {
    expect(getFeaturedProjects().every(p => p.featured)).toBe(true);
  });
  it('finds project by slug', () => {
    expect(getProjectBySlug('sample-app')?.title).toBe('Sample App');
  });
  it('returns undefined for unknown slug', () => {
    expect(getProjectBySlug('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 9: Run test, verify fail**

Run: `npx vitest run tests/lib/projects.test.ts`
Expected: FAIL — cannot find module `projects`.

- [ ] **Step 10: Implement projects loader**

```ts
// src/lib/projects.ts
import data from '../data/projects.json';

export interface Project {
  slug: string;
  title: string;
  category: string[];
  client: string;
  thumbnail: string;
  images: string[];
  description: string;
  techStack: string[];
  role: string;
  year: number;
  liveUrl?: string;
  featured: boolean;
}

const projects = data as Project[];

export function getAllProjects(): Project[] {
  return projects;
}
export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
```

- [ ] **Step 11: Run test, verify pass**

Run: `npx vitest run tests/lib/projects.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 12: Add remaining data files**

Create `skills.json`, `stats.json`, `testimonials.json`, `brands.json` with 2-3 sample entries each. Shapes:
- skills: `{ "category": string, "items": string[] }[]`
- stats: `{ "value": number, "suffix": string, "label": string }[]`
- testimonials: `{ "quote": string, "name": string, "role": string, "avatar": string, "ycBatch": string | null }[]`
- brands: `{ "name": string, "logo": string, "url": string }[]`

- [ ] **Step 13: Commit**

```bash
git add -A && git commit -m "feat: data layer with projects, stats, testimonials"
```

---

## Task 4: Base Layout + Navbar + Footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write Navbar.astro**

Sticky bar, ~40px tall, transparent → mist on scroll (small inline script toggles a class). Inline links About/Projects/Blog/Contact. Right edge: Obsidian pill button.

```astro
---
const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];
---
<nav id="nav" class="sticky top-0 z-50 flex items-center justify-between px-6 py-3 transition-colors duration-200">
  <a href="/" class="font-cosmica text-body-lg font-semibold text-obsidian">Kirman</a>
  <div class="hidden md:flex items-center gap-6">
    {links.map(l => <a href={l.href} class="font-cosmica text-body text-ink hover:opacity-70 transition-opacity">{l.label}</a>)}
    <a href="#contact" class="rounded-[36px] bg-obsidian px-4 py-3 text-snow text-body font-medium" style="box-shadow: var(--shadow-pill)">Book demo</a>
  </div>
</nav>
<script>
  const nav = document.getElementById('nav');
  const onScroll = () => nav?.classList.toggle('bg-mist/80', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
</script>
```

- [ ] **Step 2: Write Footer.astro with social links**

Contact section: GitHub, LinkedIn, Twitter/X, YouTube, email. Outlined White Button for email CTA (white bg, `#3f3f46` border + text, 36px radius).

- [ ] **Step 3: Write BaseLayout.astro**

```astro
---
import '../styles/global.css';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
const { title = 'Kirman — Portfolio' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body class="font-cosmica">
    <Navbar />
    <main class="mx-auto max-w-[1200px] px-6"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: Verify layout renders**

Update `index.astro` to use BaseLayout. Run: `npm run dev`
Expected: Nav + footer visible, max-width 1200px centered. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: base layout, navbar, footer"
```

---

## Task 5: Hero + Cycling Word Island

**Files:**
- Create: `src/components/Hero.astro`, `src/components/HeroCyclingWord.tsx`
- Test: `tests/components/HeroCyclingWord.test.tsx`

- [ ] **Step 1: Install React testing deps**

Run: `npm install -D @testing-library/react @testing-library/jest-dom jsdom`

- [ ] **Step 2: Add jsdom env to vitest config**

Update `vitest.config.ts`: set `environment: 'jsdom'` (or per-file `// @vitest-environment jsdom`).

- [ ] **Step 3: Write failing test for HeroCyclingWord**

```tsx
// tests/components/HeroCyclingWord.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroCyclingWord from '../../src/components/HeroCyclingWord';

describe('HeroCyclingWord', () => {
  it('renders the first word initially', () => {
    render(<HeroCyclingWord words={['build', 'design', 'ship']} />);
    expect(screen.getByText('build')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run test, verify fail**

Run: `npx vitest run tests/components/HeroCyclingWord.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement HeroCyclingWord.tsx**

```tsx
import { useEffect, useState } from 'react';

export default function HeroCyclingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % words.length), 3000);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <span
      className="text-ash transition-opacity duration-300"
      style={{ color: 'var(--color-ash)' }}
    >
      {words[i]}
    </span>
  );
}
```

- [ ] **Step 6: Run test, verify pass**

Run: `npx vitest run tests/components/HeroCyclingWord.test.tsx`
Expected: PASS.

- [ ] **Step 7: Write Hero.astro (2-column)**

Left: display headline 56-64px weight 700 with `<HeroCyclingWord client:load words={[...]} />` inline. Right: body 16px, email input (snow bg, 14px radius, placeholder `#a1a1aa`) + Obsidian pill button in a flex row.

- [ ] **Step 8: Verify hero renders + word cycles**

Run: `npm run dev`. Open browser, confirm accent word swaps every ~3s, layout is 2-column on desktop, stacks on mobile. Stop server.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: hero section with cycling accent word"
```

---

## Task 6: Portfolio Grid + Tile

**Files:**
- Create: `src/components/PortfolioTile.astro`, `src/components/PortfolioGrid.tsx`

- [ ] **Step 1: Write PortfolioTile.astro**

36px-radius container clipping full-bleed thumbnail. Bottom-left overlay: title 20px weight 600 white + category badges (transparent bg, white text, `border rgba(255,255,255,0.3)`, 12px radius, 4px 8px padding). Accept a `decorative` prop that swaps bg to `#fe45e2` when no image.

```astro
---
import type { Project } from '../lib/projects';
const { project } = Astro.props as { project: Project };
---
<a href={`/projects/${project.slug}`} class="relative block w-[320px] shrink-0 overflow-hidden rounded-[36px] aspect-[3/4]">
  <img src={project.thumbnail} alt={project.title} class="h-full w-full object-cover" />
  <div class="absolute bottom-4 left-4">
    <h3 class="text-heading-sm font-semibold text-snow">{project.title}</h3>
    <div class="mt-2 flex gap-2">
      {project.category.map(c => (
        <span class="rounded-[12px] border border-white/30 px-2 py-1 text-caption font-medium text-snow">{c}</span>
      ))}
    </div>
  </div>
</a>
```

- [ ] **Step 2: Write PortfolioGrid.tsx (horizontal scroll island)**

Horizontal flex row, `overflow-x-auto`, CSS scroll-snap, drag-to-scroll via pointer events. Accepts pre-rendered tiles as children (`client:visible`). Auto-scroll loop optional, pauses on hover/drag.

```tsx
import { useRef } from 'react';

export default function PortfolioGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // pointer drag handlers update scrollLeft
  return (
    <div ref={ref} className="flex gap-6 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] [&>*]:[scroll-snap-align:start]">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Wire grid into index.astro**

Map `getFeaturedProjects()` → `<PortfolioTile>` inside `<PortfolioGrid client:visible>`.

- [ ] **Step 4: Verify grid scrolls**

Run: `npm run dev`. Confirm horizontal scroll + drag works, tiles have 36px radius, badges overlay correctly. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: portfolio horizontal scroll grid"
```

---

## Task 7: About/Skills Dark Panel

**Files:**
- Create: `src/components/AboutPanel.astro`

- [ ] **Step 1: Write AboutPanel.astro**

`#09090b` bg, 36px radius, 28px padding. Bullet rows with inline weight contrast: lead-in `#a1a1aa` weight 400, key phrase white weight 600. Skill badges below: dark filled `#3f3f46` bg, `#fafafa` text, 12px radius. Pull from `skills.json`.

- [ ] **Step 2: Verify panel renders**

Run: `npm run dev`. Confirm dark panel, inline weight contrast visible, skill badges styled. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: about/skills dark panel"
```

---

## Task 8: Stats Counter Island

**Files:**
- Create: `src/components/StatsCounter.tsx`

- [ ] **Step 1: Write StatsCounter.tsx**

Animates number 0 → target on viewport entry (IntersectionObserver). Spring easing for the count. Numeral 40px weight 700 `#09090b`, descriptor 13px weight 400 `#71717a`. Uses `formatStatValue`. No card border.

```tsx
import { useEffect, useRef, useState } from 'react';
import { formatStatValue } from '../lib/format';

export default function StatsCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / 1200, 1);
        setN(Math.round(value * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref}>
      <div className="text-heading-lg font-bold text-obsidian">{formatStatValue(n, suffix)}</div>
      <div className="mt-1 text-steel" style={{ fontSize: '13px' }}>{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Wire stats row into index.astro**

Map `stats.json` → `<StatsCounter client:visible ... />` in a 4-col flex/grid on mist bg.

- [ ] **Step 3: Verify count animates on scroll**

Run: `npm run dev`. Scroll to stats, confirm numbers count up once. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: animated stats counter"
```

---

## Task 9: Testimonials + Brand Strip + YouTube

**Files:**
- Create: `src/components/Testimonials.astro`, `src/components/BrandStrip.astro`, `src/components/YouTubeSection.astro`

- [ ] **Step 1: Write Testimonials.astro**

White cards (`#ffffff`, 36px radius, 28px padding) in 2-3 col grid. Avatar, quote, name, role. If `ycBatch` present, render Ember badge (`#ff5a00` bg, white text, 12px radius, weight 600).

- [ ] **Step 2: Write BrandStrip.astro**

Continuous horizontal logo ticker on `#09090b` strip. CSS keyframe `reverseloop` (~30s linear infinite). Pull from `brands.json`.

```astro
<style>
  @keyframes reverseloop { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .ticker { animation: reverseloop 30s linear infinite; }
</style>
```

- [ ] **Step 3: Write YouTubeSection.astro**

White card 36px radius. Latest video thumbnail + link out. Title + channel name.

- [ ] **Step 4: Wire all three into index.astro**

- [ ] **Step 5: Verify rendering**

Run: `npm run dev`. Confirm testimonial cards, scrolling brand logos, YouTube card. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: testimonials, brand strip, youtube section"
```

---

## Task 10: Contact Form Island

**Files:**
- Create: `src/components/ContactForm.tsx`

- [ ] **Step 1: Write ContactForm.tsx**

Email input (snow bg, 14px radius, placeholder `#a1a1aa`) + Obsidian pill submit button. Local form state, basic validation (non-empty + email regex). On submit: show success message (no backend yet — log to console / TODO Phase later). Wire into Footer contact section.

```tsx
import { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return sent ? (
    <p className="text-body text-ink">Thanks — I'll be in touch.</p>
  ) : (
    <form
      className="flex gap-2"
      onSubmit={e => { e.preventDefault(); if (valid) setSent(true); }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="rounded-[14px] bg-snow px-4 py-3 text-body text-ink"
      />
      <button type="submit" disabled={!valid} className="rounded-[36px] bg-obsidian px-4 py-3 text-snow text-body font-medium disabled:opacity-50" style={{ boxShadow: 'var(--shadow-pill)' }}>
        Send
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify form validates + shows success**

Run: `npm run dev`. Enter invalid then valid email, confirm button enable/disable + success message. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: contact form island"
```

---

## Task 11: Project Detail Pages

**Files:**
- Create: `src/pages/projects/[slug].astro`

- [ ] **Step 1: Write [slug].astro with getStaticPaths**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getAllProjects, getProjectBySlug } from '../../lib/projects';

export function getStaticPaths() {
  return getAllProjects().map(p => ({ params: { slug: p.slug } }));
}
const { slug } = Astro.params;
const project = getProjectBySlug(slug!)!;
---
<BaseLayout title={`${project.title} — Kirman`}>
  <section class="py-20">
    <h1 class="text-display-sm font-bold text-obsidian">{project.title}</h1>
    <div class="mt-4 flex gap-2">
      {project.category.map(c => <span class="rounded-[12px] bg-graphite px-2 py-1 text-caption text-snow">{c}</span>)}
    </div>
    <p class="mt-2 text-steel text-body">{project.client} · {project.year}</p>
  </section>
  {project.images.map(src => (
    <img src={src} alt={project.title} class="mb-6 w-full rounded-[36px]" />
  ))}
  <section class="py-12">
    <p class="text-body-lg text-ink">{project.description}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      {project.techStack.map(t => <span class="rounded-[12px] bg-graphite px-2 py-1 text-caption text-snow">{t}</span>)}
    </div>
    {project.liveUrl && (
      <a href={project.liveUrl} class="mt-6 inline-block rounded-[36px] border border-graphite bg-snow px-5 py-3 text-graphite text-body">View Live Site</a>
    )}
    <a href="/#projects" class="mt-6 ml-3 inline-block rounded-[36px] border border-graphite bg-snow px-5 py-3 text-graphite text-body">Back to All Projects</a>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify detail page builds**

Run: `npm run dev`. Visit `/projects/sample-app`, confirm hero, images, description, tech badges, CTAs. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: project detail pages"
```

---

## Task 12: Responsive Polish + Build Verification

**Files:**
- Modify: `src/components/*` (responsive classes), `src/pages/index.astro`

- [ ] **Step 1: Add mobile breakpoints**

Hero → single column, display 40px on mobile. Nav → hamburger with dark slide-in panel. Portfolio grid → touch scroll, no auto-scroll. Stats → 2-col on mobile.

- [ ] **Step 2: Verify responsive in browser**

Run: `npm run dev`. Test at 375px, 768px, 1280px widths. Confirm no overflow, readable text, working nav. Stop server.

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: Build succeeds, no type errors, static output in `dist/`.

- [ ] **Step 5: Preview production build**

Run: `npm run preview`. Smoke-test homepage + one project page. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: responsive polish + build verification"
```

---

## Self-Review Notes

- **Spec coverage:** Hero (T5), Portfolio grid (T6), About/Skills (T7), Stats (T8), Testimonials/Brand/YouTube (T9), Contact/Social (T4 footer + T10 form), Project detail (T11), Navigation (T4), Motion (T5/T6/T8/T9), Data models (T3), Design tokens (T2). All Phase 1 spec sections mapped.
- **Out of scope (separate plans):** Blog + Payload CMS (Phase 2), e-commerce (Phase 3).
- **Cosmica font:** Substitute DM Sans is wired into the token stack. If the real Cosmica font files are obtained, add `@font-face` in global.css — no other changes needed.
