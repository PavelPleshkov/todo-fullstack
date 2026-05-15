# Plan: GitHub issue #9 — fixed theme button and “AI” in header

**Specification:** [task-issue-9-dor.md](task-issue-9-dor.md)  
**Issue:** https://github.com/PavelPleshkov/todo-fullstack/issues/9

Implement in `apps/frontend` a fixed theme button (`position: fixed`), add “AI” to the technology list after “GraphQL”, and enforce required spacing without text overlap.

## Checklist

- [ ] Update `Header.tsx`: “, AI” text, markup with `header-tech-text`, `className` `theme-btn` + `theme-btn-{theme}`
- [ ] `globals.css`: uncomment `.theme-btn` (fixed, offsets, z-index); theme-specific `.theme-btn-*` classes only for colors; header `min-height`, `.header-tech-text`
- [ ] Update `Header.test.tsx`: AI appears after GraphQL; keep `theme-btn`/`header` testids and theme toggle test
- [ ] Run `yarn lint` (repo root) and `yarn test` (`apps/frontend`)
- [ ] Manual check: scroll, theme click, narrow viewport, 10px gaps, compare initial position
- [ ] Verify issue #9 via GitHub MCP `issue_read` before/after implementation

## Current state

- [`apps/frontend/app/components/Header.tsx`](../apps/frontend/app/components/Header.tsx): theme button inside MUI `Grid` with `justifyContent="space-between"` — in normal document flow; technology string ends at `GraphQL` (no `AI`). Commented `className` variant: `"theme-btn theme-btn-" + theme`.
- [`apps/frontend/app/globals.css`](../apps/frontend/app/globals.css): `.header-*` / `.theme-btn-*` styles are colors only; commented `.theme-btn` block with `position: fixed`, `right: 10px`, `top: 10px`.
- [`apps/frontend/app/page.tsx`](../apps/frontend/app/page.tsx): `<header>` in a Grid column, `overflowX: hidden` on the container — usually fine for `fixed`, but verify after changes.
- Tests: [`Header.test.tsx`](../apps/frontend/app/components/Header.test.tsx) cover render, text, and theme toggle; [`page.test.tsx`](../apps/frontend/app/page.test.tsx) clicks `theme-btn` — keep `data-testid` attributes.

```mermaid
flowchart TB
  subgraph before [Current]
    headerFlow["header in normal flow"]
    grid["Grid space-between"]
    textBlock["technology text"]
    btnFlow["theme-btn in flow"]
    headerFlow --> grid
    grid --> textBlock
    grid --> btnFlow
  end

  subgraph after [Target]
    headerFlow2["header in normal flow — height via CSS"]
    textConstrained["text with max-width / min-width:0"]
    btnFixed[".theme-btn position:fixed"]
    btnTheme[".theme-btn-dark / -light — colors only"]
    headerFlow2 --> textConstrained
    btnFixed --> btnTheme
  end
```

## Target architecture

1. **Theme button** — `position: fixed` on `Button`. Shared positioning and stacking — in **`.theme-btn`** (uncomment and extend the block in `globals.css`): `right: 10px`, `top: 10px`, `z-index`; adjust `height` for MUI `Button` if needed. **`.theme-btn-dark`** / **`.theme-btn-light`** keep colors only (as today inside `.header-dark` / `.header-light`).
2. **`<header>`** — stays in normal flow, **no** `fixed`/`sticky` on the container.
3. **Header height** — `min-height` on `.header-dark` / `.header-light` (tune against current strip in DevTools, ~56–64px).
4. **Technology text** — `, AI` right after `GraphQL`; `.header-tech-text` with `min-width: 0`, `max-width: calc(100vw - 80px - 20px)`; `padding-right` on `.header-inner` reserves space for the button; ellipsis/wrap on narrow screens.
5. **Markup** — simplify `Grid`; button uses two classes: `theme-btn` + `theme-btn-{theme}`.

## Implementation steps

### 1. “AI” text

In `Header.tsx`, change the string to:

```tsx
React, TS, Next.js, Nest.js, PostgreSQL, formik, yup, RTL, Jest, GraphQL, AI
```

(comma and space — same as other list items).

### 2. Header markup

In `Header.tsx`:

- Wrap the technology block in a container with class `header-tech-text`.
- Add class `header-inner` on the `Grid container`.
- Button: `className={"theme-btn theme-btn-" + theme}` (instead of `theme-btn-{theme}` only), `data-testid="theme-btn"`.
- Simplify `Grid` (remove `space-between` if the button is no longer in the row flex layout).

### 3. Styles in globals.css

**Uncomment and update `.theme-btn`:**

```css
.theme-btn {
  position: fixed !important;
  right: 10px;
  top: 10px;
  z-index: 1100;
  /* height: 24px — remove or replace if MUI Button needs more height */
}
```

**Theme classes — colors only** (no duplicate `position` / `right` / `top` / `z-index`):

```css
.header-dark {
  ...
  .theme-btn-dark {
    background-color: var(--foreground);
    color: var(--background);
  }
}
.header-light {
  ...
  .theme-btn-light {
    background-color: var(--background);
    color: var(--foreground);
  }
}
```

**Additionally:**

- `.header-dark`, `.header-light` — `min-height`.
- `.header-inner` — `padding-right: calc(10px + 80px)`.
- `.header-tech-text` — `min-width: 0`, `max-width: calc(100vw - 80px - 20px)`, ellipsis/wrap as needed.

If initial placement conflicts with mandatory 10px gaps — **spacing rules from the DoR take priority**.

### 4. page.tsx — only if needed

Do **not** change `page.tsx` if header `min-height` is sufficient and `overflow-x: hidden` does not break the containing block for `fixed`.

Change **only if** manual testing shows the fixed button blocks clicks on content while scrolling — then add padding on the scrollable area without changing `<header>` positioning.

### 5. Tests

In `Header.test.tsx`:

- Text includes `GraphQL` and `AI` (order: `GraphQL` before `AI`).
- Keep `data-testid="header"`, `data-testid="theme-btn"`, theme toggle behavior.
- Optional: button has class `theme-btn` and `getComputedStyle(themeBtn).position === 'fixed'`.

`page.test.tsx` — unchanged if `theme-btn` stays clickable.

## Risks and mitigation

| Risk | Mitigation |
|------|------------|
| Button out of flow → shorter header | `min-height` on `.header-*` |
| Draft `height: 24px` too small for MUI | Remove or replace in `.theme-btn` after DevTools check |
| Text overlap on narrow screens | `max-width` calc, `padding-right`, ellipsis/wrap |
| Legacy position vs `right: 10px` | DoR spacing rules take priority |
| MUI overrides `position` | `!important` on `.theme-btn` |
| `transform` on ancestor | Check in DevTools; no transform in `page.tsx` |
| Different “Light” / “Dark” widths | 80px buffer in calc |
| Button over content while scrolling | Expected per issue; content padding only if needed |

## Validation (DoR acceptance criteria)

### Automated

From repository root:

```bash
yarn lint
```

From `apps/frontend`:

```bash
yarn test
```

Expected: lint passes for touched files; all `Header` / `page` tests pass.

### Manual

```bash
yarn dev
```

Open `http://localhost:3000`:

1. **Before scroll:** compare button position with current main (or [issue screenshot](https://github.com/user-attachments/assets/d4b6eea1-8477-4e05-b165-e02f35d5da9e)) — no noticeable shift (except allowed adjustment for 10px gaps).
2. **Scroll:** scroll the task list — Light/Dark button stays on screen (`position: fixed`).
3. **Text:** header shows `... GraphQL, AI`.
4. **Click:** theme toggle works.
5. **Narrow viewport** (DevTools responsive, e.g. 320–400px): no overlap between text and button; text↔button gap ≥ 10px; button↔viewport right edge = 10px.
6. **Resize:** narrow/widen window — gap rules hold.
7. **Header height:** content below header does not jump vs main.

### GitHub MCP (course requirement)

Before/after work: use approved GitHub MCP (`issue_read`) to verify issue #9 — issue body and any new comments affecting scope.

## Boundaries (do not change)

- `apps/backend`, `packages/*`, `apps/docs` — out of scope.
- `ThemeContext.tsx` — unchanged unless theme behavior breaks.
- Do not use `position: absolute` / `sticky` for the theme button.
- Do not make `<header>` fixed/sticky.

## PR / commit order

1. CSS (`.theme-btn` + header constraints) + Header markup (`AI`, button classes).
2. Tests.
3. Brief PR note if initial placement shifts slightly to satisfy mandatory 10px gaps.
