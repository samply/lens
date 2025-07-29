# Result Table

The `lens-result-table` component displays a paginated and sortable table of totals from the `LensResult`. It uses the configured Lens options and listens to the `ResultStore`.

The table is automatically populated with data sources that are marked as **claimed** in the `ResultStore`. You can provide user-friendly labels for internal site keys via the `siteMappings` option. Columns are defined in the table options.

If a data source has not yet been fully claimed, the table shows a "loading" message. This message is customizable via the `translate` option.

Each row includes a checkbox to select that data source for a data request. The selection is tracked in the `DataRequestStore`.

---

## Props

| Prop               | Type      | Default | Description                                                     |
| ------------------ | --------- | ------- | --------------------------------------------------------------- |
| `title`            | `string`  | `""`    | Optional title displayed above the table.                       |
| `pageSize`         | `number`  | `10`    | Number of rows per page.                                        |
| `pageSizeSwitcher` | `boolean` | `false` | If true, enables a dropdown to change the number of rows shown. |

---

## Slots

| Slot Name                      | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `lens-result-above-pagination` | Renders content above the pagination controls. |
| `beneath-pagination`           | Renders content below the pagination controls. |

---

## CSS Parts

| Part Name                                    | Description                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `lens-result-table-title`                    | The title heading above the table.                                       |
| `lens-result-table`                          | The table element itself.                                                |
| `lens-result-table-header`                   | The `<thead>` element.                                                   |
| `lens-result-table-header-row`               | The header row `<tr>`.                                                   |
| `lens-result-table-header-cell`              | Generic header cells.                                                    |
| `lens-result-table-header-cell-checkbox`     | Header cell containing the "select all" checkbox.                        |
| `lens-result-table-header-datatype`          | Header cells for data type columns (sortable, may include info buttons). |
| `lens-result-table-header-checkbox`          | The checkbox used to select all rows.                                    |
| `lens-result-table-table-body`               | The `<tbody>` containing the data rows.                                  |
| `lens-result-table-pagination`               | Container for pagination controls.                                       |
| `lens-result-table-pagination-button`        | Previous and next arrow buttons.                                         |
| `lens-result-pagination-pagination-previous` | Specifically styles the "previous" button.                               |
| `lens-result-pagination-pagination-next`     | Specifically styles the "next" button.                                   |
| `lens-result-table-pagination-pagenumber`    | Displays the current page number and total page count.                   |
| `lens-result-table-pagination-switcher`      | Container for the page size switcher dropdown.                           |

---

## Example

To use the table, define the `tableOptions` and include the component in your HTML:

```json
tableOptions: {
    headerData: [
        {
            title: "Sites",
            dataKey: "site"
        },
        {
            title: "Patients",
            dataKey: "patients"
        }
    ]
}
```

```svelte
<lens-result-table title="Result Table" pageSize={25} pageSizeSwitcher={true} />
```
