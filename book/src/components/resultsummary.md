# Result Summary

The `lens-result-summary` component displays a compact summary of result metrics defined in the Lens options. It is typically used to show overall values, such as the total number of patients found across all data sources or how many sources responded successfully.

## Example

To use it, define the configuration in the Lens options and include the component in your HTML:

```json
resultSummaryOptions: {
    title: "Results",
    infoButtonText: "This is a tooltip",
    dataTypes: [
        {
            title: "Patients",
            dataKey: "patients"
        }
    ]
}
```

```svelte
<lens-result-summary></lens-result-summary>
```

---

## CSS Parts

This component uses `::part()` selectors to expose internal styles for customization.

| Part Name                          | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `lens-result-summary`              | Grid wrapper for the entire result summary layout.      |
| `lens-result-summary-header`       | Container for the title and optional info button.       |
| `lens-result-summary-heading`      | Alignment wrapper for the heading text.                 |
| `lens-result-summary-header-title` | Flex layout for the header text and info button.        |
| `lens-result-summary-content`      | Flex container for the individual population summaries. |
| `lens-result-summary-content-type` | Holds each population title and its respective count.   |

---

### Styling Example

```css
[part~="lens-result-summary-header"] {
    background: #126154;
}
```
