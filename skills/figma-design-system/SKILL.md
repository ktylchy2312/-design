---
name: figma-design-system
description: Recipes and API gotchas for building Figma components with variants, foundations (paint/text/effect styles), and typography variables in the currently open Figma document. Load when asked to create a component, add a variant, set up styles/tokens, or create/bind typography variables. Not for single-node edits (create/move/style one shape) - that's the figma-live-bridge agent's generic ops directly. This skill only covers what JS to send through eval_script - it assumes the bridge (relay + plugin) is already connected.
---

# figma-design-system

Everything here is sent as one `eval_script` call (or a `--batch` of a few) to `figma-plugin/bridge/cli.mjs`, per `agents/design-system.md`. The plugin itself knows nothing about components, styles, or variables — it just executes whatever script this skill hands it. See `figma-plugin/README.md` for the transport.

## Critical rules

1. **Colors are 0–1, not 0–255.** `{r: 1, g: 0, b: 0}` is red. Paint `color` never carries `a` — opacity goes on the paint object itself (`{ type: 'SOLID', color: {...}, opacity: 0.5 }`). Exception: a variable's own `COLOR` value *does* use `{r,g,b,a}`.
2. **`width`/`height` are read-only** — use `node.resize(w, h)`. `x`/`y` are writable directly.
3. **`lineHeight`/`letterSpacing` are objects, never bare numbers**: `{ unit: "AUTO" }`, `{ value: 24, unit: "PIXELS" }`, `{ value: 150, unit: "PERCENT" }`.
4a. **A new `figma.createText()` node defaults to Inter Regular (the platform default), not this project's Roboto** — setting `characters` before setting `fontName` throws `Cannot write to node with unloaded font "Inter Regular"` even if you already `loadFontAsync`'d Roboto. Always set `node.fontName = { family: 'Roboto', style: '...' }` explicitly *before* setting `characters`, every time, on every new text node.
4. **Text edits need font-load-first.** `await figma.loadFontAsync(fontName)` before mutating `characters`, `fontSize`, or any styled text property — on a *new* node use its current `fontName`; on an *existing* node read the font(s) actually on it first (`getStyledTextSegments(['fontName'])`), don't assume a default.
5. **`combineAsVariants(nodes, parent)` needs real `ComponentNode`s**, not frames, named `"Prop=Value"` (or `"Prop=Value, Prop2=Value2"`) — it reads variant properties from the name. It does **not** auto-layout the result: variants stack at (0,0) unless you position them into a grid afterward.
6. **`addComponentProperty(name, type, defaultValue)` returns the new property's key as a plain string** — use the return value directly, never guess or reconstruct the key.
7. **`componentPropertyDefinitions` can only be read from a `COMPONENT_SET` or a non-variant `COMPONENT`.** Reading it from a variant `COMPONENT` throws, even with optional chaining — narrow to the parent set first if you have a variant.
8. **A new `VariableCollection` starts with one mode named `"Mode 1"`** — rename it (`collection.renameMode(id, "...")`) rather than leaving the placeholder name.
9. **Variables default to `scopes: ["ALL_SCOPES"]`** — set a narrower scope explicitly (e.g. `["TEXT_FILL"]`, `["GAP"]`) or the variable clutters every property picker in the file.
10. **`figma.variables.setBoundVariableForPaint(paint, field, variable)` returns a new paint object** — the original is unchanged; reassign the return value into `fills`/`strokes`.
11. **Mode-count is plan-capped**: Free 1 mode (no `addMode`), Professional up to 4, Organization/Enterprise 40+. Design a typography collection to need few modes, or split into more than one collection, rather than assuming headroom.
12. **Work in small `eval_script` calls, one component/style/collection at a time**, and report back the created node/style/variable IDs — the same discipline `figma-live-bridge` already uses for its ops.
13. **Wrap output in a titled page frame, not loose canvas objects.** Every component or foundations catalog entry gets a dark header (title + one-line subtitle) over a light content area — see [references/page-presentation.md](references/page-presentation.md) for the verified structure and script pattern.
14. **Variable names can't contain a literal `.`** — `figma.variables.createVariable(name, ...)` throws `invalid variable name` for something like `"space-0.5"`. Use `-` instead (`space-0-5`). Figma's own script execution isn't transactional — a mid-script throw leaves everything created *before* the error committed in the document, so a failed token-creation script needs cleanup (delete the partial collection by name) before retrying, not just a fix-and-rerun.
15. **Composing from existing components**: `component.createInstance()` works on a `COMPONENT` (or a variant's `COMPONENT` child of a set) and can be appended anywhere — the standard way to reuse an already-built component inside a new composition (e.g. a `Badge` instance inside a `StageCard`). For reusing a **plain `FRAME`** composition (not a component) inside another, `node.clone()` works on any node type and is the equivalent move — instances require a `COMPONENT`, clones don't. `figma.root.findAllWithCriteria({ types: ['COMPONENT_SET'] })` / `types: ['COMPONENT']` is the reliable way to look an already-built component up by name across the whole file when you don't have its ID handy.
16. **`layoutMode` frames support `layoutWrap = 'WRAP'`** for CSS-flexbox-style wrapping grids (e.g. a form's field grid) — confirmed working live, no gotcha found.
17. **Check [references/tokens-built.md](references/tokens-built.md) before creating a color/spacing/radius/typography token** — it's the ground truth for what already exists in this file's `Color`/`Spacing`/`Radius`/`Breakpoints` collections and `Type/*` text styles. Don't recreate a token that's already there under a different name.

## References (load only the one you need)

| Doc | Load when |
|---|---|
| [references/component-variants.md](references/component-variants.md) | Creating a component or a variant set |
| [references/foundations-styles.md](references/foundations-styles.md) | Creating or applying paint/text/effect styles |
| [references/typography-variables.md](references/typography-variables.md) | Creating or binding typography variables |
| [references/page-presentation.md](references/page-presentation.md) | Framing any component or foundations output as a titled documentation page instead of loose canvas objects |
| [references/tokens-built.md](references/tokens-built.md) | Need to know exactly what colors/spacing/radius/breakpoints/text styles already exist in this file, by name |
