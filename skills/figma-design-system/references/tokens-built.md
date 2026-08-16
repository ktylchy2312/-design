# Tokens actually built in this file

Part of the [figma-design-system skill](../SKILL.md). Ground truth for what already exists in the Figma document — check here before creating a token that might already exist. Source reference: `assets/screenshots/ui components/OC-Kontrol-Board-prototype.html` (colors/spacing/radius/font values grepped from its inline styles, consolidated into clean scales — not every literal pixel value from that file was kept).

## Colors — collection `Color`, one mode

All `COLOR` type, `scopes: ["ALL_SCOPES"]`. Naming: `<Group>/<step>`.

| Group | Steps | Notes |
|---|---|---|
| `Neutral` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Dark-theme grayscale. 50 = brightest text, 950 = darkest background. |
| `Primary` | 100, 300, 500, 700, 900 | Brand orange (`#fe6d20` at 500). |
| `Secondary` | 300, 500, 700 | Neutral-toned, for secondary actions — this reference has no distinct second brand hue, so these alias Neutral's mid tones rather than inventing an unrelated color. |
| `Success` | 100, 500, 700 | Green. |
| `Danger` | 100, 500, 700 | Red. |
| `Warning` | 100, 500, 700 | Gold/amber. |
| `Info` | 100, 500, 700 | Blue-gray. |

## Spacing — collection `Spacing`, one mode

Renamed semantically (superseded the original Tailwind-numeric version) — `FLOAT`, `scopes: ["GAP", "WIDTH_HEIGHT"]`, each variable's `description` holds its pixel value. Trimmed to top out at 128px (no `160`/`192`/`256` steps) — nothing in this file needs spacing beyond that.

| Name | Value | Use for |
|---|---|---|
| `space-none` | 0 | Touching elements, no gap |
| `space-hairline` | 2 | Border-scale separation |
| `space-icon-gap` | 4 | Between an icon and its adjacent label |
| `space-tag-gap` | 6 | Inside small tags/badges |
| `space-compact` | 8 | Dense list rows, badge internal padding |
| `space-tight` | 12 | Button/input internal padding, compact row gaps |
| `space-default` | 16 | Base unit — default gap/padding for most components, use this when nothing more specific applies |
| `space-comfortable` | 20 | Relaxed list item spacing |
| `space-card-padding` | 24 | Internal padding for cards/panels |
| `space-section-gap` | 32 | Gap between major sections, sidebar padding |
| `space-panel-padding` | 40 | Large panel/container padding |
| `space-modal-padding` | 48 | Modal/dialog padding |
| `space-layout-gap` | 64 | Gap between top-level layout regions (sidebar vs. content) |
| `space-hero-padding` | 80 | Hero/feature area padding |
| `space-page-margin` | 96 | Outer page margin |
| `space-page-padding-xl` | 128 | Largest page-level padding, top of the scale |

**Variable names can't contain a literal `.`** — `createVariable` throws `invalid variable name`. Use `-` instead — this bit the original numeric naming (`space-0.5` failed, `space-0-5` worked) and doesn't come up with semantic names, but keep it in mind for any future numeric-suffixed token.

## Radius — collection `Radius`, one mode

Tailwind's radius naming, `FLOAT`, `scopes: ["CORNER_RADIUS"]`: `radius-none` (0), `radius-sm` (2), `radius-default` (4), `radius-md` (6), `radius-lg` (8), `radius-xl` (12), `radius-2xl` (16), `radius-3xl` (24), `radius-full` (9999 — clamps to a pill/circle on any normal-sized node, that's expected).

## Breakpoints — collection `Breakpoints`, one mode

`FLOAT`, `scopes: []` (reference-only — nothing in Figma binds to a breakpoint, so it's deliberately hidden from every property picker): `breakpoint-sm` (640), `breakpoint-md` (768), `breakpoint-lg` (1024), `breakpoint-xl` (1280), `breakpoint-2xl` (1536).

## Typography — text styles, not variables

Single family: **Roboto** (confirmed via `listAvailableFontsAsync` — this file has the full Roboto family including Condensed/Black/Thin variants, but only Regular/Medium/Bold are used here). Roboto's style strings have **no space** (`"Bold"`, `"Medium"`, `"SemiBold"` — not `"Semi Bold"`), unlike some other families.

| Style name | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| `Type/Display` | 32 | Bold | 120% | — |
| `Type/Heading` | 21 | Bold | 130% | 0.4px |
| `Type/Title` | 18 | Medium | 130% | — |
| `Type/Body` | 15 | Regular | 150% | — |
| `Type/Body-Medium` | 15 | Medium | 150% | — |
| `Type/Label` | 13 | Medium | 140% | 0.5px |
| `Type/Caption` | 12 | Regular | 140% | — |
| `Type/Micro` | 10.5 | Regular | 130% | 0.3px |

## Style guide pages on canvas

Three page frames (see `page-presentation.md` for the header/content structure), each a swatch/specimen catalog of the above: **Colors — page**, **Typography — page**, **Layout tokens — page** (spacing + radius + breakpoints together). Rebuild by rerunning the same op — deleting and recreating a collection by name is safe (`collection.remove()`) and is how these get corrected when values change; don't leave stale duplicate collections around.
