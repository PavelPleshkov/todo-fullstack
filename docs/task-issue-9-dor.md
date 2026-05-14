# Task specification (DoR)

_Source: GitHub issue #9. GitHub MCP used: `issue_read` (get), `issue_read` (get_comments). Local context: `docs/CODEBASE_MAP.md`, grep in `apps/frontend`._

## Objective

Implement the UI changes below (see GitHub issue #9):

1. Keep the theme toggle (**Theme button**) **fixed within the viewport** while scrolling: it must stay on screen in the same visual position relative to the window, not scroll away with the page. Implementation: **`position: fixed`** on the theme button only (or a minimal wrapper around it only); the **`<header>`** block stays in normal document flow and **keeps its current height** (see Constraints). In the **initial state** (page at the top, no scroll), the button must occupy the **same visual position** as in the current implementation before this work—no jump to another corner or offset relative to the previous header edge, **subject to** the spacing rules below (minimum gaps override if they would otherwise conflict).
2. Add the text **“AI”** to the header’s list of used tools, **immediately after** “GraphQL” (same line/block as the other tools).
3. **Clearance and no overlap:** the theme button must **never overlap** the header technology text when that text becomes **longer** (including after adding “AI”) or when the **viewport width shrinks**. There must be a **minimum horizontal gap of 10px** between the header text (technology list) and the nearest edge of the theme button. There must be a **horizontal gap of exactly 10px** between the nearest edge of the theme button and the **right edge of the viewport**. Achieve this with layout/CSS (e.g. `max-width` / `min-width: 0` / truncation, reflow, or measured offsets) as appropriate without violating the no-overlap and minimum-gap rules.

## Scope

- Changes **only** in the client frontend under **`apps/frontend`**.
- Markup and styles for the theme button using **`position: fixed`**, and for the **extra header text**; if needed, edits in **`globals.css`** (`.header-*`, `.theme-btn-*`, `z-index`, **`top` / `right` (or equivalent) chosen to match the button’s current initial placement** while respecting **10px** to the viewport right and **≥10px** between text and button).
- Layout that **prevents overlap** between the technology text block and the fixed button across viewport widths and text length (flex/grid constraints, ellipsis, wrapping, or dynamic measurement as needed).
- **Do not change** behaviour or positioning of the **`<header>`** element itself as a container (it remains in normal flow); only the **theme button** positioning and the technology list text change.
- Preserve the **current visual height** of the header strip (avoid layout jump for content below the header).
- A **one-off** DOM measurement (e.g. `getBoundingClientRect` after layout) or offset calculation from the current layout is allowed to pin `fixed` coordinates to the **original** button position—no ongoing drift during normal use.
- If needed, update **frontend tests** affected by markup/behaviour changes (`Header` and related tests).
- Use **GitHub MCP** to fetch/verify task context from GitHub (course requirement as applicable), without adding new external services.

## Non-scope

- **`apps/backend`**, GraphQL schema, database, **`apps/docs`**, **`packages/*`**—do not change unless a hard technical dependency appears (not required for this issue).
- Do not add new MCP servers or expand scope beyond issue #9 without explicit agreement.

## Constraints

### Tools / MCP / models / integrations (client or course rules)

- Use only the **approved GitHub MCP** (as configured in the project).
- Code changes stay within **`apps/frontend`** (explicit task boundary).

### Other

- UI stack: **Next.js (App Router), MUI**—per `docs/CODEBASE_MAP.md`; avoid heavy new dependencies unless necessary.
- Keep the theme button clickable and the header readable at typical viewport widths.
- Theme button positioning uses **`position: fixed` only** (no `absolute` / `sticky` for this button within this task).
- **Preserve initial placement:** at **scroll position zero**, the button must **visually match** its placement in the **current** (pre-task) implementation—the same edge and window offsets the user saw before (sub-pixel differences from rounding/fonts only; no noticeable shift), **unless** that would break the **spacing** rules below — in that case the **the minimum requirements take precedence**.
- **Do not** put **`<header>`** itself in `fixed`/`sticky` for this task: do not change the **header** container’s positioning model; **keep the current height** of the header strip.
- **Spacing (mandatory):** at least **10px** between the **header technology text** and the **theme button** (closest edges); exactly **10px** between the **theme button** and the **right edge of the viewport** (closest edges). These apply at **all** viewport widths relevant to the app and whenever the header copy length changes.

## Relevant files or areas

**From the repo map and code (not from the issue text alone):**

| File / area                                    | Why                                                                                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend/app/components/Header.tsx`      | **GraphQL** string, theme button (`data-testid="theme-btn"`)—main issue work; optional logic to measure/sync coordinates for initial placement.                   |
| `apps/frontend/app/globals.css`                | `.header-dark` / `.header-light`, `.theme-btn-dark` / `.theme-btn-light`—`position: fixed`, `z-index`, **offset values matching the button’s original position**. |
| `apps/frontend/app/page.tsx`                   | Header + Content column—padding on scrollable area if the `fixed` button overlaps content; no header height regression.                                           |
| `apps/frontend/app/components/Header.test.tsx` | Update expectations when DOM/text/behaviour changes; if tests assert position, account for `fixed` and initial alignment.                                         |
| `apps/frontend/app/ThemeContext.tsx`           | Usually unchanged; used by `Header`                                                                                                                               |

**Assumption:** extra inline styles or a small `useLayoutEffect` only if static `top`/`right` from design are insufficient to match the current initial placement at all target widths.

## Acceptance criteria

1. When scrolling the task page vertically, the **Light/Dark** button stays **visible and fixed** relative to the viewport: **`position: fixed`** on the button node (or minimal wrapper only); **`<header>`** stays in normal flow; **header strip height** is no worse than today. At **zero scroll**, the button position **visually matches** the app before this change (no noticeable sideways or corner shift), **except where** the mandatory **10px** gaps in criterion **6** require a small adjustment.
2. In the header technology list, **“AI”** appears **after** **“GraphQL”**, without breaking the rest of the text.
3. **`yarn lint`** from the repo root passes for touched files.
4. `Header` tests pass or are **updated** (`yarn test` in `apps/frontend` if that is the project norm).
5. Manual: `yarn dev`, `http://localhost:3000`—compare the **frame before scroll** with previous behaviour (or with the issue screenshot), then verify scroll, theme click, header text.
6. At a **narrow viewport** and with the **full technology string** (including “AI”), the theme button **does not overlap** the header text; horizontal gap between text and button is **≥10px**; gap between button and **right viewport edge** is **10px** (inspect visually or with devtools).

## Links (issues, docs, context)

- **Issue #9:** https://github.com/PavelPleshkov/todo-fullstack/issues/9
- **Screenshot from issue:** https://github.com/user-attachments/assets/d4b6eea1-8477-4e05-b165-e02f35d5da9e
- **Repo map:** `docs/CODEBASE_MAP.md` (Layout / frontend).

**Issue comments:** at the time this document was written, MCP reported **no comments**; context is the issue body and screenshot.

## Risks and open questions

- **`position: fixed` vs initial placement:** hard-coded `top`/`right` may diverge from in-flow button placement at different window widths; **post-layout measurement** or **per-breakpoint values** may be needed.
- **`position: fixed`:** coherent **`top` / `right` (or `left`)** and **`z-index`** so the button does not sit under content or cover critical UI; verify overlap with header text on narrow widths / resize.
- **Initial placement vs min gaps:** if matching the legacy pixel position would violate the **minimum 10px** text gap or **exactly 10px** right-edge gap, **prefer satisfying the minimum gaps** (document any trade-off in the PR).
- **Content overlap:** while scrolling, the button may overlap the task list—may need padding on the scrollable area without changing `<header>` height in flow.
- **`overflow-x: hidden`** on the container in `page.tsx`—verify impact after implementation (for `fixed`, the viewport is usually the window, but ancestors with `transform` can create a new containing block; if an anomaly appears, note it in the PR).
- **Tests:** keep or update `data-testid="header"` and `data-testid="theme-btn"` when the DOM changes.
