# Styling

Lens tries to be very customizable and thus all built-in styles should be overridable by applications. Styles in web components are usually scoped to the component and cannot be overwritten from the outside. Therefore all HTML elements in Lens should use the [part](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/part) attribute:

```html
<button part="lens-search-button"></button>
```

This enables applications to [override styles](./guide/overwriting-styles.md) from the outside as follows:

```css
::part(lens-search-button) {
    background-color: red;
}
```

However the `::part(foobar)` selector does not work when used in the `.svelte` component file itself. Therefore the convention in Lens is to use the `[part~="foobar"]` selector inside components:

```css
[part~="lens-search-button"] {
    background-color: blue;
}
```

This has several advantages:

- We can scope our CSS styles to the component which eases maintainability
- We don't have to come up with and specify an additional `class` name
- We cannot forget to set `part` attributes because we use them for ourselves for styling

Note that the old convention in Lens was to keep styles in a CSS file separate from the `.svelte` component. Many components still use the old convention but we are moving towards component scoped styles.
