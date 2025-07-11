# QueryDeleteButtonComponent

The `QueryDeleteButton` is a button used to **remove elements from a query**. It supports deletion of:

- Entire **groups** from the query,
- Specific **items** within a group,
- Or individual **values** from an item.

When clicked, it dispatches a `clear-search` event and updates the query store accordingly. It also ensures the query structure remains valid — resetting to `[[]]` if it becomes empty after deletion.

This button adapts its size and style depending on the type being deleted, using exposed `::part()` selectors for customization.

---

## Props

| Prop           | Type                                                                      | Description                                      |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `itemToDelete` | `{ type: "item" \| "group" \| "value"; index: number; item?: QueryItem }` | Defines what and where to delete from the query. |

---

## Usage

```html
<lens-query-delete-button
    itemToDelete={{ type: "group", index: 0 }}
></lens-query-delete-button>
```

With item-level deletion:

```html
<lens-query-delete-button
    itemToDelete={{ type: "item", index: 1, item }}
></lens-query-delete-button>
```

---

## Styling

The component uses `::part()` attributes to expose styling hooks, differentiated by type:

| Part Name                        | Description                           |
| -------------------------------- | ------------------------------------- |
| `lens-query-delete-button`       | Base style for all delete buttons.    |
| `lens-query-delete-button-group` | Larger size for deleting a group.     |
| `lens-query-delete-button-item`  | Positioned absolutely in item chips.  |
| `lens-query-delete-button-value` | White-colored icon for inline values. |

### Example: Custom Styles

```css
lens-query-delete-button::part(lens-query-delete-button) {
    border-color: red;
}

lens-query-delete-button::part(lens-query-delete-button-group) {
    width: 30px;
    height: 30px;
}
```
