# CatalogueComponent

The `<lens-catalogue>` component renders a collapsible tree structure to visually organize a hierarchical data catalogue. It supports dynamic updates via the global store, or can be initialized with static data. The catalogue can be optionally collapsible, and will auto-expand based on configuration. If the global configuration includes a `facetCount` backend, it automatically fetches and updates facet counts on mount.

This component integrates with the `catalogue` store and [lensOptions](https://samply.github.io/lens/docs/types/LensOptions.html), uses `DataTreeElement` for each node, and offers customizable toggle behavior. Styling is exposed through `::part()` attributes for full theme control.

---

## Props

| Prop       | Type                                        | Default                              | Description                                                                          |
| ---------- | ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `treeData` | `Catalogue` (array of `CategoryData`)       | `[]`                                 | Optional static data for initializing the catalogue. Replaces the store if provided. |
| `toggle`   | `{ collapsable?: boolean; open?: boolean }` | `{ collapsable: true, open: false }` | Controls whether the catalogue is collapsible and its default open state.            |

---

## Usage

```html
<lens-catalogue
    treeData={catalogueData}
    toggle={{ collapsable: true, open: true }}
></lens-catalogue>
```

---

## Styling

The component uses `::part()` attributes for style customization:

| Part Name                                       | Description                          |
| ----------------------------------------------- | ------------------------------------ |
| `lens-catalogue`                                | Main container of the catalogue      |
| `lens-catalogue-wrapper`                        | Wrapper around all top-level nodes   |
| `lens-catalogue-toggle-button`                  | The expand/collapse toggle button    |
| `lens-catalogue-toggle-button-closed-icon`      | Icon when the catalogue is collapsed |
| `toggle-button-text`, `toggle-button-open-text` | The label next to the icon           |

### Example

```css
lens-catalogue::part(lens-catalogue-toggle-button) {
    background-color: var(--dark-blue);
    color: white;
}
```
