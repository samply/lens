# Search Bar

The `lens-searchbar` component offers an interface for exploring of all single-select items. It serves as the primary interface for users to search, apply, and adjust query criteria. Selected items appear as interactive chips within the component, giving users a clear visual of their active filters. Users can easily refine their search by removing individual values or entire criteria directly from the chip display.

---

## Behavior & Functionality

- **Search Input with Autocomplete**:
    - Opens dropdown after 3+ characters.
    - Filters and displays grouped suggestions with optional counts and descriptions.
    - Keyboard navigation support (`focusedItemIndex`).

- **Search Chips**:
    - Displays selected criteria as removable chips.
    - Nested value-level and item-level delete buttons.
    - Each chip displays:
        - Criterion name
        - Values
        - Optional explain button via `QueryExplainButtonComponent`

- **Autocomplete Items**:
    - Rendered with bold-highlighted matches.
    - Supports facet counts from `$facetCounts`.
    - Fully keyboard- and mouse-navigable.

- **Clear Group Button**:
    - Clears the entire group when clicked.
    - Emits a `clear-search` event.

---

## Props

| Prop                    | Type     | Default                                       | Description                                                       |
| ----------------------- | -------- | --------------------------------------------- | ----------------------------------------------------------------- |
| `noMatchesFoundMessage` | `string` | `"No matches found"`                          | Message shown when no autocomplete options are found.             |
| `typeMoreMessage`       | `string` | `"Search will start with 3 inserted letters"` | Message shown when input is too short for autocomplete.           |
| `placeholderText`       | `string` | `"Type to filter conditions"`                 | Placeholder in the search input field.                            |
| `index`                 | `number` | `0`                                           | Used to manage multiple search bars (e.g., in groups or filters). |

---

## Events

### `on:clear-search`

Triggered when the group clear button is clicked.

```svelte
<lens-search-bar on:clear-search={handleClear} />
```

---

## Styling

Custom styling is supported via `part` attributes. Key styling hooks include:

| Part                                                   | Purpose                          |
| ------------------------------------------------------ | -------------------------------- |
| `lens-searchbar`                                       | Wrapper for the entire component |
| `lens-searchbar-input`                                 | Main input element               |
| `lens-searchbar-chip`, `chip-name`, `chip-item`        | Visual query chips               |
| `lens-searchbar-autocomplete-options`                  | Autocomplete container           |
| `lens-searchbar-autocomplete-options-item`             | Individual result                |
| `lens-searchbar-autocomplete-options-item-focused`     | Highlighted result               |
| `lens-searchbar-autocomplete-options-item-description` | Optional description             |
| `lens-searchbar-autocomplete-options-item-facet-count` | Facet count badge                |

---

## Example

```html
<lens-search-bar
    placeholderText="Search filters..."
    noMatchesFoundMessage="No criteria match"
    typeMoreMessage="Type at least 3 characters to search"
    index="{1}"
/>
```
