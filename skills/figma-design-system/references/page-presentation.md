# Page presentation (documentation-style frames)

Part of the [figma-design-system skill](../SKILL.md). Convention for how component and foundations output gets framed on the canvas — not just floating loose. Verified live: see the "Button" page frame (`157:341`) wrapping the button variant set (`154:325`).

Every catalog entry (a component's variant set, a foundations category) gets wrapped in one titled page frame instead of sitting bare on the canvas:

```
FRAME "<Name> — page"   (vertical auto-layout, hug height, fixed width = content width + 64)
├── FRAME "Header"        (vertical auto-layout, FILL width, dark fill, padding ~20-24)
│   ├── TEXT title        (white, semi-bold, ~18px)
│   └── TEXT subtitle     (light gray ~#a6a6ad, regular, ~12px, one line describing the entry)
└── FRAME "Content"       (vertical auto-layout, FILL width, transparent fill, padding ~32)
    └── the actual component set / foundation sections
```

## Verified script pattern

**Position it away from existing content first — every `figma.createFrame()` defaults to (0,0), and every page frame built this way defaults to the same spot, so a second one silently stacks on top of the first.** Compute an offset from what's already on the page before creating the new one:

```js
const existing = figma.currentPage.children.filter(function(n) { return n.type === 'FRAME'; });
let nextX = 0;
for (const n of existing) nextX = Math.max(nextX, n.x + n.width + 80); // 80px gap

const target = await figma.getNodeByIdAsync(targetId); // the component set, or a foundations content frame
const contentWidth = target.width;

const page = figma.createFrame();
page.name = name + ' — page';
page.layoutMode = 'VERTICAL';
page.itemSpacing = 0;
page.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.97 } }];
figma.currentPage.appendChild(page);
page.resize(contentWidth + 64, 100); // resize BEFORE sizing modes - resize() resets them to FIXED
page.x = nextX;
page.y = 0;
page.primaryAxisSizingMode = 'AUTO';   // hug height
page.counterAxisSizingMode = 'FIXED';  // fixed width

const header = figma.createFrame();
header.name = 'Header';
header.layoutMode = 'VERTICAL';
header.itemSpacing = 4;
header.paddingLeft = 24; header.paddingRight = 24;
header.paddingTop = 20; header.paddingBottom = 20;
header.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.09, b: 0.11 } }];
page.appendChild(header);              // append BEFORE setting FILL
header.primaryAxisSizingMode = 'AUTO';
header.layoutSizingHorizontal = 'FILL';

await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

const title = figma.createText();
title.fontName = { family: 'Inter', style: 'Semi Bold' };
title.characters = name;
title.fontSize = 18;
title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
header.appendChild(title);

const subtitle = figma.createText();
subtitle.fontName = { family: 'Inter', style: 'Regular' };
subtitle.characters = subtitleText;
subtitle.fontSize = 12;
subtitle.fills = [{ type: 'SOLID', color: { r: 0.65, g: 0.65, b: 0.68 } }];
header.appendChild(subtitle);

const content = figma.createFrame();
content.name = 'Content';
content.layoutMode = 'VERTICAL';
content.paddingLeft = 32; content.paddingRight = 32;
content.paddingTop = 32; content.paddingBottom = 32;
content.fills = []; // transparent - page's own background shows through
page.appendChild(content);
content.primaryAxisSizingMode = 'AUTO';
content.layoutSizingHorizontal = 'FILL';

content.appendChild(target);
target.x = 0; target.y = 0; // reset position after reparenting - it does not happen automatically
```

## Foundations: labeled swatch sections inside the content frame

For a foundations page (color ramps, spacing scale, etc.), the `Content` frame holds one sub-section per category instead of a single component set:

```js
const section = figma.createFrame();
section.name = 'Section: ' + categoryName;
section.layoutMode = 'VERTICAL';
section.itemSpacing = 8;
section.fills = [];
section.layoutSizingHorizontal = 'FILL'; // set after appendChild to `content`

const sectionLabel = figma.createText();
sectionLabel.fontName = { family: 'Inter', style: 'Semi Bold' };
sectionLabel.characters = categoryName; // e.g. "Blue", "Spacing"
sectionLabel.fontSize = 13;

// one row per token in the category:
const row = figma.createFrame();
row.layoutMode = 'HORIZONTAL';
row.itemSpacing = 12;
row.counterAxisAlignItems = 'CENTER';
row.fills = [];

const swatch = figma.createRectangle();
swatch.resize(20, 20);
swatch.cornerRadius = 4;
swatch.fills = [{ type: 'SOLID', color: tokenColor }]; // omit for non-color tokens (spacing, etc.)

const label = figma.createText();
label.characters = tokenName + '   ' + tokenValueDisplay; // e.g. "Blue/500   #2563EB"
label.fontSize = 12;
```

Stack rows into `section` in a loop, `section`s into `content` — same pattern as the button example, one level deeper. Don't build every category in one script; one section (or a few) per `eval_script` call, per the skill's "work in small steps" rule.

## Notes

- Colors and exact copy here are illustrative — adapt palette/wording to the actual brief, don't reuse this doc's specific values as if they were a spec (see `CLAUDE.md`'s design principles: ground every design in its actual subject).
- This pattern was prompted by a user-supplied reference image (color-palette documentation frames) — deliberately not copied, adapted into a reusable structural convention instead.
