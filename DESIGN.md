# Design

Recorded from the built world (October 2026). Source of truth for tokens: `src/app/globals.css`. Live brand board: `/brand`.

## World

The front-page comparison wall: coverage of one event shown as front pages arranged left to right, printed in process colour. The reader sees the shape of a story before any single take.

## Colour

Strategy: restrained. Neutral newsprint plus four process inks, each with one job.

| Token | Light | Dark | Job |
|---|---|---|---|
| `--paper` | `#e6e6e1` | `#0e0f11` | Page ground (press room) |
| `--sheet` | `#f3f3ef` | `#17181b` | Front pages, panels |
| `--ink` | `#131314` | `#ecebe6` | Text, centre of spectrum |
| `--cyan` | `#0086c3` | `#3fb4ec` | Left of centre only |
| `--magenta` | `#c8006a` | `#ff5aa8` | Right of centre only |
| `--yellow` | `#ffe14a` | `#ffd83a` | Highlighter for wording differences only |
| `--rule` | `#c9c9c3` | `#2c2d31` | Hairlines |

Rules: cyan and magenta never decorate; they only encode lean, and position always carries the meaning first (`biasColor` blends plate into key by distance from centre). Yellow appears only as `.mark-diff`. Loaded language is a magenta wavy underline (`.mark-loaded`). The registration rule (`.reg-rule`, cyan/key/magenta thirds) is the one repeated ornament.

Theme follows the OS, overridable via the masthead toggle (`data-theme` on `<html>`, persisted in `localStorage`).

## Type

- **Source Serif 4** (optical sizes on): headlines, summaries, claims, outlet mastheads in small caps. Display headlines bold, tracking −0.025 to −0.03em, `text-balance`.
- **Archivo** (variable width): wordmark (wdth 112%, weight 800), interface, labels, numerals (`.tabular`). Wide (118%) for big numbers.
- No eyebrows/kickers above headings; topic and counts live in a meta line below.

## Components

- **Mark**: two r=11 circles 12 apart, cyan left, magenta right, solid-ink lens. Mono version: two outlines + solid lens. Never rotated.
- **Front page slab**: 4px plate bar in outlet's lean colour, lean label, double-ruled small-caps masthead, serif headline 22–23px, description, time + source link.
- **Spectrum plot**: d3-scale positions, d3-force collision; outlet plates (short code in bordered rounded rect) slide from the centre baseline with 45ms stagger, expo ease-out. Hover/focus syncs with citations via `StoryProvider`.
- **Coverage strip**: static dot strip for cards.
- **Outlet chips**: citation plates; inverted (ink) when active.
- **Claims ledger**: sheet panels with 2px top rule in group colour (ink agreed, cyan left, magenta right, yellow contested); spread bar per claim.
- Column-ruled story grid on the home wall (newspaper columns, no card shadows); sheets with soft offset shadow (`--shadow`) for front pages and panels.

## Motion

One authored moment: outlets sliding onto the spectrum. Everything else is short colour/transform transitions. `prefers-reduced-motion` collapses all durations.

## Layout

Max width 1320px, gutters 16/24/40px. Story header 7/5 split; front pages scroll horizontally with snap so left-to-right order survives any width. Mobile adds a bottom nav.
