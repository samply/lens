# SearchModifiedComponent

The `<lens-search-modified-display>` component provides a visual cue to the user whenever the current query has been changed but not yet submitted. It automatically listens to the application's query state and only renders its slotted content if a modification has occurred.

This makes it especially useful in search interfaces, where users might adjust filters or terms and should be reminded to re-run their search. The component includes built-in styling for emphasis and can be customized further using `::part()` selectors.

---

## Usage

```html
<lens-search-modified-display>
    You have unsaved changes. Please click "Search" to update results.
</lens-search-modified-display>
```

This will display the message only if the query has been modified.

---

## Styling

Customize the component using the exposed part:

| Part Name                             | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `lens-query-modified-display-wrapper` | Wraps the content and applies border and spacing |

### Example CSS

```css
lens-search-modified-display::part(lens-query-modified-display-wrapper) {
    background-color: var(--light-orange);
    color: var(--dark-orange);
    font-weight: bold;
}
```
