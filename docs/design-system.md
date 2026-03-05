# hallmai Design System

이 문서는 hallmai의 모든 화면에 적용되는 디자인 규칙입니다.
새 페이지나 섹션을 만들 때 반드시 이 문서를 기준으로 합니다.

---

## Color Tokens

### Backgrounds

| 이름 | 값 | 용도 |
|---|---|---|
| Page | `#FFF8F0` | 전체 페이지 배경. 따뜻한 크림색 |
| Card white | `#ffffff` | 화이트 카드 배경 |
| Card dark | `stone-800` → `stone-900` gradient | 다크 섹션 배경 |
| Card coral | `#E8725C` → `#e06a52` → `#cf5a44` gradient | 강조 섹션 배경 |
| Alert | `red-50` + `border red-100/60` | 경고 배너 |

### Text

| 배경 위 | Primary | Secondary | Muted |
|---|---|---|---|
| Light (페이지/카드) | `stone-800` | `stone-600` | `stone-400` |
| Dark (stone-800 카드) | `white` | `stone-300` | `stone-500` |
| Coral (그라디언트 카드) | `white` | `white/90` | `white/40` |
| Alert | `red-700` | `red-500` | `red-300` |

### Accent & Status

| 이름 | 값 | 용도 |
|---|---|---|
| Coral | `#E8725C` | 브랜드 액센트, CTA, 활성 탭, 플레이어 |
| Coral dark | `#d4614d` | 그라디언트 끝 |
| Good | `#34d399` | 긍정 기분 (emerald) |
| Okay | `#fbbf24` | 보통 기분 (amber) |
| Low | `#f87171` | 우려 기분 (red) |

### 사용하지 않는 색

blue, violet, purple, indigo, teal, cyan 계열은 사용하지 않습니다.
팔레트는 stone + coral + emerald/amber/red로 제한합니다.

---

## Typography

**Font**: Inter (system-ui, -apple-system 폴백)

### Scale

| px | Weight | 용도 | 예시 |
|---|---|---|---|
| 28 | black (900) | 페이지 타이틀, 숫자 강조 | "어머니 안부", "12" |
| 20 | bold (700) | 섹션 히어로 타이틀 | "어제의 안부" |
| 15 | bold (700) | 카드 내 타이틀 | "주간 기분", "주간 요약" |
| 14 | normal (400) | 본문 텍스트 | 카드 요약, 리스트 아이템 |
| 13 | normal / medium | 서브타이틀, 세부 텍스트 | "할마이가 정리했어요" |
| 12 | medium / mono | 날짜, 시간 | "3월 5일", "1:42" |
| 11 | bold / semibold | 하위 라벨, 범례 | 무드 범례, 섹션 부제 |
| 10 | bold | 섹션 라벨 (uppercase) | "VOICE BRIEFING" |

### 섹션 라벨 패턴

모든 섹션 상단의 작은 라벨은 이 패턴을 따릅니다:
```
text-[10px] or text-[11px]
font-bold
text-stone-400 / text-stone-500 (라이트) or text-stone-500 (다크)
uppercase
tracking-[0.15em] or tracking-widest
```

### Line Height

- 본문: `leading-relaxed` 또는 `leading-[1.7]`
- 타이틀: `leading-tight` 또는 `leading-none`

---

## Spacing

| 요소 | 값 |
|---|---|
| 페이지 좌우 패딩 | `px-5` (20px) |
| 섹션 간격 (카드 영역) | `space-y-4` (16px) |
| 카드 내부 패딩 | `p-5` (20px) |
| 타이틀 → 첫 섹션 | `pt-3` ~ `pt-4` |
| 스크롤 하단 여백 | `pb-12` (플로팅 탭바 고려) |

---

## Border Radius

| 요소 | 값 |
|---|---|
| 모든 카드 | `rounded-2xl` (16px) |
| 뱃지, 필 | `rounded-full` |
| 플로팅 탭바 | `rounded-2xl` |
| 내부 하이라이트 박스 | `rounded-xl` (12px) |

---

## Card Recipes

### White Card

```
class="card"
```
```css
/* globals.css */
.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.04);
}
```
- 그림자 대신 0.5px 테두리로 카드 경계 표현
- 무거운 shadow 사용 금지

### Dark Card

```html
<div class="rounded-2xl bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900 p-5 overflow-hidden">
```
- 텍스트: white / stone-300 / stone-500
- 액센트: coral `#E8725C`
- 아이콘 배경: `stone-700`

### Coral Gradient Card

```html
<div class="rounded-2xl bg-gradient-to-br from-[#E8725C] via-[#e06a52] to-[#cf5a44] p-6 text-white relative overflow-hidden">
```
- 장식용 반투명 원: `bg-white/[0.06]`, `bg-white/[0.04]`
- 태그: `bg-white/15 rounded-full`

### Alert Card

```html
<div class="rounded-2xl bg-red-50 border border-red-100/60 px-4 py-3.5">
```

---

## Visual Rhythm

### 규칙

1. **같은 스타일의 카드를 3개 이상 연속 배치하지 않는다**
   - White card가 2개 연속이면, 그 다음은 dark 또는 coral 또는 카드 없는 섹션
2. **다크 섹션은 페이지당 1~2개**
   - 너무 많으면 무거워짐
3. **코랄 그라디언트 섹션은 페이지당 1개**
   - 강조가 분산되면 효과 없음
4. **타임라인이나 리스트는 카드 배경 없이** 페이지 배경 위에 직접
5. **Alert는 조건부** — 항상 보이는 게 아니므로 리듬 계산에서 제외

### 현재 대시보드 리듬

```
텍스트    → 페이지 배경 (#FFF8F0)
Alert    → red-50 (조건부)
Voice    → DARK
Stats    → WHITE (3칸 그리드)
Mood     → WHITE
Insight  → CORAL
Cards    → 카드 없음 (타임라인)
```

### 새 섹션 추가 시

배치 전에 위아래 섹션의 배경색을 확인하고 겹치지 않게 선택합니다.

---

## Interactions

### Pressable

모든 터치 가능한 요소에 적용:
```css
.pressable {
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.pressable:active {
  transform: scale(0.97);
  opacity: 0.85;
}
```

### Animations

| 이름 | 용도 | 속성 |
|---|---|---|
| `waveform` | 음성 플레이어 바 | height 30%↔100%, 0.5~1.2s, infinite |
| `pulse-dot` | 경고 표시 점 | scale 1→1.3 + opacity, 2s, infinite |

---

## Layout

### Mobile Frame

- `max-w-[430px]` centered
- `h-dvh` (dynamic viewport height)
- 외부 배경: `#f2f1ef` (회색 톤, 프레임 밖)

### Header

- 높이: `h-12` (48px)
- `sticky top-0 z-50`
- Frosted glass: `bg-[#FFF8F0]/80 backdrop-blur-xl`

### Floating Tab Bar

- `absolute bottom-5 left-5 right-5 z-50`
- `rounded-2xl bg-[#FFF8F0]/80 backdrop-blur-xl`
- `shadow-lg shadow-stone-900/[0.08] border border-stone-200/40`
- 탭 2개: Updates (heart, coral) / Settings (gear, stone-300)

---

## Do's & Don'ts

### Do

- stone 계열 + coral로 색상 표현
- 섹션마다 비주얼 톤 교차 (light → dark → light → coral)
- 0.5px 테두리, 최소한의 그림자
- uppercase + tracking-widest 라벨 패턴 일관 유지
- `rounded-2xl` 통일
- 이모지는 기분 표시, 아이콘 대용으로 절제하여 사용

### Don't

- blue, violet, purple 등 팔레트 외 색상 사용
- serif 폰트 혼용
- 카드에 heavy box-shadow 적용
- 같은 스타일 카드 3개 연속 배치
- 새 그라디언트 색 임의 도입
- 외부 UI 라이브러리 도입 (Tailwind만 사용)
- 과도한 장식 요소 (패턴, 일러스트, 복잡한 아이콘)
