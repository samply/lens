# RFC: New AST, Catalogue, and Query Types

**Date:** 2026-03-03

## Summary

This RFC proposes a comprehensive type restructuring of the Lens library across three core domains:

1. **AST** — Replace the loosely-typed `AstTopLayer`/`AstBottomLayerValue` structure with a clean discriminated union (`AstNode`).
2. **Catalogue** — Rename all catalogue types to a consistent naming scheme, simplify fields, and build centralized flattened lookup structures on load.
3. **Query** — Redesign the query representation to be compact, self-describing, and decoupled from display metadata.

Additionally, we will provide:

- A **migration script** that converts old JSON catalogues to the new structure.
- An **exported compatibility function** that converts the new AST to the old AST format, with example application code demonstrating a fallback strategy.

---

## Motivation

The current types have grown organically and carry legacy naming (`SingleSelectCategory` is not actually single-select), unused fields (`type: "EQUALS"` / `type: "BETWEEN"`), and an AST that encodes values in weakly-typed union members. The query type mixes display metadata (`name`, `description`) with semantic data, making serialization and diffing unnecessarily complex. Catalogue lookups are O(n) recursive traversals performed on every access — there is no centralized index.

This refactoring makes the public API clearer, the internal code simpler, and unblocks future features (e.g. query serialization/URL-sharing, negated query items).

---

## Naming Conventions

A key goal of this RFC is to establish consistent terminology across the codebase — in type names, variable names, comments, and documentation. Existing code should be updated to use these terms consistently.

| Concept                                                               | Term                  | Identified by                                                |
| --------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| A leaf entry in the catalogue that the user can interact with         | **catalogue element** | `key` (string)                                               |
| A selectable choice within a `SelectElement` or `AutocompleteElement` | **catalogue option**  | `value` (string) within a parent element                     |
| One search criterion added to a search bar by the user                | **query item**        | —                                                            |
| A group of query items joined by AND                                  | **query bar**         | —                                                            |
| A node in the generated AST representing a boolean combination        | **AST operator**      | `type`: `AndOperator`, `OrOperator`, `NotOperator`           |
| A node in the generated AST representing a concrete filter            | **AST filter**        | `type`: `SetFilter`, `NumericRangeFilter`, `DateRangeFilter` |

---

## 1. New AST

### Current state

The current AST (`src/types/ast.ts`) uses two types differentiated by duck-typing (`"operand" in x` / `"value" in x`):

```ts
type AstTopLayer = {
    key?: string;
    operand: "AND" | "OR" | "XOR" | "NOT";
    children: AstElement[];
};

type AstBottomLayerValue = {
    key: string;
    type: string;
    value:
        | string
        | boolean
        | Array<string>
        | { min?: number; max?: number }
        | { min?: string; max?: string };
};
```

Problems:

- `value` is a bag union — consumers must narrow at every use site.
- `"XOR"` exists but is unused.
- `"NOT"` is overloaded onto a multi-child node.
- No discriminator field — cannot generate a clean JSON schema.

### New types

```ts
/** @discriminator type */
export type AstNode =
    | AndOperator
    | OrOperator
    | NotOperator
    | SetFilter
    | NumericRangeFilter
    | DateRangeFilter;

export type AndOperator = {
    type: "AndOperator";
    operands: AstNode[];
};

export type OrOperator = {
    type: "OrOperator";
    operands: AstNode[];
};

export type NotOperator = {
    type: "NotOperator";
    operand: AstNode;
};

/**
 * Filter that checks set membership. Equality is a special case
 * with a single entry in the `values` array.
 */
export type SetFilter = {
    type: "SetFilter";
    key: string;
    values: string[];
};

export type NumericRangeFilter = {
    type: "NumericRangeFilter";
    key: string;
    /** Ranges are inclusive. At least one bound must be specified. */
    min?: number;
    max?: number;
};

export type DateRangeFilter = {
    type: "DateRangeFilter";
    key: string;
    /**
     * Ranges are inclusive. At least one bound must be specified.
     * Bounds are in the format YYYY-MM-DD.
     * @format date
     */
    min?: string;
    max?: string;
};
```

### Migration helpers

An exported function `convertToLegacyAst(node: AstNode): AstTopLayer` will be provided so that applications can translate the new AST into the old format for backends that have not yet been updated. Example application code:

```ts
import { getAst, convertToLegacyAst } from "@2024/lens";

const ast = getAst();

try {
    await sendToBackend("/api/query", ast); // try new format first
} catch {
    const legacy = convertToLegacyAst(ast);
    await sendToBackend("/api/query-legacy", legacy); // fall back to old format
}
```

---

## 2. Catalogue Changes

### Naming renames

| Old name               | New name              |
| ---------------------- | --------------------- |
| `CategoryGroup`        | `CatalogueGroup`      |
| `SingleSelectCategory` | `SelectElement`       |
| `AutocompleteCategory` | `AutocompleteElement` |
| `NumericRangeCategory` | `NumericRangeElement` |
| `DateRangeCategory`    | `DateRangeElement`    |
| `StringCategory`       | `FreeTextElement`     |
| `Criteria`             | `CatalogueOption`     |
| `Category` (union)     | `CatalogueElement`    |
| `Catalogue`            | `LensCatalogue`       |

### Field changes summary

| Scope                                  | Change                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| All element types                      | Remove old `type` field (`"EQUALS"` / `"BETWEEN"`)                                                      |
| All element types                      | Rename `fieldType` → `type`, values now match type names exactly (e.g. `"SelectElement"`)               |
| All element types                      | Shared fields factored into `BaseElement`                                                               |
| `CatalogueGroup`                       | Rename `childCategories` → `elements`; remove `key`                                                     |
| `SelectElement`, `AutocompleteElement` | Remove `subCategoryName` (see below); rename `criteria` → `options`                                     |
| `CatalogueOption`                      | Rename `key` → `value`; remove `aggregatedValue`; add `ast?: AstNode`; rename `subgroup` → `suboptions` |
| `Catalogue` type                       | Renamed to `LensCatalogue` (= `CatalogueElement[]`), for consistency with `LensOptions`                 |

### `subCategoryName` → `suboptions`

`subCategoryName` is currently used to split a large set of options for a single key across multiple collapsible entries in the catalogue tree. For example, the CCP catalogue has multiple `SingleSelectCategory` entries all sharing `key: "uiccstadium"`, each with a different `subCategoryName` ("0", "IA", "IB", etc.) grouping a subset of options:

```json
// Old: multiple entries with the same key, different subCategoryName
[
  { "key": "uiccstadium", "subCategoryName": "0", "fieldType": "single-select",
    "criteria": [{ "key": "0" }, { "key": "0a" }, { "key": "0is" }] },
  { "key": "uiccstadium", "subCategoryName": "IA", "fieldType": "single-select",
    "criteria": [{ "key": "IA" }, { "key": "IA1" }, { "key": "IA2" }] },
  ...
]
```

In the new design, this becomes a single `SelectElement` with `suboptions` providing the grouping:

```json
// New: one element, grouped via suboptions
{ "key": "uiccstadium", "type": "SelectElement", "name": "UICC Stadium",
  "options": [
    { "value": "0",  "name": "0",  "suboptions": [
        { "value": "0",  "name": "0" },
        { "value": "0a", "name": "0a" },
        { "value": "0is","name": "0is" }
    ]},
    { "value": "IA", "name": "IA", "suboptions": [
        { "value": "IA",  "name": "IA" },
        { "value": "IA1", "name": "IA1" },
        { "value": "IA2", "name": "IA2" }
    ]},
    ...
  ]
}
```

The migration script can automate this transformation: entries sharing the same `key` are merged into a single element, and each `subCategoryName` group becomes a top-level option with `suboptions`.

### New type definitions

```ts
import type { AstNode } from "./ast";

// Shared base

type BaseElement = {
    /** A key that uniquely identifies the catalogue element. */
    key: string;
    /** The element's user-facing display name. */
    name: string;
    /** Optional text accessed by clicking a "ⓘ" button next to the display name. */
    infoButtonText?: string[];
    /** Optional hyperlink shown next to the display name. */
    infoLink?: {
        link: string;
        display: string;
    };
    /**
     * Optional list of domain keys this element belongs to.
     * If omitted the element is available in all domains.
     */
    domains?: string[];
};

// Elements

/** @discriminator type */
export type CatalogueElement =
    | CatalogueGroup
    | SelectElement
    | AutocompleteElement
    | NumericRangeElement
    | DateRangeElement
    | FreeTextElement;

/** The top-level catalogue type passed to Lens. */
export type LensCatalogue = CatalogueElement[];

/**
 * A logical grouping of catalogue elements rendered as a collapsable
 * entry in the catalogue tree.
 * Note: CatalogueGroup does not extend BaseElement because it has
 * no `key` of its own.
 */
export type CatalogueGroup = {
    type: "CatalogueGroup";
    /** The group's user-facing display name. */
    name: string;
    /** The list of catalogue elements in the group. */
    elements: CatalogueElement[];
    /** Optional text accessed by clicking a "ⓘ" button. */
    infoButtonText?: string[];
    /** Optional hyperlink shown next to the display name. */
    infoLink?: {
        link: string;
        display: string;
    };
};

/**
 * A catalogue element that lets the user select one or more options
 * from a predefined list rendered in the catalogue tree.
 */
export type SelectElement = BaseElement & {
    type: "SelectElement";
    options: CatalogueOption[];
};

/**
 * A catalogue element that lets the user find and select options
 * via an autocomplete text box.
 */
export type AutocompleteElement = BaseElement & {
    type: "AutocompleteElement";
    options: CatalogueOption[];
};

/**
 * A catalogue element that lets the user specify a numeric range.
 */
export type NumericRangeElement = BaseElement & {
    type: "NumericRangeElement";
    /** The smallest value the user can enter. */
    min?: number;
    /** The largest value the user can enter. */
    max?: number;
    /** Optional unit text shown next to the input field, e.g. "kg". */
    unitText?: string;
};

/**
 * A catalogue element that lets the user specify a date range.
 */
export type DateRangeElement = BaseElement & {
    type: "DateRangeElement";
    /**
     * The earliest date the user can pick.
     * @format date
     */
    min?: string;
    /**
     * The latest date the user can pick.
     * @format date
     */
    max?: string;
};

/**
 * A catalogue element that lets the user specify a free-text string.
 */
export type FreeTextElement = BaseElement & {
    type: "FreeTextElement";
};

// CatalogueOption (previously Criteria)

export type CatalogueOption = {
    /** The catalogue option's value identifier. */
    value: string;
    /** The catalogue option's user-facing display name. */
    name: string;
    /** Optional description shown during autocompletion. */
    description?: string;
    /**
     * Optional AST override. When set, selecting this option inserts
     * this AST subtree instead of a simple SetFilter with the value.
     */
    ast?: AstNode;
    /** Nested sub-options. */
    suboptions?: CatalogueOption[];
    /** Whether this option is visible in the catalogue tree. Defaults to true. */
    visible?: boolean;
};
```

### Flattened lookup structures

When a catalogue is loaded via `setCatalogue()`, Lens will build two indexes:

1. **Element map** — `Map<string, CatalogueElement>` keyed by `element.key`.
2. **Option map** — `Map<string, CatalogueOption>` keyed by `"${elementKey}.${option.value}"`.

**Validation rules applied at load time:**

- If a duplicate `key` is found among elements, Lens rejects the catalogue with a descriptive error.
- If duplicate `value`s are found within the same element's options (including nested suboptions), Lens rejects the catalogue with a descriptive error.

These centralized maps replace all current ad-hoc recursive lookups:

| Current function                                       | Replaced by                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `getCategoryFromKey(catalogue, key)`                   | `elementMap.get(key)`                                       |
| `getCriteriaFromKey(catalogue, catKey, criKey)`        | ``optionMap.get(`${catKey}.${criKey}`)``                    |
| `getCriteriaNamesFromKey(catalogue, key)`              | Derive from `elementMap.get(key)`                           |
| `buildDatalistItems()` in SearchBar                    | Derive from `elementMap.values()`                           |
| Recursive subgroup resolution in `resolveAstSubgroups` | Derive from option map + `option.suboptions` / `option.ast` |

The maps will be exposed as Svelte stores (or via getter functions) so that reactive components can subscribe to them.

### Catalogue migration script

A Node.js script `scripts/migrate-catalogue.ts` will be provided that:

1. Reads an old-format JSON catalogue from stdin or a file argument.
2. Applies all renames and structural changes.
3. Writes the new-format JSON to stdout.

Example usage:

```bash
npx tsx scripts/migrate-catalogue.ts < old-catalogue.json > new-catalogue.json
```

The script will handle:

- `fieldType` → `type` with new discriminator values
- `childCategories` → `elements`
- Removing `key` from group entries
- `criteria` → `options`
- `criteria[].key` → `options[].value`
- `criteria[].aggregatedValue` → `options[].ast` (best-effort conversion; complex aggregated values will emit a warning)
- `criteria[].subgroup` → `options[].suboptions`
- Removing the old `type` field (`"EQUALS"` / `"BETWEEN"`)

---

## 3. Query Changes

### Current state

The query is stored as `QueryItem[][]` (bars × items). Each `QueryItem` carries:

```ts
type QueryItem = {
    id: string; // uuid
    key: string;
    name: string; // display name — duplicates catalogue
    type: string; // "EQUALS" / "BETWEEN" — redundant with catalogue
    values: QueryValue[];
    description?: string; // duplicates catalogue
};

type QueryValue = {
    name: string; // display name — duplicates catalogue
    value: string | { min?; max? } | AggregatedValue[][];
    queryBindId: string; // uuid used as Svelte keyed-each key
    description?: string;
};
```

Problems:

- `name` and `description` duplicate the catalogue — stale if catalogue changes.
- `queryBindId` is a uuid used only to key Svelte `{#each}` blocks and to identify values for removal. A simpler identity (index or value-based equality) suffices.
- `type` duplicates information already present in the catalogue element's discriminator.
- The value union is untagged — consumers must narrow manually.
- `AggregatedValue[][]` is deeply nested and hard to reason about.

### New type definitions

File: `src/types/query.ts` (renamed from `queryData.ts`)

```ts
/**
 * The query represents the user's current search expressed as a
 * disjunction (OR) of bars, where each bar is a conjunction (AND)
 * of items.
 */
export type Query = {
    bars: QueryBar[];
};

export type QueryBar = {
    items: QueryItem[];
};

/** @discriminator type */
export type QueryItem = SetItem | NumericRangeItem | DateRangeItem;

type BaseItem = {
    /**
     * Element key — references an entry in the flattened element map.
     */
    key: string;
    /**
     * If true this item is negated ("red" chip) and will be wrapped
     * in a NotOperator in the generated AST.
     */
    negated: boolean;
};

export type SetItem = BaseItem & {
    type: "SetItem";
    /**
     * Selected option values. Each string is the `value` part of a
     * key in the flattened option map (`${elementKey}.${value}`).
     */
    values: string[];
};

export type NumericRangeItem = BaseItem & {
    type: "NumericRangeItem";
    /** Inclusive lower bound. */
    min?: number;
    /** Inclusive upper bound. */
    max?: number;
};

export type DateRangeItem = BaseItem & {
    type: "DateRangeItem";
    /**
     * Inclusive lower bound in YYYY-MM-DD format.
     * @format date
     */
    min?: string;
    /**
     * Inclusive upper bound in YYYY-MM-DD format.
     * @format date
     */
    max?: string;
};
```

### Key design decisions

**`queryBindId` removal:** `queryBindId` is currently used in two places:

1. As the Svelte `{#each}` key in the search bar (`{#each queryItem.values as value (value.queryBindId)}`).
2. In `removeValueFromQuery` to identify which value to remove.

In the new design, `SetItem.values` is a simple `string[]` — individual values can be identified by their string content (which is unique within an element per the catalogue validation). For `{#each}` keying, the value string itself or an index can be used. Therefore `queryBindId` can be removed.

**`SendableQuery` removal:** `SendableQuery` is defined in `src/types/queryData.ts` but is **never imported or used** anywhere in the Lens codebase, nor is it exported from the public API. It can be deleted without impact.

**`AutoCompleteItem` / `AutoCompleteCriterionItem` removal:** These types are used only inside `SearchBarComponent.wc.svelte` to build the autocomplete datalist from the catalogue. With the new flattened element map and option map, the search bar can derive its autocomplete suggestions directly from the map values without an intermediate type. The `AutoCompleteCriterionItem` type mixed catalogue structure (`fieldType: "criterion"`) with query data — this coupling is eliminated. These types can be removed and replaced with direct iteration over the element and option maps.

**Display names at render time:** Components that currently read `queryItem.name` or `value.name` will instead look up the display name from the element/option maps:

```ts
// Old:
queryItem.name;

// New:
elementMap.get(item.key)?.name ?? item.key;
```

This ensures display names are always consistent with the current catalogue.

---

## 4. AST ↔ Query Conversion

### Query → AST (`buildAstFromQuery`)

The conversion is straightforward with the new types:

```
Query → OrOperator over bars
  QueryBar → AndOperator over items
    SetItem → SetFilter (or NotOperator wrapping SetFilter if item.not)
    NumericRangeItem → NumericRangeFilter (or NotOperator wrapping it)
    DateRangeItem → DateRangeFilter (or NotOperator wrapping it)
```

If an option has an `ast` override, that subtree is inserted instead of the default filter. Suboption resolution is handled by walking `option.suboptions` and collecting leaf values — this replaces the current `resolveAstSubgroups` logic.

### AST → Query (removed)

The deprecated `setQueryStoreFromAst` API will be removed. Correctly converting an arbitrary AST back into a `Query` is not feasible in general — features like `Option.ast` overrides and suboption expansion are inherently one-way transformations. The previous implementation was incomplete for the same fundamental reason (e.g. unhandled value types, no aggregated-value round-trip coverage). This could be revisited in the future if a concrete use case arises.

### Legacy AST conversion (`convertToLegacyAst`)

```ts
export function convertToLegacyAst(node: AstNode): AstTopLayer { ... }
```

Mapping:
| New AST node | Legacy AST |
|---|---|
| `AndOperator` | `{ operand: "AND", children: [...] }` |
| `OrOperator` | `{ operand: "OR", children: [...] }` |
| `NotOperator` | `{ operand: "NOT", children: [child] }` |
| `SetFilter` | One `AstBottomLayerValue` per value: `{ key, type: "EQUALS", value }`, wrapped in `{ operand: "OR", key, children: [...] }` |
| `NumericRangeFilter` | `{ key, type: "BETWEEN", value: { min, max } }` |
| `DateRangeFilter` | `{ key, type: "BETWEEN", value: { min, max } }` |

---

## 5. Impact Analysis

### Files requiring changes

#### Core type files (rewrite)

| File                     | Change                                        |
| ------------------------ | --------------------------------------------- |
| `src/types/ast.ts`       | Replace with new AST types                    |
| `src/types/catalogue.ts` | Replace with new catalogue types              |
| `src/types/queryData.ts` | **Delete**; replace with `src/types/query.ts` |

#### Stores (significant changes)

| File                      | Change                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/stores/catalogue.ts` | Build `elementMap` and `optionMap` on `setCatalogue()`. Add validation (duplicate key/value detection). Remove `getCategoryFromKey`, `getCriteriaFromKey`, `getCriteriaNamesFromKey` — replaced by map lookups. Rewrite `resolveAstSubgroups` to use option map and `option.ast` / `option.suboptions`. |
| `src/stores/query.ts`     | Change store type from `QueryItem[][]` to `Query`. Rewrite `addItemToQuery`, `removeValueFromQuery`, `removeItemFromQuery` to use new types. Remove uuid generation for `queryBindId`. Simplify duplicate detection (value-based instead of name-based).                                                |

#### Helpers (significant changes)

| File                               | Change                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/helpers/ast-transformer.ts`   | Rewrite `buildAstFromQuery` for `Query → AstNode`. The recursive `returnNestedValues` function is replaced by a simple structural mapping. |
| `src/helpers/ast-to-query.ts`      | **Delete.** AST → Query conversion is removed (the `setQueryStoreFromAst` API was deprecated).                                             |
| `src/helpers/ast-to-query.test.ts` | **Delete.** Tests for the removed AST → Query conversion.                                                                                  |

#### Helpers (new files)

| File                        | Purpose                                                                         |
| --------------------------- | ------------------------------------------------------------------------------- |
| `src/helpers/legacy-ast.ts` | `convertToLegacyAst(node: AstNode): AstTopLayer` — exported for application use |

#### Components (moderate changes)

| Component                              | Change                                                                                                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SearchBarComponent.wc.svelte`         | Remove `AutoCompleteItem`/`AutoCompleteCriterionItem` usage. Derive autocomplete list from element/option maps. Update `{#each}` keys from `queryBindId` to value strings. Update `addInputValueToStore` to construct new `QueryItem` types. |
| `SearchBarMultipleComponent.wc.svelte` | Update to use `Query.bars` instead of `QueryItem[][]`.                                                                                                                                                                                       |
| `Catalogue.wc.svelte`                  | Update to use `LensCatalogue` / `CatalogueElement`.                                                                                                                                                                                          |
| `DataTreeElement.svelte`               | Update to use `CatalogueElement` instead of `Category`.                                                                                                                                                                                      |
| `SingleSelectComponent.svelte`         | Update to use `SelectElement` instead of `SingleSelectCategory`.                                                                                                                                                                             |
| `SingleSelectItemComponent.svelte`     | Update to use `SelectElement` and `CatalogueOption` instead of `SingleSelectCategory` and `Criteria`. Rename `criteria` → `options`, `key` → `value`.                                                                                        |
| `AutoCompleteComponent.svelte`         | Update to use `AutocompleteElement` and `CatalogueOption` instead of `AutocompleteCategory` and `Criteria`.                                                                                                                                  |
| `NumberInputComponent.svelte`          | Update to use `NumericRangeElement` instead of `NumericRangeCategory`.                                                                                                                                                                       |
| `DatePickerComponent.svelte`           | Update to use `DateRangeElement` instead of `DateRangeCategory`.                                                                                                                                                                             |
| `StringInputComponent.svelte`          | Update to use `FreeTextElement` instead of `StringCategory`.                                                                                                                                                                                 |
| `ChartComponent.wc.svelte`             | Update `Category`/`Criteria` references. Update query construction to use new types.                                                                                                                                                         |
| `DomainSummaryComponent.wc.svelte`     | Update `Category` → `CatalogueElement`, `Catalogue` → `LensCatalogue`.                                                                                                                                                                       |

#### Store (moderate changes)

| File                         | Change                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/stores/datarequests.ts` | Update `buildHumanReadableRecursively` to walk `AstNode` instead of `AstElement`. Update `getHumanReadableQueryAsFormattedString` to use new `Query` type and look up names from element/option maps. |
| `src/stores/facetCounts.ts`  | Verify — may reference catalogue types for key lookups.                                                                                                                                               |

#### Public API (`src/index.ts`)

| Change                                                                               |
| ------------------------------------------------------------------------------------ |
| Replace `export type * from "./types/catalogue"` — new type names                    |
| Replace `export type { QueryItem, QueryValue }` with new query types                 |
| Replace `export type * from "./types/ast"` — new AST types                           |
| Add export for `convertToLegacyAst`                                                  |
| Add exports for `elementMap` / `optionMap` (or getter functions)                     |
| Keep old type names as deprecated type aliases during a transition period (optional) |

#### Schema

| File                           | Change                                             |
| ------------------------------ | -------------------------------------------------- |
| `schema/catalogue.schema.json` | Regenerated from new types via `npm run schemagen` |

#### External applications

All applications that provide a catalogue JSON must migrate to the new format. Affected catalogue files:

| Application            | File                              | Size   |
| ---------------------- | --------------------------------- | ------ |
| `my-app`               | `src/catalogue.json`              | 4 KB   |
| `cce-explorer`         | `src/config/catalogue.json`       | 264 KB |
| `ccp-explorer`         | `src/config/catalogue.json`       | 636 KB |
| `ccp-explorer`         | `src/config/catalogue-test.json`  | 668 KB |
| `dhki-explorer`        | `src/config/catalogue.json`       | 640 KB |
| `bbmri-sample-locator` | `src/config/catalogue-bbmri.json` | 2.0 MB |
| `gbn-sample-locator`   | `src/catalogues/gbn.json`         | 2.7 MB |

All of these can be converted using the migration script.

Applications that consume the AST (e.g. to build CQL or send to a backend) need to update to the new `AstNode` type or use `convertToLegacyAst` as a bridge.

---

## 6. Potential Issues and Risks

### `AggregatedValue` removal

The current `Criteria.aggregatedValue` field encodes a complex nested AND/OR structure (`AggregatedValue[][]`). In the new design, this is replaced by `CatalogueOption.ast` which is strictly more expressive. However:

- The migration script must convert `AggregatedValue[][]` → `AstNode`. Each `AggregatedValue[]` (inner array) becomes an `AndOperator` of `SetFilter`s, and the outer array becomes an `OrOperator`.
- `getHumanReadableQueryAsFormattedString` uses `AggregatedValue` for display — this must be rewritten to walk `CatalogueOption.ast` instead.

### `CatalogueGroup.key` removal

Currently `CatalogueGroup` has a `key` field. While it is not used for lookups (groups are not leaf elements), some application code might reference it. The migration script will strip it, but applications should be audited.

### Breaking public API change

This is a **major breaking change** to the public API. Types exported from `src/index.ts` that are renamed or restructured:

- `AstElement`, `AstTopLayer`, `AstBottomLayerValue` → `AstNode` and sub-types
- `Catalogue`, `Category`, `CategoryGroup`, `SingleSelectCategory`, `AutocompleteCategory`, `NumericRangeCategory`, `DateRangeCategory`, `StringCategory`, `Criteria` → new names
- `QueryItem`, `QueryValue` → new query types

Applications importing these types will need to update their code. Consider a **major semver bump**.

---

## 7. Deliverables

### Migration script

**`scripts/migrate-catalogue.ts`**

Converts old-format catalogue JSON → new-format catalogue JSON.

```bash
npx tsx scripts/migrate-catalogue.ts < old-catalogue.json > new-catalogue.json
```

Handles:

- All field and type renames described in §2
- `aggregatedValue` → `ast` best-effort conversion (warns on complex cases)
- `subCategoryName` entries merged into single elements with `suboptions`
- Strips removed fields (`CatalogueGroup.key`, old `type`)
- Validates output against new JSON schema

### Legacy AST converter

**`src/helpers/legacy-ast.ts`** — exported from public API.

```ts
import { convertToLegacyAst } from "@2024/lens";
import type { AstTopLayer } from "@2024/lens"; // old types kept as deprecated aliases or in a /legacy subpath
```

Example application code:

```ts
import { getAst, convertToLegacyAst } from "@2024/lens";

async function executeQuery() {
    const ast = getAst(); // returns new AstNode

    // Try sending the new AST format first
    const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ast),
    });

    if (!response.ok) {
        // Backend doesn't support new format yet — fall back to legacy
        const legacyAst = convertToLegacyAst(ast);
        const fallbackResponse = await fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(legacyAst),
        });

        if (!fallbackResponse.ok) {
            throw new Error(
                "Query failed with both new and legacy AST formats",
            );
        }

        return fallbackResponse.json();
    }

    return response.json();
}
```

---

## 8. Implementation Plan

The following order minimizes broken intermediate states:

| Phase                          | Steps                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1: Types**             | 1. Write new types in `src/types/ast.ts`, `src/types/catalogue.ts`, `src/types/query.ts`. Keep old types temporarily as deprecated aliases.                                                                                                                                                                                                                                                                                        |
| **Phase 2: Catalogue store**   | 2. Rewrite `src/stores/catalogue.ts`: new validation, `elementMap`, `optionMap`. Update `setCatalogue()`.                                                                                                                                                                                                                                                                                                                          |
| **Phase 3: Query store**       | 3. Rewrite `src/stores/query.ts` to use `Query` type. Update all add/remove functions.                                                                                                                                                                                                                                                                                                                                             |
| **Phase 4: AST helpers**       | 4. Rewrite `ast-transformer.ts` (`buildAstFromQuery`). 5. Delete `ast-to-query.ts` and `ast-to-query.test.ts` (deprecated `setQueryStoreFromAst` removed). 6. Write `legacy-ast.ts` (`convertToLegacyAst`). 7. Update remaining tests.                                                                                                                                                                                             |
| **Phase 5: Components**        | 8. Update catalogue components (`DataTreeElement`, `SingleSelectComponent`, `SingleSelectItemComponent`, `AutoCompleteComponent`, `NumberInputComponent`, `DatePickerComponent`, `StringInputComponent`). 9. Update `SearchBarComponent.wc.svelte` (remove autocomplete types, use maps). 10. Update `SearchBarMultipleComponent.wc.svelte`. 11. Update `ChartComponent.wc.svelte`. 12. Update `DomainSummaryComponent.wc.svelte`. |
| **Phase 6: Data requests**     | 13. Update `src/stores/datarequests.ts` (human-readable query).                                                                                                                                                                                                                                                                                                                                                                    |
| **Phase 7: Public API**        | 14. Update `src/index.ts` exports. 15. Remove deprecated type aliases. 16. Regenerate `schema/catalogue.schema.json`.                                                                                                                                                                                                                                                                                                              |
| **Phase 8: Migration tooling** | 17. Write `scripts/migrate-catalogue.ts`. 18. Run migration on all application catalogues. 19. Update application code.                                                                                                                                                                                                                                                                                                            |
| **Phase 9: Cleanup**           | 20. Delete `src/types/queryData.ts`. 21. Remove all unused old types and functions. 22. Final audit and testing.                                                                                                                                                                                                                                                                                                                   |
