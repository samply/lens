# Catalogue

The `<lens-catalogue>` component renders the catalgue in a collapsible tree structure. The catalogue can be optionally collapsible, and will auto-expand based on configuration. If the options includes a `facetCount` input, it automatically fetches and updates facet counts on mount.

This component loads all elements from the _catalogue store_ and [lensOptions](https://samply.github.io/lens/docs/types/LensOptions.html), uses `DataTreeElement` for each node, and offers customizable toggle behavior. Styling is exposed through `::part()` attributes.

---

## Props

| Prop     | Type                                        | Default                              | Description                                                               |
| -------- | ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `toggle` | `{ collapsable?: boolean; open?: boolean }` | `{ collapsable: true, open: false }` | Controls whether the catalogue is collapsible and its default open state. |

---

## Usage

```html
<lens-catalogue
    toggle={{ collapsable: true, open: true }}
></lens-catalogue>
```

For a more in depth description of the structure see [catalogue guide](../guide/catalogue.md).

---

## Styling

The component uses `::part()` attributes for style customization:

| Part Name                                  | Description                          |
| ------------------------------------------ | ------------------------------------ |
| `lens-catalogue`                           | Main container of the catalogue      |
| `lens-catalogue-wrapper`                   | Wrapper around all top-level nodes   |
| `lens-catalogue-toggle-button`             | The expand/collapse toggle button    |
| `lens-catalogue-toggle-button-closed-icon` | Icon when the catalogue is collapsed |
| `lens-catalogue-toggle-button-icon`        | The icon stlye                       |
| `lens-catalogue-toggle-button-open-text`   | The label next to the icon           |

### Classes

```css
lens-catalogue::part(lens-catalogue-toggle-button) {
    background-color: var(--dark-blue);
    color: white;
}
```
