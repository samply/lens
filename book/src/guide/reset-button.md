# Chart reset button

This is how you would implement a reset button using the `resetDiagrams` function.

```html
<script>
    import { resetDiagrams } from "@samply/lens";
</script>

<!-- example for a simple button-->
<button class="reset-button" onclick="{resetDiagrams}">Reset</button>

<!-- styling to fit with the rest/other buttons -->
<style>
    button.reset-button {
        background-color: var(--button-background-color);
        color: var(--button-color);
        border: none;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xs) var(--gap-s);
        font-size: var(--font-size-m);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
    }
</style>
```
