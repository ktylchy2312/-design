# Components and variants

Part of the [figma-design-system skill](../SKILL.md).

## Create a component

```js
const comp = figma.createComponent();
comp.resize(80, 32);
comp.name = "State=Default"; // "Prop=Value" — read by combineAsVariants later
figma.currentPage.appendChild(comp);
// build its contents (fills, children, auto-layout) the same way you would a frame
return { nodeId: comp.id };
```

`figma.createComponent()` makes an empty 80×32-ish `ComponentNode` — treat it like a frame (auto-layout, fills, children all work the same). To convert an *existing* node into a component instead of building fresh, use `figma.createComponentFromNode(node)`.

## Combine into a variant set

Every component being combined must already be named `"Prop=Value"` (or `"Prop=Value, Prop2=Value2"` for multiple variant properties) — `combineAsVariants` reads the variant grid from these names, there's no separate parameter for it.

```js
const c1 = await figma.getNodeByIdAsync(defaultId);
const c2 = await figma.getNodeByIdAsync(hoverId);
const set = figma.combineAsVariants([c1, c2], figma.currentPage);
// combineAsVariants does NOT lay out the variants — position them yourself:
const colWidth = 120, rowHeight = 56, numCols = 2;
set.children.forEach((child, i) => {
  child.x = (i % numCols) * colWidth;
  child.y = Math.floor(i / numCols) * rowHeight;
});
let maxX = 0, maxY = 0;
for (const child of set.children) {
  maxX = Math.max(maxX, child.x + child.width);
  maxY = Math.max(maxY, child.y + child.height);
}
set.resizeWithoutConstraints(maxX + 40, maxY + 40); // pad, and use actual bounds not a formula
return { componentSetId: set.id };
```

Passing frames (not `ComponentNode`s) throws. Resizing a `COMPONENT_SET` uses `resizeWithoutConstraints`, not `resize`.

## Component properties (beyond variants)

```js
const propKey = comp.addComponentProperty("Label", "TEXT", "Button"); // returns the key STRING directly
labelTextNode.componentPropertyReferences = { characters: propKey };
```

Never guess the key format (it looks like `"label#4:0"` but the suffix is unpredictable) — always use the returned value.

Reading properties back: only from a `COMPONENT_SET`, or a `COMPONENT` whose parent is *not* a `COMPONENT_SET` (i.e. a non-variant component). A variant `COMPONENT`'s own `componentPropertyDefinitions` throws — go to `node.parent` if `node.parent.type === "COMPONENT_SET"`.

## Instances

```js
const instance = comp.createInstance(); // comp must be a ComponentNode
figma.currentPage.appendChild(instance);
instance.x = 100; instance.y = 100;
return { nodeId: instance.id };
```
