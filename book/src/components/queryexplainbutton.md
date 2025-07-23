# Query Explain Button

The `lens-query-explain-button` is a wrapper around the `lens-info-button` that displays a human-readable version of the current query. When the QueryStore is empty, the `noQueryMessage` message is shown. If just a `queryItem` is passed as a prop it will just display this part.

## Props

| Prop             | Type                     | Default                    | Description                                                                                                                            |
| ---------------- | ------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `queryItem`      | `QueryItem \| undefined` | `undefined`                | If provided, a human-readable explanation of this query item is displayed. If not, the current global query from `queryStore` is used. |
| `noQueryMessage` | `string`                 | `"Search for all results"` | Message shown when no query is present.                                                                                                |
| `inSearchBar`    | `boolean`                | `false`                    | Applies compact and minimal styling for use inside a search bar.                                                                       |

## Usage

```html
<lens-query-explain-button></lens-query-explain-button>
```

## Styling

This component uses `::part()` selectors to expose internal styles for customization.

| Part name                   | Description                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `lens-query-explain-button` | Wrapper around the `InfoButtonComponent` when not in search bar mode. Useful for applying borders, padding, etc. |

### Example: Customizing the container style

```css
lens-query-explain-button::part(lens-query-explain-button) {
    border-color: var(--primary-color);
    padding: 8px;
}
```
