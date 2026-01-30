# Search Button

The `lens-search-button` component triggers a search based on the current query. It is a visually styled button that emits an event when clicked. The button can be disabled via a prop, or will be disabled when a error state is entered in the searchbar.

## Features

- Emits a event `lens-search-triggered` when clicked. With this event you would trigger some sort of data request for data provider.

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

| Part name                             | Description                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `lens-search-button`                  | Main button container.                                            |
| `lens-search-button-magnifying-glass` | Icon shown at the start of the button (rotated magnifying glass). |
| `lens-search-button-title`            | Text label inside the button.                                     |

### Example

```css
lens-search-button::part(lens-search-button) {
    background-color: var(--primary-color);
}

lens-search-button::part(lens-search-button-magnifying-glass) {
    font-size: 1.5rem;
    color: var(--highlight);
}
```
