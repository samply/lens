## ResultTableComponent

The `lens-result-table` component displays a paginated, sortable data table of site-specific population metrics, dynamically built from the `siteStatus`, `lensOptions`, and `response` stores. It includes interactive sorting, pagination, and multi-select support for data requests.

---

### Behavior and Features

- Dynamically generates rows per site from response data.
- Supports sorting by any column.
- Paginates table rows based on configurable `pageSize`.
- Allows bulk selection/deselection via checkbox.
- Header columns are configured via `lensOptions.tableOptions.headerData`.
- Optional info buttons can be shown per column header.
- Includes pagination controls with an optional page size switcher.
- Displays loading text (`"loading"`) for pending responses.

---

### Props

| Prop               | Type      | Default | Description                                                      |
| ------------------ | --------- | ------- | ---------------------------------------------------------------- |
| `title`            | `string`  | `""`    | Optional title displayed above the table.                        |
| `pageSize`         | `number`  | `10`    | Number of rows per page.                                         |
| `pageSizeSwitcher` | `boolean` | `false` | If true, shows a dropdown to switch the number of rows per page. |

---

### Slots

| Slot Name                      | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `lens-result-above-pagination` | Renders content just above the pagination control row. |
| `beneath-pagination`           | Renders content below the pagination controls.         |

---

### CSS Parts

| Part Name                                    | Description                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `lens-result-table-title`                    | The title heading above the table.                                       |
| `lens-result-table`                          | The table element itself.                                                |
| `lens-result-table-header`                   | The `<thead>` element.                                                   |
| `lens-result-table-header-row`               | The header row `<tr>`.                                                   |
| `lens-result-table-header-cell`              | Generic header cells.                                                    |
| `lens-result-table-header-cell-checkbox`     | Header cell containing the "select all" checkbox.                        |
| `lens-result-table-header-datatype`          | Cells for each data type column (sortable and may contain info buttons). |
| `lens-result-table-header-checkbox`          | The actual checkbox for selecting all rows.                              |
| `lens-result-table-table-body`               | The `<tbody>` containing the data rows.                                  |
| `lens-result-table-pagination`               | Container for pagination controls.                                       |
| `lens-result-table-pagination-button`        | The previous and next arrow buttons.                                     |
| `lens-result-pagination-pagination-previous` | Specifically styles the “previous” button.                               |
| `lens-result-pagination-pagination-next`     | Specifically styles the “next” button.                                   |
| `lens-result-table-pagination-pagenumber`    | Shows the current page number and total number of pages.                 |
| `lens-result-table-pagination-switcher`      | Container for the optional page size switcher dropdown.                  |

---

### Example

```svelte
<lens-result-table title="Result Table" pageSize={25} pageSizeSwitcher={true} />
```

---

### Notes

- The first column always shows the site name, pulled from `lensOptions.siteMappings`.
- The rest of the columns are configured through `lensOptions.tableOptions.headerData`.
- Each column supports either a `dataKey` or a list of `aggregatedDataKeys` for display.
- Sorting toggles between ascending and descending per column.
- All row data and selection state are derived from stores (`siteStatus`, `datarequestsStore`).
