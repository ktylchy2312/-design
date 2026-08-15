# Typography variables

Part of the [figma-design-system skill](../SKILL.md). For legacy Text Styles instead of Variables, see [foundations-styles.md](foundations-styles.md) — use that when the file's plan can't support the modes you need (see limits below), or when the target is simpler shared text styles rather than mode-based tokens.

## Create a collection and variables

```js
const collection = figma.variables.createVariableCollection("Typography");
collection.renameMode(collection.modes[0].modeId, "Default"); // starts as "Mode 1" - always rename

const fontSizeVar = figma.variables.createVariable("Size/Body", collection, "FLOAT");
fontSizeVar.scopes = ["FONT_SIZE"]; // narrow scope - default is ALL_SCOPES, which clutters every picker
fontSizeVar.setValueForMode(collection.modes[0].modeId, 16);

const fontFamilyVar = figma.variables.createVariable("Family/Body", collection, "STRING");
fontFamilyVar.scopes = ["FONT_FAMILY"];
fontFamilyVar.setValueForMode(collection.modes[0].modeId, "Roboto"); // this project's actual family - see tokens-built.md, don't assume Inter

return { collectionId: collection.id, fontSizeVarId: fontSizeVar.id, fontFamilyVarId: fontFamilyVar.id };
```

Multiple modes (e.g. Desktop/Mobile scale): `collection.addMode("Mobile")` returns a new mode id, then `variable.setValueForMode(mobileModeId, 14)`. **Mode count is plan-capped**: Free — 1 mode only, no `addMode`; Professional — up to 4; Organization/Enterprise — 40+. If a design needs more modes than the plan allows, split into multiple single/few-mode collections rather than one large one.

## Binding a variable to a text node

Scalar text fields bind directly via `setBoundVariable`:

```js
await figma.loadFontAsync(textNode.fontName); // font must be loaded before binding font-related fields
textNode.setBoundVariable("fontSize", fontSizeVar);
textNode.setBoundVariable("fontFamily", fontFamilyVar);
// also bindable this way: fontStyle, fontWeight, letterSpacing, lineHeight, paragraphSpacing, paragraphIndent
return { nodeId: textNode.id };
```

For binding only a sub-range of characters within a text node, use `setRangeBoundVariable`/`getRangeBoundVariable` instead of the whole-node setter.

Binding a *color* variable into a fill is different — it goes through the paint, not the node directly, and returns a new paint object you must reassign:

```js
const basePaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
const boundPaint = figma.variables.setBoundVariableForPaint(basePaint, "color", colorVar);
textNode.fills = [boundPaint]; // must reassign - setBoundVariableForPaint does not mutate in place
```

`COLOR`-type variable values use `{r, g, b, a}` (the one place alpha lives inside `color` — everywhere else it's a separate `opacity` field).
