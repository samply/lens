# Search Modified Component

`<lens-search-modified-display>` displays a visual cue when the current query has been modified. It listens to the `QueryStore` and only renders its slotted content if a change has occurred.

---

## Usage

Use the default `<slot>` to pass in content:

```html
<lens-search-modified-display>
    <b>You have unsaved changes. Please click "Search" to update results.</b>
</lens-search-modified-display>
```

---

## Styling

Customize the component using the exposed part:

| Part Name                             | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `lens-query-modified-display-wrapper` | Wraps the content and applies border and spacing |

### Example

```css
lens-search-modified-display::part(lens-query-modified-display-wrapper) {
    background-color: var(--light-orange);
    color: var(--dark-orange);
    font-weight: bold;
}
```

### Classes

````css
    [part~="lens-query-modified-display-wrapper"] {
        border: solid var(--light-orange) 1px;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xxs) var(--gap-xs);
        text-align: center;
        width: max-content;
        margin: var(--gap-xs) auto;
    }
    ```
````
