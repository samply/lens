# Query Spinner

The `<lens-query-spinner>` component provides a visual indication that a query is currently being processed. It automatically displays a spinning loader when a search is triggered and hides it once responses have been received from all data sources. The spinner listens on `lens-search-triggered` event and waits till all `LensResults` are not claimed anymore.

---

## Usage

The spinner appears when a search is in progress and disappears once all site responses are received.

```html
<lens-query-spinner size="24px" />
```

---

## Props

| Prop | Type   | Default | Description                              |
| ---- | ------ | ------- | ---------------------------------------- |
| size | string | `20px`  | Sets the height and width of the spinner |

---
