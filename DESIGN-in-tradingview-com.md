# Design System Inspired by TradingView

> Auto-extracted from `https://in.tradingview.com/` on 2026-08-20

## 1. Visual Theme & Atmosphere

High-contrast dark mode with vivid accents — feels modern, technical, and focused.

The hero section leads with "The best trades require research, then commitment." followed by "Get started for free$0 forever, no credit card needed".

**Key Characteristics:**
- -apple-system as the heading font
- -apple-system as the body font for all running text
- Heading weight 700
- Dark background (#181a1b) as the primary canvas
- Primary accent `#3391ff` used for CTAs and brand highlights
- 2 shadow level(s) detected — tinted shadows
- Rounded corners (50px+) creating a friendly, approachable feel
- Tags: dark, rounded, colorful, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#3391ff`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#3179f5`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#181a1b`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#000000`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#dfdcd7`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#545b5f`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#1b1e1f`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#181a1b` | `--palette-1` | button | large | text-light |
| 2 | `#000000` | `--palette-2` | section | large | text-light |
| 3 | `#232627` | `--palette-3` | block | medium | text-light |
| 4 | `#067a40` | `--palette-4` | badge | medium | text-light |
| 5 | `#3391ff` | `--palette-5` | text-accent | small | text-dark |
| 6 | `#1b8976` | `--palette-6` | badge | small | text-light |
| 7 | `#3179f5` | `--palette-7` | button | small | text-light |
| 8 | `#ff3333` | `--palette-8` | badge | small | text-light |
| 9 | `#55c4b1` | `--palette-9` | text-accent | small | text-dark |
| 10 | `#e0ddd9` | `--palette-10` | badge | small | text-dark |
| 11 | `#545b5f` | `--palette-11` | badge | small | text-light |

## 3. Typography Rules

- **Heading Font:** `-apple-system`, sans-serif
- **Body Font:** `-apple-system`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | -apple-system | 28px | 700 | normal | normal |
| H2 | EuclidCircularSemibold | 64px | 600 | 64px | -2.56px |
| H3 | -apple-system | 28px | 600 | 36px | normal |
| Body | -apple-system | 16px | 400 | 24px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `64px` | headings |
| H1 | `40px` | headings |
| H2 | `36px` | headings |
| H3 | `28px` | headings |
| H4 | `24px` | headings |
| Body L | `20px` | body / supporting text |
| Body | `18px` | body / supporting text |
| Small | `16px` | body / supporting text |
| XS | `14px` | body / supporting text |
| Caption | `12px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #e8e6e3;
  border-radius: 32px;
  padding: 11px 9px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #e8e6e3;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 0px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #232627;
  color: #9f978b;
  border-radius: 40px;
  padding: 6px 6px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #e8e6e3;
  border-radius: 36px;
  padding: 6px 12px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 3

```css
.btn-ghost-3 {
  background: transparent;
  color: #dfdcd7;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #232627;
  color: #e8e6e3;
  border-radius: 17px;
  padding: 0px 11px;
  font-size: 14px;
  font-weight: 400;
  border: 0.8px solid rgb(125, 116, 103);
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `4px` | element |
| spacing-3 | `16px` | element |
| spacing-4 | `1px` | element |
| spacing-5 | `6px` | element |
| spacing-6 | `12px` | element |
| spacing-7 | `5px` | element |
| spacing-8 | `2px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `50px` | card |
| radius-button | `8px` | button |
| radius-card | `16px` | card |
| radius-button | `12px` | button |
| radius-subtle | `4px` | subtle |
| radius-button | `6px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0.2) 0px 2px 4px 0px` | Cards, subtle elevation |
| Deep | `rgb(255, 76, 161) 16px 0px 56px -12px, rgb(14, 78, 255) -16px 0px 56px -12px` | Hero sections, deep layers |


## 7. Do's and Don'ts

### Do
- Use `#181a1b` as the primary background color
- Use `-apple-system` for all headings and `-apple-system` for body text
- Use `#3391ff` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Keep the overall feel dark — use dark surfaces throughout
- Use rounded corners (`50px`+) consistently for all interactive elements
- Embrace bold color combinations — playful energy is the point
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 700 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute -apple-system/-apple-system with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't introduce bright white surfaces — they break the dark palette
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#dfdcd7` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #181a1b
Text:        #dfdcd7
Accent:      #3391ff
Secondary:   #3179f5
Border:      #1b1e1f
```

### Example Prompts

1. "Build a hero section with a `#181a1b` background, `-apple-system` heading in `#dfdcd7`, and a `#3391ff` CTA button with 40px radius."
2. "Create a pricing card using background `#000000`, border `#1b1e1f`, `-apple-system` for text, and 24px padding."
3. "Design a navigation bar — `#181a1b` background, `#dfdcd7` links, `#3391ff` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#dfdcd7` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 1027 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--darkreader-neutral-background` | `var(--darkreader-background-ffffff, #181a1b)` |
| `--darkreader-neutral-text` | `var(--darkreader-text-000000, #e8e6e3)` |
| `--darkreader-selection-background` | `var(--darkreader-background-0060d4, #004daa)` |
| `--darkreader-selection-text` | `var(--darkreader-text-ffffff, #e8e6e3)` |
| `--darkreader-background-ffffff` | `#181a1b` |
| `--darkreader-text-ffffff` | `#e8e6e3` |
| `--darkreader-border-404040` | `#776e62` |
| `--darkreader-text-000000` | `#e8e6e3` |
| `--darkreader-border-4c4c4c` | `#736b5e` |
| `--darkreader-text-0040ff` | `#3391ff` |
| `--darkreader-border-808080` | `#545b5e` |
| `--darkreader-text-a9a9a9` | `#b2aba1` |
| `--darkreader-background-faffbd` | `#404400` |
| `--darkreader-background-0060d4` | `#004daa` |
| `--darkreader-background-ffd76e` | `#684b00` |
| `--darkreader-background-c59d00` | `#9e7e00` |
| `--darkreader-text-302505` | `#d7d4cf` |
| `--darkreader-background-add8e6` | `#1b4958` |
| `--darkreader-background-cfecf5` | `#0f3a47` |
| `--darkreader-background-f5f5f5` | `#1e2021` |
| `--darkreader-background-faedda` | `#432c09` |
| `--darkreader-background-85c3d8` | `#245d70` |
| `--darkreader-background-e6e6e6` | `#26292b` |
| `--darkreader-background-f9f9f9` | `#1b1e1f` |
| `--darkreader-background-00000000` | `rgba(0, 0, 0, 0)` |
| `--darkreader-background-ececec` | `#232627` |
| `--darkreader-border-ececec` | `#353a3c` |
| `--darkreader-background-d1dbf0` | `#292d2e` |
| `--darkreader-border-d1dbf0` | `#1e315b` |
| `--darkreader-background-e1e7f5` | `#232628` |
| ... | *(993 more)* |

### Typography Variables

| Variable | Value |
|---|---|
| `--tooltip-font-color` | `initial` |
| `--darkreader-text--tooltip-font-color` | `initial` |

### Other Variables

| Variable | Value |
|---|---|
| `--color-cold-gray-500` | `grey` |
| `--color-youtube` | `red` |
