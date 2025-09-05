# Search Modified Display

`<lens-search-modified-display>` displays a visual cue when the current query has been modified:

![Screenshot of the query modified component](pics/querymodified.png)

## Usage

Include it like this:

```
<lens-search-modified-display></lens-search-modified-display>
```

You can customize the text using [translations](../guide/translations.md):

```
"texts": {
    "query_modified": {
        "en": "My custom text"
    }
}
```

## Styling

| Part Name                             | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `lens-query-modified-display-wrapper` | Wraps the content and applies border and spacing |

### Example

```css
lens-search-modified-display::part(lens-query-modified-display-wrapper) {
    background-color: var(--light-orange);
    color: var(--dark-orange);
    font-weight: bold;
}
```
