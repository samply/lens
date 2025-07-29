# Chart

The `lens-chart` component provides a styled wrapper for visualizing data using Chart.js. It handles dynamic display behaviors like toggling chart visibility, showing hints, and rendering a fallback message when no data is available. Some Options are setable via [ChartOption](https://samply.github.io/lens/docs/types/ChartOption.html)

The componnent is contsturced from a title, the graph. After the title and after the graph are each slots to input custome elements. Via the options you can toggle a

---

## Props

| Name                   | Type                  | Default    | Description                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                | `string`              | `""`       | Title displayed above the chart.                                                                                                                                                                                                                                                                 |
| `indexAxis`            | `string`              | `"x"`      | Determes which axis is used to. With the input 'y' the render data will be flipped                                                                                                                                                                                                               |
| `xAxisTitle`           | `string`              | `""`       | Title below the xasis.                                                                                                                                                                                                                                                                           |
| `yAxisTitle`           | `string`              | `""`       | Title below the yasis.                                                                                                                                                                                                                                                                           |
| `clickToAddState`      | `boolean`             | `"false"`  | With this prop set to true it will add the clicked item to the search. The rendered element must have the same name as the catalogue item.                                                                                                                                                       |
| `headers`              | `Map<string, string>` | `""`       | TBD                                                                                                                                                                                                                                                                                              |
| `displayLegends`       | `boolean`             | `""`       | With this option a legende of all data items is render below the graph.                                                                                                                                                                                                                          |
| `chartType`            | `ChartTypeRegistry`   | `""`       | Which type of chart is rendered                                                                                                                                                                                                                                                                  |
| `scaleType`            | `string`              | `"linear"` | Sets the scale type of the chart. Either "linear" or "logarithmic"                                                                                                                                                                                                                               |
| `dataKey`              | `string`              | `""`       | Looks up the data in the Result store.                                                                                                                                                                                                                                                           |
| `perSite`              | `boolean`             | `"false"`  | If true shows the total of the per of the datakey per lens result.                                                                                                                                                                                                                               |
| `groupRange`           | `number`              | `""`       | ets the user define a range for the labels when only single values are used eg. '60' -> '60 - 69'.                                                                                                                                                                                               |
| `groupingDivider`      | `string`              | `""`       | Is the char that combines subgroups into their supergroups like C30, C31.1 and C31.2 into C31                                                                                                                                                                                                    |
| `filterRegex`          | `string`              | `""`       | Filters data according to the provied regular expression.                                                                                                                                                                                                                                        |
| `groupingLabel`        | `string`              | `""`       | Sets divider for grouping stratifer together.                                                                                                                                                                                                                                                    |
| `viewScales`           | `boolean`             | `"true"`   | Displayes the scales on the x and y axis.                                                                                                                                                                                                                                                        |
| `backgroundColor`      | `string[]`            | `""`       | Expects an array with hex color strings. These colors will be set in the order which are provided. There is no posibillity to map results to certain colors. If no color is set, there are the lens default colors. If you provide more results then colors, they will repeat from the begining. |
| `backgroundHoverColor` | `string[]`            | `""`       | Similar functionality as the backrgound color, instead the hover colors.                                                                                                                                                                                                                         |

---

## Example

```svelte
<lens-chart
    title="Gender"
    catalogueGroupCode="gender"
    chartType="pie"
    displayLegends="true"
></lens-chart>
```

---

## Styling

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
