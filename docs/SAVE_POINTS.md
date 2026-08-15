# Save Points

Rollback mechanism for this environment, built on plain git — no custom snapshot format needed since git already does exactly this.

## Convention

- A **save point** is a git commit, tagged `save-N` (`save-1`, `save-2`, ...).
- Only commit a save point when a piece of the environment (an agent, CLAUDE.md, the manifest) has reached a stable state — not on every small edit. Intermediate work-in-progress can stay uncommitted or land in untagged commits.
- Write the tag message as a one-line description of what state was reached, e.g. `git tag -a save-1 -m "orchestrator + CLAUDE.md v1"`.

## Rolling back

```
git tag                        # list save points
git diff save-2 -- agents/     # see what changed since a save point
git checkout save-2 -- .       # restore the whole tree to that save point (working dir only)
git reset --hard save-2        # hard rollback (discards everything after — confirm first)
```

Prefer `checkout`/`diff` over `reset --hard` unless you explicitly want to discard later history.

## Log

| Tag | Date | State |
|---|---|---|
| `save-1` | 2026-08-15 | Orchestrator (agents/skills/plugins routing) + `CLAUDE.md` + `figma-live-bridge` agent, both read (status/selection/node-tree) and generic write (create_node/set_node_property/move_node) verified live against an open Figma document. |
| `save-2` | 2026-08-15 | `cli.mjs --batch` mode — one connection/one call for a whole sequence of Figma ops, replacing one Bash round-trip per op. `CLAUDE.md` gained a general batching rule. |
| `save-3` | 2026-08-16 | `eval_script` verified live; a 4-variant Button component; full token system (31 colors, 19 spacing, 9 radius, 5 breakpoints, 8 Roboto text styles, sourced from the OC-Kontrol HTML prototype); three style-guide pages in Figma. `skills/figma-design-system` and `skills/ui-reference-analysis` added, `agents/design-system.md` added, both registered in the orchestrator. |
