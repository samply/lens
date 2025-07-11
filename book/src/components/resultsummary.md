# ResultsummaryComponent

The `lens-result-summary` component displays a compact summary of result metrics derived from backend data. It dynamically computes and presents counts for different data types defined in `lensOptions`.

---

## Behavior and Features

- Dynamically computes and displays population summaries (e.g. `13 / 15`) based on site status and result summary options.
- Displays a configurable header with optional info button.
- Supports multiple population types using either single or aggregated data keys.
- Reactively updates based on changes to `lensOptions` and `siteStatus`.
- Layouts are optimized for horizontal alignment and grid-based placement.

---

## Props

This component uses data derived from Svelte stores and doesn’t accept direct props. It reacts to:

| Source        | Key                      | Description                                            |
| ------------- | ------------------------ | ------------------------------------------------------ |
| `lensOptions` | `resultSummaryOptions`   | Provides `title`, `infoButtonText`, and `dataTypes`.   |
| `siteStatus`  | internal store           | Used to calculate collection and population summaries. |
| `response.ts` | `getTotal`, `getStratum` | Functions for aggregating count values.                |

---

## CSS Parts

| Part Name                          | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `lens-result-summary`              | Grid wrapper for the entire result summary layout.      |
| `lens-result-summary-header`       | Container for the title and optional info button.       |
| `lens-result-summary-heading`      | Alignment wrapper for the heading text.                 |
| `lens-result-summary-header-title` | Flex layout for the header text and info button.        |
| `lens-result-summary-content`      | Flex container for the individual population summaries. |
| `lens-result-summary-content-type` | Holds each population title and its respective count.   |

---

## Example Markup

```svelte
<div part="lens-result-summary">
    {#if $lensOptions?.resultSummaryOptions?.title !== undefined}
        <div part="lens-result-summary-header">
            <div part="lens-result-summary-heading">
                <h4 part="lens-result-summary-header-title">
                    {$lensOptions?.resultSummaryOptions.title}
                    {#if $lensOptions?.resultSummaryOptions.infoButtonText !== undefined}
                        <InfoButtonComponent
                            message={[
                                $lensOptions?.resultSummaryOptions
                                    .infoButtonText,
                            ]}
                        />
                    {/if}
                </h4>
            </div>
        </div>
    {/if}
    <div part="lens-result-summary-content">
        {#each populations as population}
            <div part="lens-result-summary-content-type">
                {population.title}: {population.population}
            </div>
        {/each}
    </div>
</div>
```

---

## Styling

```css
[part~="lens-result-summary"] {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-gap: var(--gap-xl);
    grid-column: 1/-1;
    align-items: center;
}

[part~="lens-result-summary-content"] {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 10px;
}

[part~="lens-result-summary-header-title"] {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
}
```
