# Testing

## End-to-end tests

Lens uses [Playwright](https://playwright.dev/) for end-to-end tests. They run against the demo application. The demo app must cover all components so that every component has test coverage.

### Test sections

Tests are organised into numbered sections, one file per area:

| Section | File | Area |
|---------|------|------|
| 1–2 | `search-bar.spec.ts` | Search bar interactions and query building |
| 3 | `results.spec.ts` | Search execution and result display |
| 4 | `negotiate.spec.ts` | Request Data (Negotiate) button |
| 5 | `query-explain.spec.ts` | Query Explain button |
| 6 | `catalogue.spec.ts` | Catalogue panel |
| 7 | `language.spec.ts` | Language switching |
| 8 | `toast.spec.ts` | Toast notifications |

Shared Playwright helpers (search bar interactions, button clicks, assertions) live in `tests/e2e/searchbar-helpers.ts`.

### Running the tests locally

Build the demo first, then run Playwright:

```sh
npm run build:demo
npx playwright test
```

### Adding a test

When you add or change a component feature, add a corresponding test in the relevant spec file. Number new tests by appending to the section (e.g. the next search-bar test after `2.9` is `2.10`). If no spec file exists for the component yet, create one, pick the next available section number, and add it to this table.

## Unit tests

Unit tests use [Vitest](https://vitest.dev/) and live next to the source files they test (`*.test.ts`). Run them with:

```sh
npx vitest
```

### Query store defaults

An empty `QueryItem[][]` (no groups, no criteria) maps to a top-level `OR` node with no children:

```json
{ "operand": "OR", "children": [] }
```

If this default ever changes from `OR` to `AND`, the empty-store test in `src/helpers/ast-to-query.test.ts` will catch the regression.
