# hallmai — Family Care Dashboard Design Spec

## Project Overview

**hallmai** (할마이) is an AI voice companion for elderly parents living alone. The AI talks to Mom daily through a simple one-button voice call. After each conversation, it automatically generates a "care card" summarizing her mood, what she talked about, and any health or emotional signals.

This spec covers the **family dashboard** — the read-only screen a child checks to stay updated on Mom's well-being.

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#FFF8F0` | Page background, warm cream |
| White | `#ffffff` | Card backgrounds |
| Coral | `#E8725C` | Brand accent, CTA, active states, voice player |
| Coral dark | `#d4614d` | Gradient end for coral sections |
| Good | `#34d399` | Positive mood indicator (emerald) |
| Okay | `#fbbf24` | Neutral mood indicator (amber) |
| Low | `#f87171` | Concerning mood indicator (red) |
| Text primary | `stone-800` | Headings, important text |
| Text secondary | `stone-600` | Body text |
| Text tertiary | `stone-400` / `stone-500` | Labels, captions, metadata |
| Dark bg | `stone-800` → `stone-900` gradient | Dark sections (VoiceSummary) |
| Dark text | `stone-300` | Text on dark backgrounds |
| Dark muted | `stone-500` | Labels on dark backgrounds |
| Alert bg | `red-50` | Alert banner background |
| Alert border | `red-100/60` | Alert banner border |

### Typography

- **Font**: Inter (system-ui fallback)
- **Smoothing**: antialiased
- **Scale** (all in px):

| Size | Weight | Usage |
|---|---|---|
| 28px | font-black (900) | Page title, stat values |
| 20px | font-bold (700) | Voice summary title |
| 17px | font-semibold (600) | Quote text (if used) |
| 15px | font-bold (700) | Section card titles |
| 14px | normal | Card body text, list items |
| 13px | normal / medium | Subtitle, alert detail, body |
| 12px | medium / mono | Date labels, duration |
| 11px | font-bold / semibold | Section sub-labels, legend |
| 10px | font-bold | Section labels (uppercase, tracking-[0.15em] or tracking-widest) |

### Spacing & Layout

- **Page max-width**: 430px, centered
- **Page padding**: `px-5` (20px sides)
- **Section gap**: `space-y-4` (16px) in card area
- **Card padding**: `p-5` (20px)
- **Border radius**: `rounded-2xl` (16px) for all cards

### Card Styles

**White card (`.card` class)**:
```css
background: #ffffff;
border-radius: 16px;
box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.04);
```
- No heavy shadows. Thin 0.5px border simulates card edge.
- Used by: StatsRow, MoodChart

**Dark card**:
```
rounded-2xl bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900 p-5
```
- Used by: VoiceSummary
- Text: white for primary, stone-300 for body, stone-500 for labels
- Accent elements in coral `#E8725C`

**Coral gradient card**:
```
rounded-2xl bg-gradient-to-br from-[#E8725C] via-[#e06a52] to-[#cf5a44] p-6
```
- Used by: WeeklyInsight
- Text: white, opacity for secondary text
- Decorative: semi-transparent white circles (`bg-white/[0.06]`)

**Alert card**:
```
rounded-2xl bg-red-50 border border-red-100/60 px-4 py-3.5
```
- Used by: AlertBanner
- Text: `red-700` for title, `red-500` for detail
- Pulsing red dot animation

### Interactions

**Pressable**:
```css
.pressable {
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.pressable:active {
  transform: scale(0.97);
  opacity: 0.85;
}
```

**Animations**:
- `waveform`: bar height oscillation for voice player (0.5-1.2s, ease-in-out, infinite)
- `pulse-dot`: scale 1→1.3 + opacity fade for alert indicator (2s, ease-in-out, infinite)

### Section Label Pattern

Recurring pattern for section headers:
```
text-[10px] or text-[11px]
font-bold
text-stone-400 or text-stone-500
uppercase
tracking-[0.15em] or tracking-widest
```
Often paired with a small colored icon (coral for branded sections).

---

## Visual Rhythm

Sections alternate between different visual treatments to avoid monotony:

```
Title          → plain text on page background (#FFF8F0)
Alert Banner   → red-50 tinted card
VoiceSummary   → DARK (stone-800/900 gradient)
Stats Row      → WHITE cards (3-column grid)
MoodChart      → WHITE card
WeeklyInsight  → CORAL gradient card
CareCards      → NO card — timeline on page background
```

**Rules**:
- Never stack 3+ white cards without a visual break
- Dark and coral sections provide contrast anchors
- Timeline (CareCards) uses the page background, not cards
- Alert only appears when needed, so it doesn't count as a permanent rhythm element

---

## Page Structure

### Mobile Frame

- `h-dvh` full viewport height
- Sticky header (48px, frosted glass `bg-[#FFF8F0]/80 backdrop-blur-xl`)
- Scrollable `<main>` with `pb-24` for floating tab bar clearance
- Floating tab bar (`absolute bottom-5 left-5 right-5`, rounded-2xl, frosted glass, shadow)

### Header

- Left: brand name "hallmai" / "할마이" (16px, bold)
- Right: language toggle (EN/KO pill button) + profile icon (stone-100 circle)

### Floating Tab Bar

```
absolute bottom-5 left-5 right-5 z-50
rounded-2xl bg-[#FFF8F0]/80 backdrop-blur-xl
shadow-lg shadow-stone-900/[0.08]
border border-stone-200/40
```
- 2 tabs: Updates (heart, coral, filled) + Settings (gear, stone-300, outlined)
- Apple iOS style: detached from edges, rounded, floating

---

## Sections (Top to Bottom)

### 1. Title + Subtitle
- `px-5 pt-2 pb-1`
- Title: 28px, font-black, stone-800
- Subtitle: 13px, stone-400

### 2. Alert Banner
- `px-5 pt-3`
- Conditional — only shown when AI detects concerning signals
- Pulsing red dot + bold title + detail text + chevron arrow
- Read-only, no action

### 3. Voice Summary (Dark Hero)
- `px-5 pt-4`
- Dark gradient card with podcast-style audio player
- Microphone icon + "VOICE BRIEFING" uppercase label
- Title: "Yesterday's Summary" (20px, bold, white)
- Duration: monospace "1:42"
- Play/pause: 48px coral circle with shadow glow (`shadow-[#E8725C]/20`)
- Waveform: 40 bars, pseudo-random heights via `Math.sin`, fill coral as progress advances
- Animated bars while playing (individual delays for wave effect)
- 2-line preview text in stone-500

### 4. Stats Row
- `space-y-4` starts here
- 3-column grid, each cell is a `.card`
- Each: large value (28px, font-black) + small uppercase label (10px, stone-400)
- Values: streak days, weekly chat count, average mood emoji

### 5. Mood Chart
- White `.card` with `p-5`
- Header: "Weekly Mood" left, date range right
- 7 slim bars (`w-3 rounded-full`) for Mon-Sun
- Bar heights proportional to mood score
- Today's bar has glow: `boxShadow: 0 0 8px {color}60`
- Color-coded: emerald/amber/red
- Legend below with small dots

### 6. Weekly Insight (Coral Card)
- Coral gradient with decorative white circles
- Header: "Weekly Insight" left, "by hallmai" right
- Body: 14px, white, opacity-90, relaxed line-height
- Tags: `bg-white/15` rounded pills

### 7. Daily Care Cards (Timeline)
- Section label: "DAILY UPDATES" (11px, uppercase, tracking-widest)
- Timeline layout: colored mood dot + vertical connecting line on left, content on right
- Mood dot: `w-3 h-3 rounded-full` with `ring-4 ring-[#FFF8F0]` (matches page bg)
- Connecting line: `w-[1.5px] bg-stone-200` (hidden on last card via `isLast` prop)
- Content: date + mood emoji/label, summary text, optional red alert pills
- No card background — sits directly on page background

---

## i18n

- Client-side React Context with dictionary approach
- Two locales: `ko` (default), `en`
- Toggle button in header
- All visible text goes through `t.keyName`
- Dictionary type: `Record<DictionaryKey, string>`

---

## Technical Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 (no external UI libraries)
- No chart libraries — all visualizations built with styled divs
- CSS animations only (no framer-motion)
- Mobile-first, single-page scroll
