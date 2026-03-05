# hallmai — Family Care Dashboard (v0 Prompt)

## Project Overview

**hallmai** (할마이) is an AI voice companion for elderly parents living alone. The AI talks to Mom daily through a simple one-button voice call. After each conversation, it automatically generates a "care card" summarizing her mood, what she talked about, and any health or emotional signals worth noting.

This prompt is for the **family member's dashboard** — the screen a son or daughter checks to stay updated on Mom's daily well-being without having to call every single day.

The name "hallmai" is a play on Korean "할머니" (grandma) and contains "LLM" and "AI" in it (ha-**llm**-**ai**).

---

## Design Philosophy

### Overall Feeling
- **Apple Health inspired** — clean, minimal, generous whitespace, bold typography
- **Warm but not cluttered** — warm cream background with restrained accent colors
- **Read-only dashboard** — family just reads, no action buttons needed
- The design should make you feel informed and reassured, not anxious

### Visual Direction
- **Color palette:**
  - Background: warm cream `#FFF8F0`
  - Primary accent: soft coral `#E8725C` (brand, voice player, tags)
  - Good/positive: emerald `#34d399`
  - Neutral/okay: amber `#fbbf24`
  - Concerning/low: red `#f87171`
  - Text: stone tones (`stone-800` for headings, `stone-400` for secondary)
  - Cards: pure white `#ffffff` with 0.5px border (no heavy shadows)
- **Typography:** Inter font, font-black (900) for numbers/titles, generous tracking-tight. Clean hierarchy: 28/17/15/14/13/11/10px
- **Border radius:** 16px for cards, full-round for badges and pills
- **Shadows:** Minimal — prefer thin borders over shadows
- **Spacing:** Tight 16px gap between sections. Dense but readable
- **No dark mode** — always warm and bright

### Layout
- **Mobile-first**: max-width 430px, centered on larger screens
- Compact sticky header (48px height)
- Single scrollable page, no tabs or complex navigation
- Bottom tab bar with 2 items: "Updates" (active) and "Settings"
- Language toggle (EN/KO) in header

---

## Page Structure

The page scrolls vertically with 16px gap between sections.

### 1. Header
- Compact 48px height, frosted glass effect
- Left: "hallmai" brand text (16px, bold, tracking-tight)
- Right: language toggle button (EN/KO) + profile icon
- Minimal and clean

### 2. Title Area
- Large heading: **"Mom's Well-being"** (28px, font-black)
- Subtitle: "Summarized by hallmai" in stone-400

### 3. Alert Banner (Conditional)
- Only appears when hallmai detects something concerning
- Rounded card with `red-50/60` background
- Left: small red circle with exclamation icon
- Center: bold alert title + smaller detail text
- No action button — read-only
- Example: "Sleep issues detected" / "Mom mentioned trouble sleeping 2 nights this week"

### 4. Voice Summary Player
- **Podcast-style audio player** for yesterday's detailed summary
- Header: microphone icon + "VOICE BRIEFING" label (uppercase, tracking-widest)
- Title: "Yesterday's Summary" (17px, bold)
- Duration display: "1:42"
- Coral play/pause button (44px circle) + waveform visualization
- Waveform: 32 bars with pseudo-random heights, fills with coral as progress advances
- Animated bars when playing
- Preview text: 2-line clamp of the summary content
- Uses Web Speech API (TTS) for now, Gemini voice later

### 5. Stats Row
- 3 compact cards in a horizontal grid
- Each card: large font-black value (28px) on top, small uppercase label below
- Card 1: "12" — "days · Streak"
- Card 2: "6" — "chats · This Week"
- Card 3: "Good" emoji — "good · Avg Mood"

### 6. Weekly Mood Chart
- White card with 0.5px border
- Header: "Weekly Mood" (15px, bold) left, date range right
- Bar chart using simple divs (NO chart libraries)
- 7 bars for Mon–Sun, rounded-md tops
- Bar colors: emerald for good, amber for okay, red for low
- Day labels below each bar
- Legend with square color indicators

### 7. Weekly Insight Card
- White card (NOT gradient — Apple Health style)
- Header: "Weekly Insight" (15px, bold) left, "by hallmai" right
- Body: 2-3 sentences of AI-generated insight in stone-500
- Bottom: coral-tinted tags in `coral/8` background pills

### 8. Daily Care Cards
- Section header: "DAILY UPDATES" (11px, uppercase, tracking-widest)
- Vertical list of cards with 12px gap

**Each care card:**
- Header: date (12px, stone-400) left, mood badge right
  - Mood badges: emoji + label in colored pill
- Summary: 14px, stone-600, relaxed line-height
- Alert tags (optional): small red pills with dot indicator
- **No reply section** — dashboard is read-only

### 9. Bottom Tab Bar
- 2 tabs: Updates (heart icon, coral, filled) + Settings (gear icon, stone-300, outlined)
- Frosted glass background

---

## Mock Data

**Stats:** 12-day streak, 6 chats this week, average mood Good

**Alert:** Sleep issues detected — Mom mentioned trouble sleeping 2 nights this week

**Weekly Mood (Mon-Sun):** Good, Okay, Good, Low, Good, Okay, Good

**Weekly Insight:** "Mom had a great week overall. She went on walks 4 times and cooked for herself every day. She mentioned feeling lonely on Thursday — a quick call would brighten her day."
Tags: Active, Mild loneliness, Good appetite

**Voice Summary:** Detailed audio briefing of yesterday's conversation (1:42 duration)

**Care Cards:**

1. Today · Mar 5 | Good
   "Mom went for a walk with her neighbor Sunja. The warm weather put her in a great mood."

2. Yesterday · Mar 4 | Okay
   "An old song on TV reminded her of Dad. She made doenjang-jjigae for dinner."
   Alerts: Loneliness

3. Mar 3 | Good
   "She asked for photos of the grandkids. Been keeping up with her daily walks."

4. Mar 2 | Low
   "Had trouble sleeping last night. Otherwise a quiet day at home."
   Alerts: Sleep, Low mood

---

## Technical Requirements

- **Framework:** Next.js App Router with TypeScript
- **Styling:** Tailwind CSS v4 only — no external UI libraries, no external chart libraries
- **Charts:** Build the bar chart with simple styled divs
- **Interactivity:** Voice player with play/pause and progress (client component), language toggle (EN/KO)
- **i18n:** Client-side context + dictionary approach (Korean default, English toggle)
- **Mobile-first:** max-width 430px centered, use `h-dvh` for viewport height
- **Structure:** Shared layout wrapper component for the mobile frame (sticky header, scrollable content area, bottom tab bar)

---

## What Makes This Design Stand Out

1. **Voice-first briefing** — hear yesterday's summary as a podcast, not just read cards
2. **Apple Health clarity** — clean, dense, information-rich without clutter
3. **Signal without noise** — alerts at the very top, mood trends at a glance
4. **Zero-action dashboard** — family just opens and reads, no buttons to press
5. **AI personality** — the weekly insight card gives hallmai a warm, caring voice
6. **Bilingual** — seamless EN/KO toggle for international families
