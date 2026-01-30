# Result Summary

The `ResultSummary` component displays a compact summary of result metrics defined in the Lens options. It is typically used to show overall values, such as the total number of patients found across all data sources or how many sources responded successfully.

---

## Props

This component does not accept any props.

## Example

To use the component, define the configuration in the Lens [resultSummaryOptions](https://samply.github.io/lens/docs/types/ResultSummaryOptions.html) (as described in the [Options and catalogue](../guide/new-app.md#options-and-catalogue) section):

```json
"resultSummaryOptions": {
    "title": "Results",
    "infoButtonText": "This is a tooltip",
    "dataTypes": [
        {
            "title": "Patients",
            "dataKey": "patients"
        }
    ]
}
```

---

## Usage

The component (which doesn't use any props) can then be included in your Svelte file:

```svelte
<ResultSummary />
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
