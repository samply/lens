# SeachbarMultipleComponent

The `lens-search-bar-multiple` provides a flexible interface for composing complex queries using **multiple search bars**, each representing a par of query criteria. This component builds on top of [lens-searchbar](searchbar.md), dynamically managing multiple instances tied to a shared query store.

Each search bar is visually separated by an **"or"** indicator, and users can append additional bars using a dedicated **add button**. It is primarily used for **OR-based query logic** where each search bar represents an independent branch of the search criteria.

A default `<slot />` is provided to insert additional UI elements, such as a **search** or **submit** button.

---

## Props

| Prop                    | Type     | Default                       | Description                                               |
| ----------------------- | -------- | ----------------------------- | --------------------------------------------------------- |
| `noMatchesFoundMessage` | `string` | `"No matches found"`          | Message shown when no autocomplete options are available. |
| `placeholderText`       | `string` | `"Type to filter conditions"` | Placeholder text used across all search bars.             |

---

## Styling

The component exposes styling hooks via `part` attributes for full control over layout and appearance.

| Part                                   | Purpose                                        |
| -------------------------------------- | ---------------------------------------------- |
| `lens-searchbar-multiple`              | Wrapper around the full multi-search component |
| `lens-searchbar-multiple-wrapper`      | Wrapper for each search bar row                |
| `lens-searchbar-multiple-add-button`   | Add button to insert a new search bar group    |
| `lens-searchbar-multiple-or-indicator` | Visual "or" indicator between search bars      |

> Styles can be customized using the `::part()` pseudo-element.

---

## Example

You may also include a search button using the default slot:

```html
<lens-search-bar-multiple>
    <lens-search-button title="Apply Filter"></lens-search-button>
</lens-search-bar-multiple>
```

---

## Notes

- Each `lens-searchbar` operates independently but contributes to a shared query structure.
- Useful for building **compound filters** like `(A AND B) OR (C)` via UI.
- If integrating into a larger query system, ensure to observe or sync the `queryStore` externally for actual search execution.

---

Let me know if you'd like me to generate TypeDoc-style comments for the script block or include more advanced examples.
