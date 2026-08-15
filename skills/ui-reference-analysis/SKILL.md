---
name: ui-reference-analysis
description: Analyzes UI component screenshots dropped in "assets/screenshots/ui components/" and writes a structured build brief from each one - layout, colors, typography, states/variants. Use when the user drops reference screenshots there and wants something built to match, or asks to analyze/describe a UI screenshot. Output is a brief/prompt, not a build - hand the result to the design-system agent as a separate, explicit next step. Do not build anything as part of this skill.
---

# ui-reference-analysis

Turns reference screenshots into a build brief precise enough for the `design-system` agent (and the `figma-design-system` skill it uses) to act on — without this skill ever touching Figma itself.

## Steps

1. **Discover images.** `Glob` `assets/screenshots/ui components/*.{png,jpg,jpeg,webp}` (quote the path — it has a space). Skip any `*.brief.md` files already sitting there from a prior run.
2. **Group before analyzing.** If filenames or visual similarity suggest several screenshots are states/variants of the *same* component (e.g. `button-default.png` + `button-hover.png`, or two images differing only in fill color and a label like "hover"), treat them as one component with multiple variants — write one brief covering all of them, not N separate briefs for what's really one thing.
3. **Read each image** (the `Read` tool handles images directly) and describe only what's actually visible:
   - **Component name** — a short, sensible name for what it is (button, card, input, nav bar, etc.)
   - **Variants** — if grouped, name each state in `Prop=Value` form (matches `figma-design-system`'s variant-naming convention, e.g. `State=Default`, `State=Hover`)
   - **Layout** — direction (row/column), approximate padding and gap, alignment, corner radius
   - **Colors** — approximate hex for fills/text/borders, flagged as approximate (say so — don't assert an exact hex you can't actually verify from a screenshot)
   - **Typography** — approximate weight/size/case; name the exact typeface only if genuinely recognizable, otherwise describe it (e.g. "geometric sans, medium weight")
   - **Effects** — shadows, borders, opacity, anything else visible
   - **Notes** — anything ambiguous or low-confidence; say so plainly rather than guessing with false confidence
4. **Write the brief to a file next to the source image(s)**: `<name>.brief.md` in the same folder, one file per component (covering all its grouped variant screenshots). This caches the analysis — a rerun should skip images that already have a matching `.brief.md`, not re-analyze for free.
5. **Report back** which briefs were written (paths) and a one-line summary of what each covers. Don't paste the full brief content back into the conversation if it's already in the file — that's exactly the kind of redundant tokens the token-economy rule exists to avoid.

## Brief format

```markdown
## <Component name>

**Variants:** State=Default, State=Hover, ...  (omit if single, no variants)
**Layout:** direction / padding / gap / alignment / corner radius
**Colors:** fill ~#xxxxxx, text ~#xxxxxx, border ~#xxxxxx (or none)
**Typography:** ~weight, ~size, description or exact family if recognizable
**Effects:** shadow / none / other
**Notes:** anything ambiguous, low-confidence, or worth flagging before building
```

## Boundary

This skill stops at the brief. Building it in Figma is a separate, explicit step for the `design-system` agent — don't invoke that agent automatically just because a brief was written; the user decides when to build.
