# Figma live bridge (read + write)

Lets Claude Code read the live, currently-open Figma document (selection, active page, node tree) through the Figma Plugin API. See `../docs/BUILD_LOG.md` for why this exists and `../agents/figma-live-bridge.md` for the agent that drives it.

## Setup

1. Install and start the relay (leave it running in its own terminal):
   ```
   cd figma-plugin/bridge
   npm install
   node server.mjs
   ```
   Should print `relay listening on ws://localhost:8765`.

2. In the Figma desktop app: **Plugins → Development → Import plugin from manifest…**, select `figma-plugin/manifest.json`, then run the plugin from the same menu. Its UI should show "connected to relay", and the relay terminal should log `plugin connected`.

## Using it

From a shell, with the relay running and the plugin open in Figma:

```
node figma-plugin/bridge/cli.mjs get_status
node figma-plugin/bridge/cli.mjs get_selection
node figma-plugin/bridge/cli.mjs get_node_tree '{"nodeId": "1:23"}'
```

Each call prints one JSON line: `{"id":"...","ok":true,"result":{...}}` on success, or `{"id":"...","ok":false,"error":"NO_PLUGIN_CONNECTED" | "TIMEOUT" | "..."}` on failure.

## Ops

**Read:**

| Op | Params | Returns |
|---|---|---|
| `get_status` | — | `{ fileKey, pageName, pageId }` |
| `get_selection` | — | array of `{ id, name, type, x, y, width, height }` for each selected node |
| `get_node_tree` | `{ nodeId? }` (defaults to current page) | `{ id, name, type, children: [{ id, name, type, visible }] }` — immediate children only |

**Write** (a generic primitive — every basic node type goes through the same three ops, no per-shape API):

| Op | Params | Returns |
|---|---|---|
| `create_node` | `{ type: "RECTANGLE"\|"ELLIPSE"\|"LINE"\|"TEXT"\|"FRAME", x, y, width?, height?, parentId?, name? }` | `{ nodeId }` — creates an empty node of that type |
| `set_node_property` | `{ nodeId, props: {...} }` — allowlisted: geometry (`x,y,width,height`), common (`name,opacity,cornerRadius,fills,strokes`), auto-layout on frames (`layoutMode,itemSpacing,paddingLeft/Right/Top/Bottom,primaryAxisSizingMode,counterAxisSizingMode`), text (`characters,fontSize`) | updated node summary |
| `move_node` | `{ nodeId, x?, y?, parentId?, index? }` | updated node summary |

Example — create a rectangle, then a text node with content:
```
node figma-plugin/bridge/cli.mjs create_node '{"type":"RECTANGLE","x":100,"y":100,"width":80,"height":80}'
node figma-plugin/bridge/cli.mjs create_node '{"type":"TEXT","x":100,"y":200}'
node figma-plugin/bridge/cli.mjs set_node_property '{"nodeId":"<id>","props":{"characters":"Hello"}}'
```

Params with spaces (e.g. text `characters`) don't survive PowerShell's native-argv quoting reliably — write them to a JSON file and pass `@path` instead (quote the `@path` argument itself, or PowerShell parses it as splatting syntax and errors):
```
node figma-plugin/bridge/cli.mjs set_node_property '@params.json'
```

## Batching multiple ops

For any multi-step task, don't call `cli.mjs` once per op — each call is a fresh process and a fresh relay connection, and from an agent driving this over Bash, a fresh tool round-trip per op. Write the whole sequence as one array and run it in one call:

```json
// ops.json
[
  { "op": "create_node", "params": { "type": "RECTANGLE", "x": 100, "y": 100, "width": 80, "height": 80 } },
  { "op": "create_node", "params": { "type": "TEXT", "x": 100, "y": 200 } },
  { "op": "set_node_property", "params": { "nodeId": "<id from previous result>", "props": { "characters": "Hello" } } }
]
```
```
node figma-plugin/bridge/cli.mjs --batch '@ops.json'
```
Prints a single JSON array of `{ id, ok, result | error }`, one entry per op, in order. Ops run sequentially over one connection (each waits for its response before the next is sent), so a later op can't yet reference an id returned by an earlier one within the same batch file — run in two batches if a later step genuinely needs an id a prior step just created.

Component instances, image fills, and other richer operations are intentionally out of scope for this primitive — see `agents/orchestrator.md`'s planned `design-system` skill/agent for where that higher-level knowledge will live instead.
