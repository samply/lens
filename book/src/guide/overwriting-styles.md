# Overwriting styles

All Lens components have a unique [part](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/part) attribute that you can use in your application to overwrite styles. We try our best to keep the names of part attributes stable but keep in mind that sometimes we will have to change the structure of a component which will likely break your style overrides.

For example overwrite the color of the search button as follows:

```css
::part(lens-search-button) {
    background-color: red;
}
::part(lens-search-button):hover {
    background-color: salmon;
}
```
