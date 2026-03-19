# Catalogue

The `<lens-catalogue>` component renders the catalgue in a collapsible tree structure. The catalogue can be optionally collapsible, and will auto-expand based on configuration. If the options includes a `facetCount` input, it automatically fetches and updates facet counts on mount.

This component loads all elements from the _catalogue store_ and [lensOptions](https://samply.github.io/lens/docs/types/LensOptions.html), uses `DataTreeElement` for each node, and offers customizable toggle behavior. Styling is exposed through `::part()` attributes.

---

## Props

| Prop     | Type                                        | Default                              | Description                                                               |
| -------- | ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `toggle` | `{ collapsable?: boolean; open?: boolean }` | `{ collapsable: true, open: false }` | Controls whether the catalogue is collapsible and its default open state. |

---

## Types

### Catalogue

The catalogue is a tree-like data structure that describes what the user can search for. The application passes the catalogue to lens as a JSON string via the `<lens-options>` component. Lens validates the JSON against a JSON schema that is automatically generated from this type definition. Many components of lens use the catalogue. Most notably the `<lens-catalogue>` component renders the catalogue as a collapsable tree and allows the user to add items from the catalogue to the search bar.

### Category

| `fieldType`     | Category Type                                 |
| --------------- | --------------------------------------------- |
| `group`         | [CategoryGroup](#categorygroup)               |
| `single-select` | [SingleSelectCategory](#singleselectcategory) |
| `autocomplete`  | [AutocompleteCategory](#autocompletecategory) |
| `number`        | [NumericRangeCategory](#numericrangecategory) |
| `date`          | [DateRangeCategory](#daterangecategory)       |
| `string`        | [StringCategory](#stringcategory)             |

### CategoryGroup

A logical grouping of catalogue items that is rendered as a collapsable entry in the catalogue tree.

| Properties        | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `childCategories` | The list of catalogue items in the group.                                                                         |
| `fieldType`       | default is `group`                                                                                                |
| `infoButtonText?` | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                 |
| `infoLink?`       | Optional hyperlink shown next to the display name. `display`: The link text. `link`: The link URL.                |
| `key`             | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. |
| `name`            | The group's user-facing display name.                                                                             |

### SingleSelectCategory

A catalogue item that lets the user select one or more criteria from a predefined list. The list of criteria is rendered in the catalogue tree and the user can select criteria by clicking a "->" button. The resulting query matches any of the selected criteria.

| Properties         | Description                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `criteria`         | The list of criteria the user can select from. ([Criteria](#criteria))                                                                                                                                                                                                                                                    |
| `fieldType`        | default is `single-select`                                                                                                                                                                                                                                                                                                |
| `infoButtonText?`  | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                                                                                                                                                                                                                         |
| `key`              | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item.                                                                                                                                                                                                         |
| `name`             | The item's user-facing display name.                                                                                                                                                                                                                                                                                      |
| `subCategoryName?` | This overwrites the display name in the catalogue component only. The intended use-case is to have multiple catalogue items with the same key and name but different subCategoryName. They will appear as different collapsable entries in the catalogue but will be grouped together in the same chip in the search bar. |
| `type`             | `EQUALS`                                                                                                                                                                                                                                                                                                                  |

### AutocompleteCategory

A catalogue item that lets the user select one or more criteria from a predefined list. The list of criteria is not rendered. Instead the user can find and select items by typing into an autocomplete text box. The resulting query matches any of the selected criteria.

| Properties        | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `criteria`        | The list of criteria the user can select from. ([Criteria](#criteria))                                            |
| `fieldType`       | default is `autocomplete`                                                                                         |
| `infoButtonText?` | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                 |
| `key`             | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. |
| `name`            | The item's user-facing display name.                                                                              |
| `type`            | `EQUALS`                                                                                                          |

### NumericRangeCategory

A catalogue item that lets the user specify a numeric range by entering a minimum and a maximum value. The user can omit one of the values to express less than or greater than constraints.

| Properties        | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `fieldType`       | default is `number`                                                                                               |
| `infoButtonText?` | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                 |
| `key`             | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. |
| `max?`            | The largest value that the user can enter.                                                                        |
| `min?`            | The smallest value that the user can enter.                                                                       |
| `name`            | The item's user-facing display name.                                                                              |
| `type`            | `BETWEEN`                                                                                                         |
| `unitText?`       | Optional text that is shown next to the input field, e.g. "kg".                                                   |

### DateRangeCategory

A catalogue item that lets the user specify a date range by picking an earliest and a latest date. The user can omit one of the dates to express earlier than or later than constraints.

| Properties        | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `fieldType`       | default is `date`                                                                                                 |
| `infoButtonText?` | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                 |
| `key`             | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. |
| `max?`            | The latest date that the user can pick.                                                                           |
| `min?`            | The earliest date that the user can pick.                                                                         |
| `name`            | The item's user-facing display name.                                                                              |
| `type`            | `BETWEEN`                                                                                                         |

### StringCategory

A catalogue item that lets the user to specify a string.

| Properties        | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `fieldType`       | default is `string`                                                                                               |
| `infoButtonText?` | Optional text that is accessed by clicking a "ⓘ" button next to the display name.                                 |
| `key`             | A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. |
| `name`            | The item's user-facing display name.                                                                              |
| `type`            | `EQUALS`                                                                                                          |

### Criteria

A criterion that can be selected in a single-select or autocomplete catalogue item.

| Properties         | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| `aggregatedValue?` | [AggregatedValue](#aggregatedvalue)                                                     |
| `description?`     | Optional description that is shown next to the display name during autocompletion.      |
| `key`              | A key that uniquely identifies the criterion.                                           |
| `name`             | The criterion's user-facing display name.                                               |
| `subgroup?`        | [Criteria](#criteria)                                                                   |
| `visible?`         | Optional flag that allows values to be in the catalogue without showing it to the user. |

### AggregatedValue

A combination of values that are in the catalogue.

| Properties | Description                                          |
| ---------- | ---------------------------------------------------- |
| `name`     | A key that uniquely identifies the aggregated value. |
| `value`    | Combination of values.                               |

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

| Part Name                                  | Description                          |
| ------------------------------------------ | ------------------------------------ |
| `lens-catalogue`                           | Main container of the catalogue      |
| `lens-catalogue-wrapper`                   | Wrapper around all top-level nodes   |
| `lens-catalogue-toggle-button`             | The expand/collapse toggle button    |
| `lens-catalogue-toggle-button-closed-icon` | Icon when the catalogue is collapsed |
| `lens-catalogue-toggle-button-icon`        | The icon stlye                       |
| `lens-catalogue-toggle-button-open-text`   | The label next to the icon           |
