# ChartComponent

The `lens-chart` component provides a styled wrapper for visualizing data using a canvas-based chart (e.g., Chart.js). It handles dynamic display behaviors like toggling chart visibility, showing hints, and rendering a fallback message when no data is available.

- Displays a chart inside a responsive layout.
- Renders a **title** above the chart.
- Shows a `No Data Available` overlay when no data is present.
- Optionally displays an info button with hint text.
- Exposes a `<slot />` for additional content below the chart.
- Handles chart click events via `handleClickOnStratifier`.

---

## Props

| Name              | Type                | Default     | Description                                                    |
| ----------------- | ------------------- | ----------- | -------------------------------------------------------------- |
| `title`           | `string`            | `""`        | Title displayed above the chart.                               |
| `options`         | `object`            | `undefined` | Optional config, e.g., `hintText`.                             |
| `noDataAvailable` | `boolean`           | `false`     | Determines if the "No Data Available" message should be shown. |
| `canvas`          | `HTMLCanvasElement` | –           | Bound canvas element for chart rendering.                      |

---

## CSS Parts

| Part Name                          | Description                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| `lens-chart-wrapper`               | Root wrapper with grid layout and background color.           |
| `lens-chart-info-button-wrapper`   | Positioned top-right; holds the optional info button.         |
| `lens-chart-title`                 | Renders the chart’s title, centered.                          |
| `lens-chart-overlay`               | Covers the chart area to display messages (e.g. no data).     |
| `lens-chart-no-data-available`     | Styled message shown when there is no chart data.             |
| `lens-chart-container-min-width-0` | Wraps the canvas; forces `min-width: 0` for responsiveness.   |
| `lens-chart-canvas`                | The chart rendering surface. Includes width/max-height rules. |

---

## Example Markup

```svelte
<div part="lens-chart-wrapper">
    {#if options?.hintText !== undefined}
        <div part="lens-chart-info-button-wrapper">
            <InfoButtonComponent
                message={options.hintText}
                alignDialogue="left"
            />
        </div>
    {/if}

    <h4 part="lens-chart-title">{title}</h4>

    {#if noDataAvailable}
        <div part="lens-chart-overlay">
            <p part="lens-chart-no-data-available">No Data Available</p>
        </div>
    {/if}

    <div part="lens-chart-container-min-width-0">
        <canvas
            part="lens-chart-canvas"
            bind:this={canvas}
            id="chart"
            onclick={handleClickOnStratifier}
        ></canvas>
    </div>

    <slot />
</div>
```

---

## Styling

```css
[part~="lens-chart-container-min-width-0"] {
    min-width: 0;
}

[part~="lens-chart-wrapper"] {
    height: 100%;
    display: grid;
    position: relative;
    background-color: var(--white);
}

[part~="lens-chart-overlay"] {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

[part~="lens-chart-no-data-available"] {
    font-weight: bold;
    color: var(--gray);
    background-color: var(--white);
    padding: 0.5em;
}

[part~="lens-chart-title"] {
    text-align: center;
    margin: 0;
    padding-bottom: var(--gap-m);
}

[part~="lens-chart-canvas"] {
    width: 100%;
    max-height: 400px;
}

[part~="lens-chart-info-button-wrapper"] {
    position: absolute;
    top: 0;
    right: 0;
}
```
