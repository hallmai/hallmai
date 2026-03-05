# Family Dashboard v2 Design

## Problem

Current dashboard is read-only monitoring. No reason for the child to return after checking once. Not compelling enough to pay for.

## Value Proposition

**Convenience**: "I can't call mom every day, so AI does it for me and tells me what matters."

The product is not the dashboard. The product is "AI calls mom daily." The dashboard is the output.

## New Components

### 1. MomQuote (엄마 한마디)

- **Position**: Below Alert Banner, above Voice Summary
- **Purpose**: Emotional hook. The first thing the child sees when opening the app.
- **Content**: A real quote from mom's conversation, with brief context
- **Style**: Warm cream/beige background, large quotation mark decoration, slightly larger serif-feel text
- **Data**: `{ quote: string, context: string }`
- Example: "요즘 옆집 할머니랑 산책하는 게 제일 좋더라" / context: "산책 이야기 중"

### 2. TopicSuggestions (대화 주제 추천)

- **Position**: Below Stats Row
- **Purpose**: Answers "so what do I do?" after seeing the data. Gives the child something to talk about when they call.
- **Content**: 2-3 conversation topics derived from recent AI conversations
- **Style**: Outline chips with icons, light and tappable
- **Data**: `{ topics: { emoji: string, text: string }[] }`
- Example: "산책 이야기 해보세요", "병원 검진 결과 물어보세요"

### 3. Reminders (리마인더)

- **Position**: Below Mood Chart
- **Purpose**: Practical value. AI auto-detects schedules/health info from conversations.
- **Content**: List of dates + events extracted from conversations
- **Style**: Light blue/purple tone (differentiated from other sections), calendar/check icon
- **Data**: `{ reminders: { date: string, text: string, type: "health" | "schedule" | "other" }[] }`
- Example: "3/12 - 건강검진", "매일 오전 - 혈압약 복용"

## Updated Section Order

1. Title + Subtitle
2. Alert Banner (shown only when anomaly detected)
3. **MomQuote** (NEW)
4. Voice Summary (dark podcast player)
5. Stats Row (3 stats)
6. **TopicSuggestions** (NEW)
7. Mood Chart (7-day bars)
8. **Reminders** (NEW)
9. Weekly Insight (coral gradient)
10. Care Cards (timeline)

## Design Principles

- Visual rhythm: alternate light/dark/colored sections
- Each new component has a distinct visual identity (quote = warm/cream, topics = outlined chips, reminders = blue/purple)
- All data is mock for now; will connect to Firebase later
