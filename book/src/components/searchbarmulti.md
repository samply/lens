# Seach Bar Multiple

The `lens-search-bar-multiple` is a wrapper for multitple [searchbars](./searchbar.md).

Each search bar is visually separated by an **"or"** indicator, and users can append additional bars using a dedicated **add button**. It is primarily used for **OR-based query logic** where each search bar represents an independent branch of the search criteria.

A default `<slot />` is provided to insert additional UI elements, such as a **search** or **submit** button.

---

## Props

| Prop                    | Type     | Default                       | Description                                               |
| ----------------------- | -------- | ----------------------------- | --------------------------------------------------------- |
| `noMatchesFoundMessage` | `string` | `"No matches found"`          | Message shown when no autocomplete options are available. |
| `placeholderText`       | `string` | `"Type to filter conditions"` | Placeholder text used across all search bars.             |

---

## Example

You may also include a search button using the default slot:

```html
<lens-search-bar-multiple>
    <lens-search-button title="Apply Filter"></lens-search-button>
</lens-search-bar-multiple>
```

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
