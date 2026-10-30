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

**Handbook: one right edge.** Everything in a handbook article sits on the prose measure (36em, through the registered `--prose-measure`): prose, headings, code, tables, callouts, diagrams, components, the author sign-off and the prev/next pagination. There is no exception: a diagram drawn wider than the measure fits its card and opens full size in the lightbox. Grids inside the article (credentials, courses) size their columns from their own width, not the viewport.

**Handbook: article top on phones and tablets (<997px).** The breadcrumb is the way up, not a second title: the current page is dropped, the parents keep to one line (44px crumbs on touch), and phones drop the section crumb of a deep trail. The dateline is one compact line, "May 12, 2026 · Updated Jul 5, 2026 · 6 min read", with "Published" kept for screen readers only. "On this page" comes after the intro, right before the first section, as a hairline-framed 44px row in real DOM order. Code blocks scroll long lines; the edge that hides code fades, as diagrams do, and the scrollbar strip stays solid. A copied block confirms for two seconds: the button holds its check, a "Copied" label sits beside it, and one shared polite live region says "Copied to clipboard".

**Handbook: names.** "Lab" names only the exam labs; the K3s cluster is the "Homelab" in every label (sidebar, menus, reader paths, hub cards, titles, social cards), while its URLs stay under /engineering/lab. Menu items, sidebar labels, reader-path rows and hub cards use the exact title of the page they open; a gloss lives in the hub's description, never in the label. From 997px the doc sidebar narrows with the window, 232px at 1024px up to 300px at 1280px (`--doc-sidebar-width`), so the measure keeps ≥480px at 1024px; on touch its rows and carets are 44px.

**Handbook: the article frame.** From 997px every doc page lays out on the same tracks: a lead margin, the measure (36em at 1.0625rem), a `clamp(2rem, 3.5vw, 4rem)` gap and a 13–14rem "On this page" track. The lead centres measure plus TOC as one unit, so the text and the TOC each hold one x per viewport on every page. Below 997px the measure is centred. A section index whose trail would be only the home icon shows no breadcrumb (its title keeps the trail's height above it). Inline code in an article's first paragraph and the landing lede is mono with no fill or frame; body inline code keeps its chip. Below 600px article prose runs at 1.65. The pull quote sits on the column's left edge between its hairlines, its opening mark hung into the margin. In print the author sign-off is hidden. The world's one mark inside an article is the section-divider dot: a 4px Signal Mint dot on the 1px rule where each H2 starts, also on each reader path's rule and on the TOC rail beside the section in view. The desktop TOC is a `<nav>` labelled by its visible "On this page". Breadcrumbs are a running head: 0.8125rem links in the secondary tone, the current page in plain tertiary, no pill. Prev/next are reader-path rows between hairlines, previous left and next right, stacked under 600px. Back to top is a 44px, 12px-corner square on the card surface behind a Rule hairline, drawn arrow, accent on hover; below 997px it steps aside while a code block passes beneath it. Sidebar titles wrap in full. Table body cells are primary ink, headers secondary. The external-link arrow is an inline mask that travels with the last word. Reading time shows from 2 minutes. A dated index list shows its date column only when the rows' dates differ. Each row shows one date, its latest ("Updated" when newer than publication, else "Published"). Breadcrumbs drop the current page at every width. Prev/next keep a link only when its page is related to the current one (a hub and its pages, or pages of one parent), so pagination never crosses into another section. Heading anchors are inline "#" marks with a 44px hit area drawn by `::after`: on hover and focus with a mouse, resting visible in the tertiary tone on touch. Table header bands inset their outer cells 0.75rem.

**Handbook: phone wayfinding (<997px).** "On this page" is a disclosure button (aria-expanded) that names the section in view, "On this page · <section>", cut with an ellipsis; once passed it holds under the bar as a full-width band (page ground, hairline under it). Opened from the band the list hangs over the text, scrolls inside itself and closes on a pick, on Esc (focus back to the toggle) or when the band lets go; opening announces "Current section: X" once, politely, and marks it with aria-current. Back to top shows only after the reader, more than two screens down, scrolls up at least 24px, and steps aside over code. The phone search overlay has a visible 44px "Cancel" that folds the field back to the search control with focus kept on it.

**Handbook: wayfinding inside a sheet.** Domain headings (`sheet-…`) stay out of "On this page" and its highlight. While the reader is inside the sheet, "Key commands by domain" stays highlighted and the domain being read is named by its short name: on desktop a 0.75rem secondary note under the entry (later entries slide down by transform, so nothing in the layout moves); on phones the band reads "On this page · Key commands · SELinux" (below a 30rem band, once stuck, "On this page" steps back visually everywhere so the section gets the whole line; the button's name is "On this page" plus the visible section, WCAG 2.5.3), with at most one ellipsis. Opening the list announces "Current section: <section>, <domain>" once, politely. **Code wrap** is remembered per viewer in two scopes (`handbook:code-wrap:sheet` / `:prose`), applied before first paint as `html[data-code-wrap-sheet]` and `html[data-code-wrap-prose]`, so a tap in one never overrides the other. With no stored choice sheet code wraps at every width with a 1.2em hanging indent, and other code scrolls long lines. The wrap button is a toggle (`aria-pressed`, fixed label), announced once with its scope. **Code buttons** never cover code and never get a band of their own: a titled block carries them in its 44px title bar; an untitled block centres them on the first line, which keeps clear of them. On touch they show at 44px, unframed until pressed; with a mouse they appear on hover, except on a block whose code would scroll, where they rest in view, quiet. **Shell highlighting** colours only what the reader changes or must notice (comments, strings, flags, variables, placeholders); command words, builtins and keywords stay ink. **Phone band in a sheet:** the open list nests the sheet's domains (short names, 44px rows) under "Key commands by domain", the one being read marked `aria-current`. The desktop TOC never lists domains. **Inline code** of 24 characters or fewer never breaks; longer inline code breaks after a hyphen or slash.

**Handbook: arrival and reading chrome.** Any arrival on a #hash (shared link, search hit, the sheet's index, a pick from "On this page") lands at the target's scroll margin; after a cold load it re-checks once fonts and code blocks have settled and corrects if off, then focuses the target (tabindex -1 on arrival, removed on blur), with the ring only after keyboard input. A reader's touch, wheel or key cancels both. Below 997px the bar hides on a scroll down and returns on a scroll up (`navbar.hideOnScroll`); the stuck band follows by transform, so reading down a sheet the chrome is the 44px band alone (about 5% of an 844px screen); focus in the bar or an open drawer keeps it shown. Desktop keeps a fixed bar. Copy confirms on the block's top edge, left of the buttons, never over code: "Copied", or "Copied · fill in <ns>" / "Copied · fill in N placeholders" (held three seconds, spoken the same). With a mouse the code buttons rest in view on every block, quiet. The wrap toggle keeps the toggled block in place while its scope re-wraps. Sheet index links rest with the 40% underline for every pointer.

**Handbook: arrival identity.** A link from elsewhere (cold load, search hit, shared link) never leaves the reader without the page's name: the bar stays until the reader's own scroll (`html[data-bar-hold]`), and on a fact row or sheet domain the phone band names the page first ("RHCSA · Pass mark"; "RHCSA · SELinux" on phones, "RHCSA · Key commands · SELinux" from a tablet; the H1's first word or a `short_title`). A fact arrival pins the band under the bar with a placeholder holding its place (fresh nodes each way, CLS 0). The band leads with a 16px drawn list glyph so it reads as contents, not a folding heading. Sheet code wraps after "=", "/" or "," first and after "." only inside a piece wider than the line; the domain index fills its two columns by column with shared rows, so rows stay level when a name wraps; on desktop the domain steps and "All domains" rest in the tertiary tone.

**Handbook: grouped section index.** A hub whose sections have their own hubs (Engineering) lists the real pages, not the sub-hubs, in groups (`SectionGroup`): each group opens on the reader-path rule with the mint dot, its quiet h2 (0.9375rem, 600, secondary) is a 44px link to the section's hub with a drawn chevron, rows inside are h3s, and the group wrapper carries `.section-index-list` so search skips it.

**Handbook: one arrival rule.** The page has no smooth scroll of its own: every #hash arrival (cold load, search hit from another page, the router, a long in-page jump) goes at once; only an in-page link to a target at most 1.5 screens away glides (`html[data-smooth-hop]`), never under reduced motion. From the jump to the landing check the target is held where it landed, so drift from content settling above it is undone before paint. Focus goes to the target (or what an alias stands for), and the target receives `handbook:arrive`, shown by the Domain Sheet and Exam Facts as the two-second dim-accent tint (not on Back/Forward). Exam Facts rows are anchors (`#fact-exam`, `#fact-format`, `#fact-duration`, `#fact-pass-mark`, `#fact-version`, `#fact-as-of`; a shared row's other facts are aliases), and fact-sheet search hits link to them. On touch the heading "#" rests transparent (still tappable and focusable) and shows on the band's current section and domain, on focus, press or copy. From 997px each domain ends "← {previous} · {next} →" (named "Previous domain: …" / "Next domain: …") beside "All domains ↑".

**Handbook: arrivals on phones.** A jump lands `--toc-band-clear + 0.75rem` under the chrome: the band alone (44px) when the bar is away or a jump goes down, bar plus band otherwise, re-checked once the scroll settles. Back and Forward return to the reader's exact scroll position (Navigation API, per history entry; older browsers keep the default). On touch phones the sheet drops "All domains ↑" (the band lists the domains) and captions each shorthand term once, on the first domain that uses it. A diagram's lightbox opens with its top rank whole, placed to cut the fewest nodes.

**Handbook: drawer, anchors, print, dateline.** The phone drawer always opens on the main menu with the current section in accent ink; each section label is the link to its index (the index's own row is hidden in the drawer), the caret opens its list, and every row is at least 44px; when the section's doc tree lists pages its menu lacks, a framed "This section: <name> ›" row slides that tree in. On touch, tapping a heading's "#" copies the section's absolute URL and sets the hash without a jump; a "Link copied" label in the code-copy style shows for two seconds and the polite live region announces it; with a mouse or keyboard the "#" stays a plain link. Wrapped, untitled code blocks reserve the buttons' width as right padding on their first line. On paper, headings and any paragraph that introduces a list, code, table or diagram never end a page; diagrams print centred at most 40% of a page tall (every copy loaded before print), and notes print in primary ink whatever the screen theme. On phones a date from the build's own year drops its year from view (still read out), so two dates and "N min read" share one line. From 1600px the doc frame's lead grows with the window until the measure is centred beside the sidebar or "On this page" reaches the frame's edge. The landing's phone horizon band is 128px, the phone title `min(2rem, 8.6vw)` in three lines and the lede 1rem/1.55, so the first study row is whole at 360×740.

**Handbook: dated corrections.** When a page's facts have moved on, the original text stays and a `:::note[Since then]` follows the intro or the paragraph it corrects: plain first person, absolute dates, only what the record shows; the page's `last_update` moves to that day. Exam fact sheets take figures only from the official exam page with an `asOf` date; a figure the official page doesn't state stays deferred, never filled from a third party.

**Handbook: freshness.** An Atom feed of the dated pages is written at `/atom.xml` after the build (`plugins/docs-feed.js`, from the same front matter as the dateline), announced by `<link rel="alternate">` on every page and a plain "Feed" link at the end of the footer. "Last updated" sits under the reader paths on the landing in the shared reader-path rows (hairlines, nudging arrow), labels a step quieter (1rem/500), an "Updated/Published <date>" line under each title; when all three share a day the date shows once under the heading. The heading names no age, so it stays true however old the newest change is. A last_update that only corrects a page (a "Since then" note, a wording fix) carries `last_update_kind: correction`: its dateline reads "Corrected <date>", index rows keep its publication date, "Last updated" leaves it out, and its feed entry adds a "correction" category. `time_bound` takes `true` (90 days) or a number of days (Now: 45); past it the dateline adds "Updated N weeks ago; some of this has likely changed." (weeks to 12, then months), decided at build time from `customFields.buildDate`, never from the reader's clock. Body copy uses typographer's quotes (remark-smartypants, quotes only); code is never touched.

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
- **Handbook (Docusaurus):** a full-width bar, not the pill. The brand reads "cjoga.cloud/handbook" as real text (the suffix muted). Dropdowns Learn, Engineering and Me open on the section index, labelled with its title and set apart by a hairline. Hover is a neutral ink tint; only the active page or section takes the dim-accent fill. Below 997px the drawer is a modal: focus moves in, Tab is trapped, the page behind is `inert`, Esc closes it and focus returns to ☰; a Portfolio link and the theme toggle are pinned under the brand. Tab titles end "| Camilo's handbook". Sections read in reader order, Learn, Engineering, Me, in the bar, drawer and footer. The CV is reached through "CV on cjoga.cloud" (cjoga.cloud/#contact) in the author sign-off and the footer, without the external-link mark (one product). Dropdowns follow the WAI-ARIA APG disclosure-navigation pattern (links, not an ARIA menu): ArrowDown or ArrowUp on a trigger opens it on its first or last link, arrows move between links and stop at the ends, Home/End jump, Esc closes and returns focus to the trigger (`src/clientModules/dropdownKeys.js`).
- **Handbook doc sidebar:** "Collapse sidebar" is a full-width 44px row at the sidebar's foot, a stroked double chevron plus the words in the secondary tone; the collapsed strip shows the chevron with "Expand sidebar" written vertically and is 44px wide on touch screens.

### Brand Mark ("Orbit C")
A C drawn as an orbit (a 28-unit stroke on a 70-unit ring, round caps, opening ±0.62 rad to the right) with its satellite parked in the gap, in Signal Mint on a Deep Space (#0b0f1a) tile with 58-unit corners on a 256 grid and a 16%-mint hairline edge. Pure geometry: no text element, no gradient. The source is `scripts/brand/mark.svg` (maskable variant: `scripts/brand/maskable.svg`); `npm run brand` renders the favicons, app icons and social cards for both sites. The tile stays dark in the light theme.

### Reader Paths (handbook)
From 1200px the four readers sit two by two (studying, hiring / homelab, opinions), each heading and intro over its rows, paired lists aligned by subgrid; 997–1199px keeps heading-left, rows-right; phones stack in the same order. The handbook's entry points by reader ("If you're studying", "If you're hiring", "If you're curious about the homelab", "If you want my opinions and what I'm up to"): a heading and a one-line intro per reader on the left and its links on the right from 997px, as hairline rows of at least 56px with an arrow that nudges on hover. One source (`blog-site/src/data/readerPaths.js`) feeds the landing page and the 404 page. The section index pages use the same rows (`ReaderPaths/rows.module.css`, via SectionCardGrid): title, one-line description, no icons. Each row's label is the exact title of the page it opens. "If you're hiring" ends on "CV on cjoga.cloud" (cjoga.cloud/#contact), opening in place with no external-link mark. Rows reach 12px past the column on each side so the focus ring, drawn inside the row, has room around the text without moving it. Lists ordered by date (Tips and gotchas) add a quiet date read from each page's front matter at build time, and lists in reading order (Opinions) show none; the article dateline keeps both Published and Updated. The 404 page echoes the address that wasn't found, offers a search field pre-filled with that address's words, then the reader paths. It lists up to three closest pages first, as reader-path rows (title, path below), offered only when a page covers at least half the words of the bad address's last segment (else the nearest published folder above it, or nothing); the echoed address wraps only after "/" or "-" and leads the page (1.125rem, full ink) with the lede a step down; the search is pre-filled only with words a page could be about, else it shows its placeholder.

### Search (handbook)
Offline search, indexed at build time (no third-party service). Desktop: a hairline field in the navbar, "Search the handbook", with a quiet Ctrl K hint from 1280px. Phone: a 44px search control at the right of the bar that opens a full-width field over it. Results are grouped by page. A dropdown row leads with the matched heading in primary text, then a one-line excerpt with matched terms in accent weight (never a yellow mark); the page title sits above in a quiet 0.75rem line, shown only on a page's first row; no tree glyphs or type icons. The active row takes the dim-accent fill and an Enter mark. On /search each page's title links the page, with a short parent breadcrumb, and its matched sections follow as indented links behind a hairline, excerpts clamped to two lines on phones; a status line counts "N matches in M pages", and the empty and no-results states offer example queries. Arrow keys move through results, Tab leaves the field, Esc closes the results and keeps focus in the field. Tab title: "Search | Camilo's handbook", or "“query” – Search | Camilo's handbook". Ranking is exact, then prefix, then fuzzy, and words of four characters or fewer never match fuzzily. The dropdown shows at most 8 rows. When no page holds every word of a multi-word query, both the dropdown and /search say "No page has all of these words." and list pages per word under "Pages matching “word”". Section index lists (`.section-index-list`) stay out of the index, so a hub never duplicates the articles it lists. The "Ctrl K" (⌘ K) keycap hint shows from 1200px on keyboard devices; there is no single-key shortcut (WCAG 2.1.4). On phones the results panel is a sheet of the page ground running edge to edge under the bar (no radius, no shadow, hairline below, scrolls inside itself). When nothing matches, it names the query and offers example queries as listbox options the arrows reach; Enter or a tap runs that search. A page shows at most 3 sections in the dropdown while several pages match; /search shows 5, then "Show N more in this page". Ordering is by match quality, then by what matched: page title, a guide's domain heading (`#sheet-…`), other headings, body text; a guide's "Key commands by domain" H2 drops out when one of its domains matched. A visually hidden polite status gives the dropdown's count once typing pauses. On phones the open results sheet dims the page beneath it with a scrim drawn as its own clipped spread shadow. Learner phrases reach the sections that answer them through a small owner-edited intent map (`src/theme/SearchBar/intents.js`): "tips", "exam day" → Day-of guidance; "cheat sheet", "commands", "night before" → Key commands by domain; "how long", "pass mark" → the guide's fact sheet (shown as the excerpt). Other words narrow the target to the pages they name ("ckad tips" → CKAD only); such hits rank below matches on the reader's own words and above body text. Front-matter `keywords` are tags, not text: a page found only by them ranks last and says so ("Tagged: kubernetes · {opening line}"), and a section index found only by them gives way to its own pages; a keyword the page's text bears out ranks just under a title. Every row carries a line of text. Shorthand is searched spelled out (k8s, kube → kubernetes; ex200 → rhcsa; ex294 → rhce), certification words put the /learn guides first except over a title match, and when results aren't for the query as typed one quiet line says so ("Showing results for “kubernetes”"). Sheet shorthand captions, the phone TOC toggle and in-page jumps stay out of the index. A fact-sheet hit shows the row that answers the question, opening on its label ("Duration: 2 hours · …"); a guide whose row gives a figure ranks above one that defers. Body text that matched only inside a machine name (`prox-k8s-master`) ranks last unless the reader typed the whole name. Every word of a query counts: a page must hold all of the reader's words (stop words aside; shorthand counts through its spelled-out form); a word no page holds is named in one quiet line, "Not found: “zxqvbn”", over results for the others, and when no page holds them all the per-word groups follow "No page has all of these words.". Among pages that matched alike, one whose title, description or first sentence names the word or a kind of it (`KINDS`: K3s for Kubernetes) leads. The /search heading holds exactly two lines so the field never shifts. The Atom feed is served as `application/atom+xml; charset=utf-8`; in a browser it is styled by `/atom.css` (CSS, not XSLT) with XHTML-namespace elements for a readable page, and stays valid Atom. On first use the loading ring takes the magnifier's slot (16px, one arc, still without motion) and the status says "Loading search…" once. The /search example queries are hairline links with 8px corners, never pills.

### Guide Source (handbook)
The repository a guide interprets, as one framed hairline row under the guide's intro: GitHub mark, repo name (650), a one-line note in the secondary tone, an up-right arrow. The repo stays the source of truth; the guide is the framing around it.

### Fact Sheet / Exam Facts (handbook)
A page that opens on facts uses one pattern: a description list of hairline rows, label in the secondary tone (0.8125rem / 500) in a 6.25em column, value in full ink, a Rule on top and Hairlines between rows, no frame. Work pages use it under the H1 (`<FactSheet><Fact label="Role">…</Fact></FactSheet>`, values in inline Markdown so links keep the article style). A cert guide uses `ExamFacts`, one schema in one order: Exam, Format, Duration, Pass mark, Version, As of. The Exam row is left out when the code would only repeat the page title (CKAD); `#fact-exam` then lands on the first row. Version is a token pair, `{exam, lab}` → "Exam: RHEL 10 · Lab: RHEL 9", or the exam's value alone; prose about versions belongs in the body. As of means only the day the sheet was last verified (YYYY / YYYY-MM / YYYY-MM-DD / mid-YYYY). A fact from an older or narrower source (a sitting, the owner's word) names it per row through `sources`, a `<small>` side note in the tertiary tone after the value, never split ("210 of 300 points · my sitting, 2024"), so a deep link or search excerpt carries its provenance; "Not published by Red Hat · checked <date>" uses the same form. The official page is linked once, on a 13px secondary line under the list: "Check before you book: <page> ↗". The guide's intro does not repeat the sheet; search finds a fact sheet by its first row ("Exam: " or "Format: "). The facts sit after the lede, directly above the Guide Source row, which can add one plain `scope` line saying what lives in the repo rather than on the page (only where true). Credential cards put the name first, then "year · issuer" on one caption line; "earned" is implied and only another status is shown; "Verify on Credly ↗" and "Study guide →" share one link style.

### Domain Sheet (handbook, the night-before sheet)
A cert guide carries its key commands under an H2 "Key commands by domain" (`DomainSheet` / `Domain` / `Verify`), after the orientation sections and before the day-of guidance. The sheet opens on an index: the fact sheet's "Domains" label, then every domain as a plain full-ink link (accent and underline on hover), two columns down to a phone, 44px rows on touch, hidden on paper and kept out of the search index; an optional `legend` adds one "Shorthand" row (CKAD: `k`, `$do`). Each domain is one hairline row: its name as an h3 at body size (650) through the theme Heading, id `sheet-<short-name-slug>` (e.g. `#sheet-selinux`, the full-title id kept as an alias), class `domain-heading`, the "#" link and `data-short` (its index label), so search lands on it; it stays out of "On this page". Then one or two ordinary code blocks (a titled block names a file, never a command), then a `<dl>` of **Verify** and **In the repo** (↗). Commands inside rows are mono in full ink with no chip and break only between words (34 characters or fewer stay whole). Placeholders in angle brackets are painted in the warm code tone on a dotted rule through the CSS Custom Highlight API, so copied text is exactly the command. Arriving on a domain (index, search, link) tints its name with the dim accent for two seconds (static without motion); from the index, focus moves to the heading. Every command comes from the guide's own repository; the full answers stay there. On paper each domain stays on one page and code wraps. `shorthand={[[term, meaning]]}` declares shorthand the commands rely on: a "Shorthand" row under the index (printed once in the sheet header) and a quiet caption under the name of every domain that uses it; the domain that defines it is detected from its code. A copy from a block that needs the shorthand says so ("Copied · needs k and $do from Terminal setup · fill in 2 placeholders"), shortened to fit; the live region always says everything. Wrapped sheet code breaks long runs only after `.`, `/`, `=` or `,`, and only when the run is wider than the line. Jumps within the sheet longer than 1.5 screens are instant. The index sets its links in newspaper columns (`columns: 2` above an 18rem container), so each column reads down in sheet order and Tab follows the reading; with a mouse "All domains ↑" rests invisible and fades in on the domain under the pointer or holding focus (opacity only), on touch it always shows. On paper repo links print their in-repo path, the repo is named once in the header, and a domain may break between its code and its rows. Code renders without font ligatures. Guide Source's note is one line saying what the repo holds; on a guide with a sheet the same hairline frame adds a second row, "Key commands by domain ↓" (44px), jumping to the sheet's index with focus moved there. On the Learn index a guide row may carry one quiet secondary link to its sheet, a sibling of the row link (never nested), 32px with a mouse and 44px on touch. Each domain ends on a right-aligned "All domains ↑" row (drawn arrow, secondary tone, 44px on touch, hidden in print and out of the search index) back to the index, with focus on its "Domains" label; on touch the index links rest with the 40% underline. "Print this sheet" under the index prints the sheet alone (`html[data-print-sheet]` for one print) with a paper-only header of the page title and URL. Wrapped sheet code breaks at spaces; runs with punctuation (`yum-repo.yml`) stay whole unless wider than the line. Fact Sheet and Domain Sheet rows carry hidden ": " and " · " marks so search excerpts read "Verify: … · In the repo: Task 2". Work pages add "Scale" and "Outcome" rows only where the page's own copy states them.

### Tech marks (handbook)
Stack grids show vendor marks in brand colours, but a mark is decorative and the label carries the meaning. Each brand colour is checked against both grounds of each theme; below 3:1 it is lifted toward white at night or deepened toward black in daylight, keeping its hue, passed as `--mark-dark` / `--mark-light` and picked by `[data-theme]`. Marks react-icons lacks are inlined simple-icons paths, never a CDN `<img>`. A tool the page lists but no longer runs carries `retired: "YYYY-MM"`: it leaves the stack's list and follows it on its own row named "Retired" (grey mark at 55%, tertiary name, a 0.75rem "Retired May 2026" caption). In the inline line, consecutive unlinked tools that share a mark draw it once, followed by a comma list of names (each still its own list item); tile grids always draw each tile's mark.

### Diagrams
Mermaid renders at build time in two palettes from the tokens (daylight: white nodes, teal rims, slate lines; night: bulkhead nodes, mint rims) and [data-theme] shows the matching one. Diagrams flow top-to-bottom and keep their natural size up to the measure (labels at their drawn 15px); a wider one fits its card. Labels use the Arial metric family (Arial, Helvetica, Liberation Sans, Arimo, FreeSans), the faces "Mona Sans Fallback" scales to Mona Sans, because an `<img>` SVG cannot load web fonts; labels are prose, never mono. A sideways-scrolling diagram opens with its top rank whole and as near centred as it goes, but the card's left edge never cuts through a node; when both can't hold, it opens at its left edge. The lightbox is a single-image dialog named "Diagram: <name>", with no carousel semantics. On phones (≤600px) an inline diagram is a fit-to-width preview that never scrolls, with "Open diagram" as a 44px caption row under it inside the card (drawn by CSS, so it ships pre-JS with no shift) instead of a badge; on touch the lightbox's close shows the word "Close". Tapping a diagram opens it full screen. On touch it opens on the start of the flow at a readable label size (about 14px) after a brief look at the whole; a tap goes to the whole flow ("Tap to see the whole flow"), the next zooms in on the tapped point. Pointer devices open at fit. Pinch and drag still work; the badge says "Open diagram" on every input.

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
- **Do** set measures in em, not ch: ch is the width of "0" and changes when the metric-matched fallback ("Mona Sans Fallback") shows before the web font, which re-wraps text and shifts layout. Prose runs at 36em (~70–75 characters).
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
