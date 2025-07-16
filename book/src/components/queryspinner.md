# Query Spinner

The `<lens-query-spinner>` component provides a visual indication that a query is currently being processed. It automatically displays a spinning loader when a search is triggered and hides it once responses have been received from all data sources.

- The spinner becomes visible when a `lens-search-triggered` event is dispatched
- It monitors the `siteStatus` store and hides itself once **all sites have responded** (i.e., no site remains in a "claimed" status).
- The spinner size can be customized via the `size` property.

---

## Usage

### Basic Example

```html
<lens-query-spinner size="24px" />
```

The spinner appears when a search is in progress and disappears once all site responses are received.

---

## Props

| Prop | Type   | Default | Description                              |
| ---- | ------ | ------- | ---------------------------------------- |
| size | string | `20px`  | Sets the height and width of the spinner |

---

## Styling

The spinner uses a circular animation. You can override its appearance using the `.spinner` class or `::part()` if exposed via shadow DOM.

### Default Styles

```css
.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: var(--size);
    height: var(--size);
    animation: spin 1s linear infinite;
}
```
