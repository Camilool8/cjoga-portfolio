---
name: cjoga.cloud
description: José Camilo Joga Guerrero's portfolio and handbook — a senior platform engineer's work, shown on the cluster it runs on.
colors:
  signal-mint: "#64ffda"
  signal-mint-dim: "rgba(100, 255, 218, 0.12)"
  signal-mint-glow: "rgba(100, 255, 218, 0.1)"
  sky-gradient-end: "#38bdf8"
  void: "#06080d"
  deep-space: "#0b0f1a"
  hull: "#111827"
  bulkhead: "#1a2332"
  glass-dark: "rgba(17, 24, 37, 0.72)"
  hairline-dark: "rgba(100, 255, 218, 0.08)"
  rule-dark: "rgba(100, 255, 218, 0.15)"
  starlight: "#e2e8f0"
  moon-gray: "#94a3b8"
  dust-gray: "#8794ab"
  daylight-signal: "#0e7490"
  daylight-signal-ink: "#0b5d73"
  daylight-signal-dim: "rgba(14, 116, 144, 0.1)"
  daylight-gradient-start: "#0f766e"
  daylight-gradient-end: "#0369a1"
  high-altitude: "#f3f6fa"
  stratus: "#edf1f7"
  cloud-white: "#ffffff"
  haze: "#e7ecf3"
  glass-light: "rgba(255, 255, 255, 0.82)"
  hairline-light: "rgba(15, 23, 42, 0.09)"
  rule-light: "rgba(15, 23, 42, 0.17)"
  ink: "#0f172a"
  slate: "#475569"
  graphite: "#4f5b6e"
typography:
  display:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2rem, min(6.4vw, 8vh), 4.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.3
  lede:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Mona Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  tag: "6px"
  pill: "10px"
  base: "12px"
  card: "16px"
  inset: "28px"
  round: "50%"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "32px"
  section-sm: "64px"
  section-lg: "96px"
  container: "64rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-mint}"
    textColor: "{colors.deep-space}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "14px 28px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.signal-mint}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "14px 28px"
  button-outline-hover:
    backgroundColor: "{colors.signal-mint-dim}"
    textColor: "{colors.signal-mint}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.moon-gray}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  nav-link-active:
    backgroundColor: "{colors.signal-mint-dim}"
    textColor: "{colors.signal-mint}"
  chip-period:
    backgroundColor: "{colors.signal-mint-dim}"
    textColor: "{colors.signal-mint}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  chip-tech:
    backgroundColor: "{colors.bulkhead}"
    textColor: "{colors.moon-gray}"
    rounded: "{rounded.tag}"
    padding: "3px 8px"
  card-timeline:
    backgroundColor: "{colors.hull}"
    rounded: "{rounded.card}"
    padding: "28px"
  card-pillar:
    backgroundColor: "{colors.hull}"
    rounded: "{rounded.base}"
    padding: "14px 16px 16px"
---

# Design System: cjoga.cloud

## Overview

**Creative North Star: "The Quiet Orbit"**

The site is a view from orbit at night. A planet limb, banded rings, dotted orbits and slow satellites move behind the page, and the work sits in front of them in plain, confident type. The motion is there to give depth and a sense of place. It never carries information, never competes with the copy, and stops cleanly when the visitor asks for reduced motion.

Density is low and composed. One centered column (64rem) carries the content; sections size to their content, and a thin scroll-scrubbed hairline marks the pause between them. Structure comes from 1px rules and tonal steps between near-black surfaces, after Linear: hairline grids instead of floating cards, two-tone headings where a claim in full ink continues in a muted tone, short captions under real product views. One full-bleed dark chapter opens a window onto the live cluster and terminal. Mint is the only accent, used for what is live or actionable.

The light theme keeps the same world in daylight rather than switching to paper. The ground is a cool tinted blue-gray, cards are white and lift on soft offset shadows, the accent deepens to a teal from the same family as the mint, and the dark chapter becomes an inset panel. The lineage is Brittany Chiang's v4 portfolio, refined. The "Launch webcast" replacement world was rejected and does not return.

**Key Characteristics:**
- Orbital scene behind the hero: graphics and motion only, no labels or data.
- Two-tone headings, hairline grids, figure captions.
- Mona Sans for everything readable; JetBrains Mono only for real code, prompts and CLI output.
- Single mint accent (#64ffda dark, #0e7490 light) on near-black or tinted-daylight grounds.
- Tonal layering in dark; soft offset shadows in light.
- Long, decelerating easing (expo-out) on every reveal and hover.

## Colors

Near-black space blues with one cool signal accent; daylight inverts the grounds and deepens the accent without leaving the world.

### Primary
- **Signal Mint** (#64ffda): the dark theme's only accent. Links, the primary button, the status dot, the terminal prompt, focus rings, active nav pills and the planet's rim light. It marks what is live or actionable.
- **Daylight Signal** (#0e7490): the light theme's accent, a teal from the mint's family. Same roles as Signal Mint.
- **Daylight Signal Ink** (#0b5d73): accent text on the dim accent fill in light theme (period chips, active nav pills), where #0e7490 would fall below 4.5:1. In dark, Signal Mint already clears it.
- **Signal Mint Dim** (rgba(100, 255, 218, 0.12)) and **Daylight Signal Dim** (rgba(14, 116, 144, 0.1)): the tinted fill behind active pills, period chips and outline-button hover.
- **Accent gradient**: Signal Mint to Sky (#38bdf8) in dark; #0f766e to #0369a1 in light, at 135°.

### Neutral (dark theme, default)
- **Void** (#06080d): page ground and hairline-grid cell fill.
- **Deep Space** (#0b0f1a): text on the mint button; the hero's gradient base.
- **Hull** (#111827): card and pillar surface; hover fill for project and cert cards.
- **Bulkhead** (#1a2332): the raised step: tech tags, the skip link, scrollbar thumb base.
- **Glass Dark** (rgba(17, 24, 37, 0.72)): the floating nav, under a 14–20px backdrop blur.
- **Hairline Dark** (rgba(100, 255, 218, 0.08)) and **Rule Dark** (rgba(100, 255, 218, 0.15)): card borders and list rules, and the stronger rule for outline buttons and the scrolled nav.
- **Starlight** (#e2e8f0): primary text.
- **Moon Gray** (#94a3b8): secondary text, ledes, nav links.
- **Dust Gray** (#8794ab): tertiary text: the muted half of two-tone headings, captions, list paths.

### Neutral (light theme, "daylight from orbit")
- **High Altitude** (#f3f6fa): page ground. A tinted blue-gray, never flat white.
- **Stratus** (#edf1f7): the secondary ground.
- **Cloud White** (#ffffff): card surface. Cards lift off the tinted ground.
- **Haze** (#e7ecf3): the raised step (tags).
- **Glass Light** (rgba(255, 255, 255, 0.82)): the floating nav.
- **Hairline Light** (rgba(15, 23, 42, 0.09)) and **Rule Light** (rgba(15, 23, 42, 0.17)): borders and rules in slate, not in accent.
- **Ink** (#0f172a), **Slate** (#475569), **Graphite** (#4f5b6e): primary, secondary and tertiary text. Graphite replaces the shared #64748b, which read 4.34:1 on surfaces.

### Named Rules
**The One Signal Rule.** Mint (teal in daylight) is the only accent, and it means "live or actionable". Nothing decorative is mint except the planet's rim light and orbit dashes.

**The Always-Dark Chapter Rule.** The homelab and terminal chapter pins the dark palette in both themes. In light it becomes an inset dark panel with a clean edge, not a fade from white.

**The Paired Theme Rule.** Every pair must clear WCAG AA in both themes; `npm run contrast:check` is the gate.

## Typography

**Display Font:** Mona Sans (with -apple-system, BlinkMacSystemFont, sans-serif), self-hosted variable font, weight 200–900, width 75–125%.
**Body Font:** Mona Sans.
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, monospace), weight 400–700.

**Character:** One family at every size, so hierarchy comes from weight, width and tone rather than a change of voice. The display name stretches to 125% width at weight 800 and reads like a mission patch; everything below it is plain and even. Mono is reserved for real code: it signals "this came from a machine".

### Hierarchy
- **Display** (800, 125% width, clamp(2rem, min(6.4vw, 8vh), 4.75rem), 1.05): the hero name only. The surname carries the accent gradient, and the words arrive one by one with a short blur.
- **Headline** (700, clamp(1.75rem, 3.6vw, 2.75rem), 1.1, -0.03em, balanced): section headings, written as a two-tone sentence.
- **Title** (700, 1.2rem): card titles (roles, projects). The hero role line runs larger (600, clamp(1.2rem, 3.5vw, 2.2rem)) in Moon Gray.
- **Lede** (400, 1.0625rem, 1.7, max 62ch, pretty wrap): the paragraph under a section heading. The hero lede runs 1.2rem at 1.55, max 560px.
- **Body** (400, 1rem, 1.6): running text; card copy steps down to 0.86rem at 1.65.
- **Label** (400–500, 0.8–0.8125rem): buttons, nav links, figure captions, period chips, status lines. Tech tags are the floor at 0.75rem.
- **Mono** (400, 0.85rem): the `~/camilo $ whoami` prompt, the terminal, CLI output and code blocks.

### Named Rules
**The Two-Tone Rule.** A section heading is one sentence: the claim in full ink, the continuation in the tertiary tone. Never two stacked headings.

**The Mono-Means-Machine Rule.** JetBrains Mono appears only where the text is real code, a prompt or command output. Never for eyebrows, labels or decoration.

**The 12px Floor Rule.** No text below 0.75rem (12px).

## Layout

A single centered column, max 64rem (`max-w-5xl`), with gutters of 16px, 24px from 640px and 32px from 1024px. The gutters grow with `env(safe-area-inset-*)` on notched phones in landscape. Sections pad 64px vertically, 96px from 768px, and size to their content; nothing fills the viewport just to fill it. Between sections a 48–64px band holds a 1px gradient hairline that scales in and fades out with scroll, with a 4px mint dot at its center.

The hero keeps its copy in a left column of at most 600px so the orbits read on the right half of the viewport. Below 760px the planet becomes a horizon in a 240px band reserved under the copy, so text never sits over motion, and the actions go full-width. Phones in landscape (height ≤ 500px) tighten the stack so the CV button stays in the first screen.

The dark chapter is full-bleed and at least 100svh, with a two-column grid (0.9fr copy, 1.1fr terminal, gap clamp(32px, 5vw, 72px)); copy and CTA stack on the left and the terminal spans both rows from 961px, collapsing to one column below. The handbook band and the contact close are two-column from 1024px and 860px respectively. Lists use 1px top and bottom rules with 64px rows rather than cards. Touch targets are at least 44px on coarse pointers.

## Elevation & Depth

In dark, depth is tonal: Void, Hull and Bulkhead step upward, separated by mint-tinted hairlines, and the orbital scene behind the hero gives the page its sense of distance. Shadows appear only as a response (a mint glow under a hovered primary button). In light, white cards on the tinted ground carry a soft two-layer offset shadow so they lift instead of relying on a hairline alone. Glass is used once, for the floating nav.

### Shadow Vocabulary
- **Signal glow** (`box-shadow: 0 8px 30px var(--accent-glow)`): primary button hover, with a 2px lift.
- **Daylight lift** (`box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 32px -18px rgba(15, 23, 42, 0.22)`): timeline cards and hairline grids, light theme only.
- **Chapter inset** (`box-shadow: 0 30px 60px -30px rgba(2, 6, 23, 0.45)`): the dark chapter panel in light theme.
- **Film grain**: a 7% fractal-noise overlay on the hero frame, `mix-blend-mode: overlay`.

### Named Rules
**The Flat-At-Night Rule.** In dark, surfaces are flat at rest; depth comes from tone and the scene, never from drop shadows.

## Shapes

Gently rounded and consistent. 12px is the default corner (buttons, hairline grids, hero pillars), 16px for larger containers (timeline cards, the nav), 10px for nav pills and the skip link, 6px for chips and tags. The light-theme chapter panel rounds to 28px. Status and timeline dots are full circles. Borders are always 1px; the only 2px line is the focus ring, offset 2–3px (inset -2px inside clipped grids). Dashed 1px underlines mark the hero's terminal link.

## Components

Composed and precise: components announce state with tone and a small lift, never with bounce or color floods.

### Buttons
- **Shape:** gently rounded (12px), padding 14px 28px, label type at 0.8rem / 500, icon gap 8px.
- **Primary:** Signal Mint fill with Deep Space text. The one primary action per screen (Download CV).
- **Hover / Focus:** 2px lift plus signal glow over 0.3s expo-out; focus is a 2px accent ring offset 3px.
- **Outline:** transparent with a Rule border and accent text; on hover the fill goes to the dim accent, the border to full accent, with the same 2px lift.
- **Contact variant:** centered label, min height 52px, 0.95rem.

### Chips
- **Period chip:** dim accent fill, accent-ink text, 0.8rem tabular numerals, 6px corners. Dates on experience cards.
- **Tech tag:** Bulkhead fill, Moon Gray text, Hairline border, 0.75rem, 6px corners. On card hover the border strengthens and the text goes to full ink.

### Cards / Containers
- **Timeline card:** Hull fill, Hairline border, 16px corners, 24–28px padding; Cloud White with the daylight lift in light.
- **Hairline grid:** cells separated by 1px rules drawn as outlines into a 1px gap, inside a 12px rounded, clipped frame. Cells fill with Void; a cell that has not revealed yet leaves bare ground.
- **Hero pillar:** Hull fill, Hairline border, 12px corners, title at 0.9375rem / 700 over 0.875rem secondary text. Hidden on phones.

### Navigation
- **Style:** a floating glass pill, centered and fixed at max(1rem, safe-area top), 16px corners, 6px × 8px padding. The border strengthens from Hairline to Rule and a shadow appears once the page scrolls.
- **Links:** 0.8rem / 500 Moon Gray, 8px × 12px, 10px corners. Hover and active fill with the dim accent and switch to accent-ink.
- **Tablet (768–1023px):** condensed pills (0.75rem, 8px padding) so the full nav fits. Below 768px it falls back to a menu with an `inert` drawer.

### Brand Mark ("Orbit C")
A C drawn as an orbit (a 28-unit stroke on a 70-unit ring, round caps, opening ±0.62 rad to the right) with its satellite parked in the gap, in Signal Mint on a Deep Space (#0b0f1a) tile with 58-unit corners on a 256 grid and a 16%-mint hairline edge. Pure geometry: no text element, no gradient. The source is `scripts/brand/mark.svg` (maskable variant: `scripts/brand/maskable.svg`); `npm run brand` renders the favicons, app icons and social cards for both sites. The tile stays dark in the light theme.

### Orbital Hero Scene (signature)
A canvas-rendered planet limb with a mint rim light and halo, banded rings, inclined dotted orbits whose dashes drift, satellites at different periods and probes on transfer arcs, over a parallax starfield and film grain. It reads its colors from the theme tokens, so daylight gets a lighter scene with the same dark planet. Graphics and motion only: no labels, numbers or data.

### Dark Chapter (signature)
The full-bleed, always-dark section for the homelab and the live read-only terminal. It pins the dark palette with `.chapter-dark` in both themes; in light it is a 28px-rounded inset panel with the chapter inset shadow.

### Section Divider
A 40%-wide 1px accent-gradient hairline that scales from 0 to 1 to 0 and peaks at 60% opacity as it crosses the viewport, with a 4px Signal Mint dot at its center. Compositor-only (scaleX, opacity).

### Link List
Handbook and contact lists: rows of at least 64px between 1px Hairline rules, title at 1rem / 600 with a 0.8125rem tertiary path below and an arrow icon that nudges 2px up-right and turns accent on hover.

### UI Shots
Real product views (cluster map, simulator workspace) redrawn as vector UI in the site's palette, sized in em off their container so they scale like an image and stay sharp. Each gets a figure caption at 0.8125rem tertiary.

### Motion
One easing for the whole system: expo-out, `cubic-bezier(0.16, 1, 0.3, 1)`. Scroll reveals rise 40px and fade in over 0.8s, staggered 60ms. The hero name arrives word by word (0.6s, 8px blur, 14px drop), without the blur on touch and narrow screens. Hovers run 0.2–0.4s. Under `prefers-reduced-motion`, every animation lands on its end state at once and reveals render visible.

## Do's and Don'ts

### Do:
- **Do** write section headings as one two-tone sentence: claim in Starlight/Ink, continuation in Dust Gray/Graphite.
- **Do** use 1px hairline rules and tonal steps for structure before reaching for a card.
- **Do** keep mint (teal in daylight) for live or actionable things: links, the primary button, prompts, status, focus.
- **Do** show real artifacts (the cluster, CLI output, a vendor's own logo or dashboard) and caption them.
- **Do** use expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for every transition, and land everything on its end state under reduced motion.
- **Do** keep touch targets at least 44px on coarse pointers and focus rings at 2px accent.
- **Do** underline links in running text at rest (1px, 3px offset, 40% of the link colour; full on hover). Mint and the body ink are too close in lightness for colour alone (WCAG 1.4.1).
- **Do** check both themes; the light theme is daylight from orbit, not a different site.

### Don't:
- **Don't** put labels, numbers or data into the orbital scene, or set copy over its motion on phones.
- **Don't** use a flat paper-white ground in the light theme; the ground is High Altitude (#f3f6fa) and cards are white.
- **Don't** use JetBrains Mono for eyebrows, labels or ornament; it is for real code only.
- **Don't** add a second accent color or spread the accent gradient beyond the hero surname, the section divider and the scroll-progress bar.
- **Don't** use drop shadows in the dark theme at rest.
- **Don't** illustrate vendors or tools with abstract metaphors.
- **Don't** set text below 12px.
- **Don't** bring back the rejected "Launch webcast" world.
