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

No save points yet — orchestrator and CLAUDE.md are still being worked on. First save point will be recorded here once they're stable.

| Tag | Date | State |
|---|---|---|
| _(none yet)_ | | |
