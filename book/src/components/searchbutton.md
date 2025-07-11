# SearchButtonComponent

The `lens-search-bar` component triggers a search based on the current query. It is a visually styled button that emits an event when clicked. If the button is disabled, it cannot be interacted with.

## Features

- Emits a global event when clicked:

    ```ts
    window.dispatchEvent(new CustomEvent("lens-search-triggered"));
    ```

- Resets the internal query modification state (`queryModified.set(false)`).
- Customizable label via the `title` prop.
- Disabled state support for UI control.

## Props

| Prop       | Type      | Default                | Description                                                       |
| ---------- | --------- | ---------------------- | ----------------------------------------------------------------- |
| `title`    | `string`  | `"search"` (localized) | The button's visible label. Uses a translation helper by default. |
| `disabled` | `boolean` | `false`                | Whether the button is disabled and non-interactive.               |

## Usage

```html
<lens-search-button></lens-search-button>
```

With a custom label and disabled state:

```html
<lens-search-button title="Apply Filter" disabled="{true}"></lens-search-button>
```

## Behavior

- When clicked, the button:
    1. Resets the `queryModified` store to `false`.
    2. Fires the event `lens-search-triggered`, which can be caught globally.

- When `disabled` is `true`, the button is grayed out and does not respond to clicks.

## Styling

This component uses `::part()` attributes to expose styling hooks.

| Part name                             | Description                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `lens-search-button`                  | Main button container.                                            |
| `lens-search-button-magnifying-glass` | Icon shown at the start of the button (rotated magnifying glass). |
| `lens-search-button-title`            | Text label inside the button.                                     |

### Example: Override button styles

```css
lens-search-button::part(lens-search-button) {
    background-color: var(--primary-color);
}

lens-search-button::part(lens-search-button-magnifying-glass) {
    font-size: 1.5rem;
    color: var(--highlight);
}
```
