# Query Explain Button

## Component Description

The `lens-query-explain-button` is a wrapper around the `lens-info-button` that displays a human-readable version of the current query. When the QueryStore is empty, the `noQueryMessage` is shown. If a specific `queryItem` is passed as a prop, it will display only that part in depth, showing all child elements.

## Props

| Prop             | Type                     | Default                    | Description                                                                                                                            |
| ---------------- | ------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `queryItem`      | `QueryItem \| undefined` | `undefined`                | If provided, a human-readable explanation of this query item is displayed. If not, the current global query from `queryStore` is used. |
| `noQueryMessage` | `string`                 | `"Search for all results"` | Message shown when no query is present.                                                                                                |     |

## Usage

```html
<lens-query-explain-button></lens-query-explain-button>
```

## Styling

| Part Name                                          | Description                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `lens-query-explain-button`                        | Styling for the button around the `InfoButton` component               |
| `lens-query-explain-single-row-message`            | Styling for a single `queryItem` element (string, number, etc.)        |
| `lens-query-explain-multi-row-message-heading`     | Styling for the heading of multiple `queryItems` (e.g., array display) |
| `lens-query-explain-multi-row-message-heading-top` | Styling for the top-level heading of multiple `queryItems`             |
| `lens-query-explain-multi-row-message-group`       | Styling for grouping multiple `queryItems`                             |
| `lens-query-explain-header`                        | Styling for the header of the explain box                              |
| `lens-query-explain-groups`                        | Container styling for logical groupings                                |
| `lens-query-explain-group-item`                    | Styling for individual group items                                     |
| `lens-query-explain-bottom-level-items`            | Container styling for bottom-level elements                            |
| `lens-query-explain-bottom-level-item`             | Styling for individual bottom-level items                              |
| `lens-query-explain-bottom-level-item-header`      | Styling for headers of bottom-level items                              |
| `lens-query-explain-bottom-level-item-entry`       | Styling for entries within bottom-level items                          |

### Example

```css
lens-query-explain-button::part(lens-query-explain-button) {
    border-color: var(--primary-color);
    padding: 8px;
}
```
