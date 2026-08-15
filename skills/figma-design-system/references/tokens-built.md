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

Tailwind's numeric naming convention, `FLOAT`, `scopes: ["GAP", "WIDTH_HEIGHT"]`: `space-0` (0), `space-0-5` (2px), `space-1` (4), `space-1-5` (6), `space-2` (8), `space-3` (12), `space-4` (16), `space-5` (20), `space-6` (24), `space-8` (32), `space-10` (40), `space-12` (48), `space-16` (64), `space-20` (80), `space-24` (96), `space-32` (128), `space-40` (160), `space-48` (192), `space-64` (256).

**Variable names can't contain a literal `.`** — `createVariable` throws `invalid variable name`. Use `-` instead (`space-0-5`, not `space-0.5`) — this is why the naming departs slightly from Tailwind's own `0.5` class suffix.

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
