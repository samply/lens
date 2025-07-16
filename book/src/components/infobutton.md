# Info Button

The `lens-info-button` component displays a tooltip-style popup when clicked, used to provide users with helpful information or guidance. The popup is toggled by clicking the button and automatically closes when the button loses focus.

## Props

| Prop               | Type                            | Default    | Description                                                                                            |
| ------------------ | ------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `message`          | `string` or `string[]`          | `""`       | Text to display inside the tooltip. If an array is passed, each string will be rendered on a new line. |
| `buttonSize`       | `string`                        | `"16px"`   | Sets both the width and height of the button (e.g., `"24px"`).                                         |
| `alignDialogue`    | `"left" \| "right" \| "center"` | `"center"` | Controls where the tooltip appears relative to the button.                                             |
| `dialogueMaxWidth` | `string`                        | `"300px"`  | Maximum width of the tooltip container.                                                                |
| `inSearchBar`      | `boolean`                       | `false`    | Applies special styling when used inside a search bar (e.g., white icon with orange hover).            |

## Usage

Here's a basic example of how to use the `<lens-info-button>` component:

```html
<lens-info-button message="This will inform the user about the app!">
</lens-info-button>
```

Or with multiple lines:

```html
<lens-info-button
    message='["Line one", "Line two", "Line three"]'
    buttonSize="20px"
    alignDialogue="right"
    dialogueMaxWidth="250px"
>
</lens-info-button>
```

## Styling

The component uses Shadow DOM parts to allow styling from outside:

| Part name                                | Description                                    |
| ---------------------------------------- | ---------------------------------------------- |
| `lens-info-button`                       | Styles the button container.                   |
| `lens-info-button-icon`                  | Default icon styling.                          |
| `lens-info-button-icon-in-search-bar`    | Styling override when `inSearchBar` is `true`. |
| `lens-info-button-dialogue`              | Tooltip wrapper.                               |
| `lens-info-button-dialogue-message`      | Individual message lines.                      |
| `lens-info-button-dialogue-align-center` | Tooltip center alignment.                      |
| `lens-info-button-dialogue-align-left`   | Tooltip left alignment.                        |
| `lens-info-button-dialogue-align-right`  | Tooltip right alignment.                       |

To override styles, you can use the `::part()` selector:

```css
lens-info-button::part(lens-info-button-icon) {
    color: var(--primary-color);
}
```
