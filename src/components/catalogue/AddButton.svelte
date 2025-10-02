<script lang="ts">
    import type {
        KeyboardEventHandler,
        MouseEventHandler,
    } from "svelte/elements";
    interface Props {
        inSearchBar: boolean;
        onkeydown?: KeyboardEventHandler<HTMLButtonElement>;
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }
    let { inSearchBar, onkeydown, onclick }: Props = $props();
</script>

<button
    aria-label="Add to query"
    part="lens-add-to-query-button {inSearchBar
        ? 'lens-add-to-query-button-searchbar'
        : ''}"
    {onkeydown}
    {onclick}
    type="button"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
            clip-rule="evenodd"
        />
    </svg>
</button>

<style>
    [part~="lens-add-to-query-button"] {
        border: none;
        background: none;
        cursor: pointer;
        padding: 0;
    }
    [part~="lens-add-to-query-button"] svg {
        display: block;
        height: 28px;
        color: var(--button-background-color);
    }
    [part~="lens-add-to-query-button"]:hover svg {
        color: var(--light-blue);
    }

    [part~="lens-add-to-query-button-searchbar"] svg {
        color: var(--white);
    }
    [part~="lens-add-to-query-button-searchbar"]:hover svg {
        color: var(--light-gray);
    }
</style>
