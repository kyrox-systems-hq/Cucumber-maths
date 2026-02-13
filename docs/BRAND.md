# Cucumber — Brand Foundation v1 (Corrected)

**Serial:** CUC-20260213-016

## Brand Tone

- Hyper-modern engineered.
- Premium. Calm. Precise.
- Green-led system identity.
- No blue undertones. No fintech navy bias.

---

## Colour System

### Dark Mode (Primary Identity)

#### Foundations (Neutral Charcoal — No Blue Cast)

| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#0F1112` | Page background |
| `--bg-surface` | `#171A1C` | Cards, panels |
| `--bg-elevated` | `#1E2226` | Hover states, raised surfaces |

These are neutral graphite tones. They must not visually lean navy.

#### Accent (Green-Led System)

| Token | Value | Notes |
|---|---|---|
| `--accent-primary` | `#2ADDB0` | Refined Mint — primary action colour |
| `--accent-secondary` | `#4CCFC0` | Soft Aqua — hover, secondary emphasis |

**Rules:**
- Mint = primary action colour
- Aqua = hover, secondary emphasis
- Mint is not a data colour
- No glow effects
- No neon saturation

#### Text (Neutral Greys)

| Token | Value |
|---|---|
| `--text-primary` | `#E8ECEF` |
| `--text-secondary` | `#A0A6AD` |
| `--text-muted` | `#6E747B` |

No cool-blue greys.

#### States

| State | Value |
|---|---|
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#38BDF8` |

State colours remain conventional for clarity.

#### Borders

- Hairline: `rgba(255, 255, 255, 0.06)`
- No heavy separators
- No drop shadows on cards

---

### Light Mode (True White Foundation)

#### Foundations

| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Clean white base |
| `--bg-surface` | `#F6F7F8` | Cards, panels |
| `--bg-elevated` | `#EEF1F3` | Hover states, raised surfaces |

Clean white base. No cream. No blue tint.

#### Accent

| Token | Value |
|---|---|
| `--accent-primary` | `#00B88A` |
| `--accent-secondary` | `#1FC7B6` |

Same family as dark mode. Slightly toned for white background contrast.

#### Text

| Token | Value |
|---|---|
| `--text-primary` | `#0F1418` |
| `--text-secondary` | `#4B5560` |
| `--text-muted` | `#94A3B8` |

Neutral, not cool.

#### Borders

- Hairline: `rgba(0, 0, 0, 0.06)`

---

## Typography

### UI Font — Hanken Grotesk

| Weight | Usage |
|---|---|
| 400 | Body |
| 500 | Labels |
| 600 | Headings |

**Settings:**
- Base size: 16px
- Body line-height: 1.55
- Headings: 1.2 to 1.3
- No negative tracking
- Avoid heavy bold
- Tone: Calm. Structured. Easy on the eyes.

### Mono / Ledger Font — Geist Mono

**Settings:**
- 14px
- Line-height: 1.6
- Code colour (dark): `#C9D1D9`
- Ledger background (dark): `#141922`
- Ledger border: `rgba(255, 255, 255, 0.05)`
- Tabular numerals required: `font-variant-numeric: tabular-nums;`

Ledger must feel inspectable and serious.

---

## Spacing & Layout

| Property | Value |
|---|---|
| Card padding | 24px |
| Section spacing | 32px |
| Page spacing | 48px |
| Radius | 10px only |

- No pills
- No glow
- No heavy shadows
- Minimal elevation hierarchy

---

## Motion

- 150 to 200ms
- `ease-in-out`
- No bounce
- No elastic animations
- Hover shifts subtle, 5–8% change

---

## Data Visualisation Palette

Reduced saturation, distinct from mint system colour:

| Name | Value |
|---|---|
| Teal | `#14B8A6` |
| Indigo | `#6366F1` |
| Amber | `#F59E0B` |
| Rose | `#F43F5E` |
| Sky | `#38BDF8` |
| Violet | `#8B5CF6` |

**Rules:**
- Mint is never used as dataset colour
- Gridlines subtle
- Avoid high-contrast neon charts
