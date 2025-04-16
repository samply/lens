
This is how you would implement a reset button using the resetDiagrams functionn (service: reset.ts)

```svelte
<!-- ToDo Change "Reset" to be dynamic (translated)-->
    <button class="reset-button" onclick={resetDiagrams}>Reset</button>

<!-- ToDo Move Style ? -->
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