# Cucumber — Brand Foundation v2 (Premium Teal Instrument)

## Brand Character

- Hyper-modern engineered.
- Premium. Calm. Precise.
- Energy through contrast, not saturation.
- Instrument-grade UI.

**Not** playful. **Not** fintech navy. **Not** nursery green.

---

## Colour System

### Dark Mode (Primary Identity)

#### Foundations (Near-Black Instrument)

| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#0B0C0D` | Page background |
| `--bg-surface` | `#141617` | Cards, panels |
| `--bg-elevated` | `#1C1F21` | Hover states, raised surfaces |

Neutral charcoal. No blue undertone.

#### Accent (Refined Teal)

| Token | Value | Notes |
|---|---|---|
| `--accent-primary` | `#1F6F6D` | Primary — functional, not decorative |
| `--accent-secondary` | `#2E8F8C` | Secondary — hover, emphasis |

**Rules:**
- Teal is functional, not decorative
- No neon
- No glow
- No gradients as backgrounds

#### Text (Neutral Greys)

| Token | Value |
|---|---|
| `--text-primary` | `#E9ECEF` |
| `--text-secondary` | `#A1A6AB` |
| `--text-muted` | `#6E7378` |

Strictly neutral. No cool tint.

#### Borders

- `--border-hairline`: `rgba(255, 255, 255, 0.06)`
- Subtle elevation only via tonal separation
- No card shadows

#### State Colours

| State | Value | Notes |
|---|---|---|
| Success | `#1F8A5B` | Muted, not bright |
| Warning | `#C58F2C` | Muted, not bright |
| Error | `#C04747` | Muted, not bright |
| Info | `#3A8FB7` | Muted, not bright |

---

### Light Mode (True White Foundation)

#### Foundations

| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Clean white base |
| `--bg-surface` | `#F3F5F6` | Cards, panels |
| `--bg-elevated` | `#E9EDF0` | Hover states, raised surfaces |

Clean white. No cream. No blue wash.

#### Accent (Same Teal Family)

| Token | Value |
|---|---|
| `--accent-primary` | `#1F6F6D` |
| `--accent-secondary` | `#2E8F8C` |

No mint shift between modes.

#### Text

| Token | Value |
|---|---|
| `--text-primary` | `#0F1418` |
| `--text-secondary` | `#4B5560` |
| `--text-muted` | `#94A3B8` |

#### Borders

- `--border-hairline`: `rgba(0, 0, 0, 0.06)`

---

## Glassmorphism System (Controlled, Premium)

Glass is used **only** for: Header, Sidebars, Floating panels, Modals, Popovers.
**Never** for charts or core content blocks.

### Dark Mode Glass

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

- Opacity under 0.06
- Blur 10–14px
- No colour tint in glass
- No glow, no heavy shadow
- Glass should feel etched and structural

### Light Mode Glass

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(0, 0, 0, 0.06);
```

Subtle. Never frosted candy.

---

## Typography

### Primary UI Font — Hanken Grotesk

| Weight | Usage |
|---|---|
| 400 | Body |
| 500 | Labels |
| 600 | Headings |

- Base: 16px
- Body line-height: 1.55
- Headings: 1.2–1.3
- No negative tracking
- No heavy bold
- Tone: Clean, structured, easy on the eyes.

### Mono / Ledger Font — Geist Mono

- 14px
- Line-height: 1.6
- Code colour (dark): `#C9D1D9`
- Ledger background (dark): `#111315`
- Ledger border: `rgba(255, 255, 255, 0.05)`
- `font-variant-numeric: tabular-nums;`
- Ledger must feel precise and inspectable.

---

## Spacing & Layout

| Property | Value |
|---|---|
| Card padding | 24px |
| Section spacing | 32px |
| Page spacing | 48px |
| Border radius | 10px only |

- No pills
- No `rounded-full` except scrollbars if required
- No glow effects
- No heavy shadows

---

## Motion

- Duration: 150–200ms
- `ease-in-out`
- No bounce, no elastic curves
- Hover changes subtle
- Energy comes from crisp interaction, not animation drama

---

## Data Visualisation Palette (Reduced Saturation)

| Name | Value |
|---|---|
| Teal | `#2E8F8C` |
| Deep Blue | `#3F5C7A` |
| Muted Indigo | `#5C6BC0` |
| Amber | `#C58F2C` |
| Deep Rose | `#A94A5A` |
| Slate | `#64748B` |

**Rules:**
- Accent teal not overused in charts
- No neon series colours
- Subtle gridlines only

---

## Design Principles

1. Near-black charcoal base
2. Muted teal energy
3. White light mode foundation
4. Controlled glass layers
5. No saturation-driven excitement
6. Premium through restraint
7. **Instrument, not dashboard**
