# Catalogue Filter

The `<lens-catalogue-filter>` component renders a search field for the [catalogue](catalogue.md) component. While you type it shows a dropdown of matching catalogue entries, each with the path it sits under. The tree itself is left untouched. Selecting a match opens the tree down to it. A criterion of a single-select category is scrolled into view and highlighted briefly, a criterion of an autocomplete category prefills that autocomplete's input so it only has to be added to the search bar.

An entry matches when the search term appears in its display name, its key or its description. Matching ignores case and accents, so `tumorentitat` finds `Tumorentität`, and a match inside a criterion's subgroup counts for the parent criterion, since that is the entry the tree renders. Terms shorter than two characters are ignored.

Place the component next to `<lens-catalogue>`, they communicate through the catalogue store.

---

## Props

| Prop         | Type     | Default | Description                                                                     |
| ------------ | -------- | ------- | ------------------------------------------------------------------------------- |
| `debounceMs` | `number` | `150`   | Milliseconds to wait after the last keystroke before the catalogue is searched. |
| `matchLimit` | `number` | `50`    | Maximum number of matches listed in the dropdown.                               |

---

## Usage

```html
<lens-catalogue-filter></lens-catalogue-filter>
<lens-catalogue></lens-catalogue>
```

---

## Styling

| Part Name                                        | Description                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| `lens-catalogue-filter`                          | Main container of the filter                   |
| `lens-catalogue-filter-input`                    | The text input                                 |
| `lens-catalogue-filter-clear-button`             | The button that clears the search              |
| `lens-catalogue-filter-options`                  | The dropdown of matches                        |
| `lens-catalogue-filter-options-item`             | A single match                                 |
| `lens-catalogue-filter-options-item-focused`     | The match currently selected by the arrow keys |
| `lens-catalogue-filter-options-item-name`        | The match's name                               |
| `lens-catalogue-filter-options-item-description` | The match's description                        |
| `lens-catalogue-filter-options-item-path`        | The path the match sits under                  |
| `lens-catalogue-filter-options-item-empty`       | The "no matches" and "refine your search" rows |
| `lens-singleselect-item-revealed`                | A criterion while it is highlighted            |
