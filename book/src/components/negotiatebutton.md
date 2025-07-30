# Negotiate Button

The `lens-negotiate-button` component allows users to initiate a data request. It becomes active when one or more (site/data sources) are selected. Depending on the configuration, it either dispatches a general event or starts a negotiation through the BBMRI-ERIC Negotiator service. The button is disabled by default when no data source is selected. Fires a global `lens-negotiate-triggered` event when clicked.

Optionally integrates with the [BBMRI-ERIC Negotiator](https://www.bbmri-eric.eu/) when `type` is set to `"Negotiator"`.

## Props

| Prop    | Type     | Default          | Description                                                                                    |
| ------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `title` | `string` | `"Request Data"` | The label shown on the button.                                                                 |
| `type`  | `string` | `""`             | Determines the negotiation behavior. Use `"Negotiator"` to enable integration with BBMRI-ERIC. |

## Behavior

- The button is **disabled** when no data sources are selected (`datarequestsStore` is empty).
- Clicking the button always triggers a global browser event:

    ```ts
    window.dispatchEvent(new CustomEvent("lens-negotiate-triggered"));
    ```

- If `type` is `"Negotiator"`, the internal `bbmriNegotiate()` function is also called, passing the current data request list.

## Usage

```html
<lens-negotiate-button type="Negotiator"></lens-negotiate-button>
```

Or with a custom label:

```html
<lens-negotiate-button
    type="Custom"
    title="Start Request"
></lens-negotiate-button>
```

## Styling

| Part name                        | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `lens-negotiate-button`          | Base button styling.                                    |
| `lens-negotiate-button-active`   | Applied when the button is enabled and clickable.       |
| `lens-negotiate-button-disabled` | Applied when the button is inactive (no data selected). |
| `lens-negotiate-button-title`    | Styles the text inside the button.                      |

### Example

```css
lens-negotiate-button::part(lens-negotiate-button-active) {
    background-color: var(--custom-green);
}
```
