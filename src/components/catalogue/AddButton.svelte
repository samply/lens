<script lang="ts">
    import type {
        KeyboardEventHandler,
        MouseEventHandler,
    } from "svelte/elements";
    interface Props {
        inSearchBar: boolean;
        checkmark?: boolean;
        onkeydown?: KeyboardEventHandler<HTMLButtonElement>;
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }
    let { inSearchBar, checkmark = false, onkeydown, onclick }: Props = $props();
</script>

<button
    tabindex="0"
    aria-label={checkmark ? "Apply" : "Add to query"}
    part="lens-add-to-query-button {inSearchBar
        ? 'lens-add-to-query-button-searchbar'
        : ''}"
    {onkeydown}
    {onclick}
    type="button"
>
    {#if checkmark}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                fill-rule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clip-rule="evenodd"
            />
        </svg>
    {:else}
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
    {/if}
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
