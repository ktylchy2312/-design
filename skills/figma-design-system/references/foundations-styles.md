# Foundations: paint, text, and effect styles

Part of the [figma-design-system skill](../SKILL.md).

## Create a style

```js
const brandPaint = figma.createPaintStyle();
brandPaint.name = "Brand/Primary";
brandPaint.paints = [{ type: "SOLID", color: { r: 0.11, g: 0.42, b: 0.9 } }]; // 0-1 range, no `a` in color

const heading = figma.createTextStyle();
heading.name = "Heading/Large";
await figma.loadFontAsync({ family: "Roboto", style: "Bold" }); // Roboto's actual style names have no space: "Bold", "Medium", "SemiBold" - not "Semi Bold". Verified via listAvailableFontsAsync, see below.
heading.fontName = { family: "Roboto", style: "Bold" };
heading.fontSize = 32;
heading.lineHeight = { value: 120, unit: "PERCENT" };

const shadow = figma.createEffectStyle();
shadow.name = "Elevation/Card";
shadow.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, radius: 12, visible: true, blendMode: "NORMAL" }];

return { paintStyleId: brandPaint.id, textStyleId: heading.id, effectStyleId: shadow.id };
```

`createGridStyle()` follows the same pattern for layout grid styles if needed.

## Apply a style to a node

**Verified live: use the async setters.** Sync assignment wasn't tested against this manifest before the async form was confirmed working end-to-end (text styles bound to the button component, see `page-presentation.md`) — just use `setTextStyleIdAsync`/`setFillStyleIdAsync`/`setEffectStyleIdAsync` directly, no need to try sync first:

```js
await node.setFillStyleIdAsync(paintStyleId);
await textNode.setTextStyleIdAsync(textStyleId);
await node.setEffectStyleIdAsync(effectStyleId);
```

## Discovering available fonts before using them

Don't guess a font's style string (`"SemiBold"` vs `"Semi Bold"` is a common mismatch) — discover it first:

```js
const fonts = await figma.listAvailableFontsAsync();
const matches = fonts.filter(f => f.fontName.family === "Roboto").map(f => f.fontName.style);
return matches; // pick the exact string that's actually available
```
