# Search Button

The `lens-search-button` component triggers a search based on the current query. It is a visually styled button that emits an event when clicked. While a search is ongoing (any site is in `claimed` state), the magnifying-glass icon is replaced by a spinning loader icon.

## Features

- Emits a event `lens-search-triggered` when clicked. With this event you would trigger some sort of data request for data provider.
- Shows a spinner icon during ongoing search processing.

## Props

| Prop       | Type      | Default                | Description                                                       |
| ---------- | --------- | ---------------------- | ----------------------------------------------------------------- |
| `title`    | `string`  | `"search"` (localized) | The button's visible label. Uses a translation helper by default. |
| `disabled` | `boolean` | `false`                | Whether the button is disabled and non-interactive.               |

## Usage

```html
<lens-search-button></lens-search-button>
```

## Styling

The component uses Tailwind utility classes internally and does not expose custom `part` selectors.

### Note

The leading icon is stateful:

- idle: magnifying glass
- ongoing search: spinning loader
