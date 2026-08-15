# CLAUDE.md

## Project

`claude-design` is a Claude Code plugin: a small, growing multi-agent environment coordinated by an orchestrator agent. The plugin manifest lives in `.claude-plugin/plugin.json`; agent definitions live in `agents/*.md`.

`assets/andrej-karpathy-skills-main/` is a vendored reference plugin (downloaded, not authored here) — read it for inspiration, don't edit it as part of this project's work.

## Layout

- `.claude-plugin/plugin.json` — plugin manifest (name, version, description)
- `agents/orchestrator.md` — coordinates delegation across this plugin's agents
- `agents/*.md` — one file per specialized agent, auto-discovered by Claude Code
- `docs/BUILD_LOG.md` — chronological record of steps taken while building this environment
- `docs/SAVE_POINTS.md` — how and when to check in a git-based rollback point
- `assets/` — reference material vendored from elsewhere, not part of the plugin itself
- `.mcp.json` — registers Figma's official remote MCP server (`figma-official`), narrowly for bootstrapping brand-new empty Figma files (`whoami` + `create_new_file`) — all other Figma read/write work goes through the local bridge, never this server
- `.claude/settings.json` — technically enforces that scope: only `whoami`/`create_new_file` are allowed on `figma-official`, every other tool it exposes is explicitly denied
- `assets/screenshots/ui components/` — where the user drops UI reference screenshots for the `ui-reference-analysis` skill; briefs it writes (`<name>.brief.md`) live alongside the source images, not in a separate tree

## Adding a new agent, skill, or plugin dependency

- Create `agents/<name>.md` with frontmatter: `name`, `description` (required); optional `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`.
- Plugin-scoped agents cannot use `hooks`, `mcpServers`, or `permissionMode` — those aren't available outside project-level `.claude/agents/`.
- Write `description` as a routing signal: state exactly when this agent (or skill) should be invoked, and when it shouldn't.
- The orchestrator (`agents/orchestrator.md`) owns three registry tables — Agents, Skills, Plugins. Whenever you add or rename an agent, register a skill, or take a dependency on another installed plugin, add one row to the matching table. It routes by reading those tables, not by re-deriving capabilities from scratch — an unlisted agent, skill, or plugin effectively doesn't exist to it.

## Evaluating a pasted reference skill

When the user pastes a skill from elsewhere (another product's bundled skill, a doc, a repo) as a candidate for this environment, follow this order — do not skip to integration:

1. **Analyze** — what does it actually do, and what does it depend on (a specific tool, a remote service, a specific host app) that may or may not exist here?
2. **Plan** — what's actually reusable in our system as it exists today, not a redesign to accommodate it. State this before writing anything.
3. **Verify** — confirm it will actually work in our architecture and won't blow up token spend (per the token-economy rule above) before integrating.
4. **Integrate** — only after 1–3, and only the parts that passed. If nothing applies (e.g. it depends on a tool/service we've deliberately not adopted), say so and stop — don't force-fit an unrelated capability in to have done something.

## Principles (adapted from Karpathy's guidelines)


- **Simplicity first** — an agent file, a manifest field, a rule: add only what's actually needed right now. No speculative config, no unused frontmatter fields "just in case."
- **Surgical changes** — when editing an existing agent or the manifest, touch only what the task requires. Don't reformat or "improve" unrelated sections.
- **State assumptions, don't guess** — if an agent's scope, name, or model choice is ambiguous, ask rather than picking silently.
- **Goal-driven** — before adding an agent, state what it's for and how you'd verify it's routing correctly (e.g. "orchestrator should pick this agent, not itself, for X").

## Writing code, scripts, or bash

Applies whenever this environment produces code, a script, or a shell command — the orchestrator's own bash use, or any agent added later.

- Write as a full-stack senior engineer: correct and efficient, but never more complex than the problem requires. Simple beats clever.
- Don't do it all in one shot. Break the task into small steps, and get each one right before starting the next — a large unverified change is expensive to debug and expensive to redo.
- Token economy is the governing constraint, not a nice-to-have: prefer the smallest diff or command that does the job, don't dump output you don't need to inspect, don't restate code back to the user that they can already see in the diff.
- When a whole sequence of shell/tool calls is already known upfront (not exploratory, each step doesn't depend on discovering something from the last), batch it into one script or one call instead of one round-trip per step. Each separate tool call costs a full turn of overhead on top of the work itself — ~20 individual calls for 6 logical Figma edits (see `figma-plugin/README.md`'s batch mode) is the concrete example of what this rule exists to prevent.
- **This includes writing files, not just running commands.** Generating several similar files back-to-back (e.g. a component's `.tsx`/`.module.css`/`.stories.tsx` trio, repeated across many components) is the same known-upfront sequence — write 2-4 at once via one `Bash` heredoc call (`cat > a <<'EOF' ... EOF; cat > b <<'EOF' ... EOF`) instead of one `Write` call per file. Concrete case (OC-DS, `c:\Users\Rodion\Desktop\OC-DS`): 28 components × 3 files as 84 separate `Write` calls cost an estimated 7-8k tokens in pure per-call overhead that batching would have avoided.
- No speculative code — no unused helpers, no handling for inputs that can't occur here.

## Process economy (research and planning)

- Check what's already available locally — an installed app's cached reference skill, existing docs in this repo, prior `BUILD_LOG.md` entries — before dispatching a research subagent for external tool/API behavior. Concrete case: ~52k tokens went into researching Figma's Plugin API for variables/components before discovering a locally-cached reference skill (`figma-use`) that had the same facts, more precisely, for free.
- Match planning ceremony to the task. Full plan mode (research subagents, a written plan file, an approval round-trip that echoes the whole plan back into context) is for genuinely large or uncertain work — a new protocol, a new architecture, several valid approaches. For a small, bounded addition (a wrapper agent around one well-known CLI, a one-line config change), a short inline proposal plus a direct question is enough — the ceremony's own overhead can cost more than the work it's planning.
- A recurring per-call cost is a signal to fix the environment once, not pay it forever: e.g. a freshly-`winget`-installed CLI not yet on the running session's `PATH` means every shell call needs a `$env:Path +=` prefix — restarting the session (not adding a workaround to each call) removes that cost permanently.

## Self-improving agents and skills

After a skill or agent actually runs and completes a task, check whether the run surfaced something its own file didn't already cover — an error that needed a workaround, a rule that would have prevented a wasted step, a pattern worth reusing. If so, fold that lesson back into the responsible agent's or skill's own file before treating the task as done — not just into `docs/BUILD_LOG.md`, which is history, not instructions. This is exactly how `cli.mjs`'s `@file` param, `figma-plugin/README.md`'s quoting note, and `figma-design-system`'s gotchas got written — the same discipline, now standing practice instead of incidental.

- Only capture what was actually hit, never a hypothetical — "might need this later" is speculative, exactly what the simplicity rule above already excludes.
- Write it into the specific file whose gap caused the friction — the agent's own `.md`, the skill's `SKILL.md`, or the right `references/*.md` — so the *next* run of that exact agent or skill benefits immediately, without anyone having to go find the lesson first.
- State it as a fact or rule for next time ("X requires Y", "Z throws unless W"), not a retelling of what happened — the narrative belongs in `BUILD_LOG.md`, the file itself should read like it always knew this.
- If the lesson applies beyond one agent or skill, put it in the more general place (this file, or `agents/orchestrator.md`) instead of copying it into each one that would need it.

## Visual and UI design principles

Applies whenever this environment designs or builds something visible — Figma foundations/components (the `design-system` agent), generated HTML/CSS, or any other visual surface. Adapted from a pasted reference skill, condensed to our own words per the evaluation process above.

- Design like a studio for a client who already rejected templated work: deliberate, brief-specific choices in palette, typography, and layout — not a generic default. Three defaults to actively avoid unless the brief calls for them: cream background + high-contrast serif + terracotta accent; near-black + one neon accent; broadsheet/hairline-rule newspaper layout.
- Ground the design in the actual subject before choosing anything — name the subject, its audience, and the one job this surface does. If the brief doesn't pin these down, pin them yourself and say so.
- Typography and structure carry meaning, not decoration — pair type faces deliberately; only use structural devices (numbered steps, dividers) when they encode something real about the content, not by default.
- Work in two passes: sketch a compact token system (color, type, layout, one signature element) first, critique it for genericness, revise, only then build.
- Spend boldness in one place — one signature element, disciplined everything else — and still hit a quality floor regardless (responsive, accessible, reduced motion respected).
- Copy is design material: write from the user's side (name things by what they control, not the implementation), active voice, consistent vocabulary between an action and its result.

## Verification

No build or test suite — this is markdown and JSON, not code. "Correct" means: frontmatter parses, `plugin.json` stays valid JSON, and `description` fields are unambiguous enough that the orchestrator's registry table matches what the agents actually do.
