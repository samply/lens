<svelte:options
    customElement={{
        tag: "error-toasts",
    }}
/>

<script lang="ts">
    import { fade } from "svelte/transition";
    import { errorToasts, removeToast } from "../stores/toasts";
</script>

<div part="flex-container">
    {#each $errorToasts as toast (toast.id)}
        <div out:fade part="toast">
            <div part="message">{toast.message}</div>
            <button
                part="close-button"
                onclick={() => {
                    removeToast(toast.id);
                }}
                aria-label="Close"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    style="height: 24px; width: 24px; display: block;"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    {/each}
</div>

<style>
    [part~="flex-container"] {
        pointer-events: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: var(--gap-xs);
        padding: var(--gap-s);
    }

    [part~="toast"] {
        pointer-events: auto;
        border-radius: var(--border-radius-small);
        background-color: #ef9a9a;
        border: solid 1px var(--red);
        display: flex;
        align-items: center;
    }

    [part~="message"] {
        padding: var(--gap-xs);
    }

    [part~="close-button"] {
        padding: var(--gap-xs);
        margin-left: auto; /* align right */

        /* Remove button default styles */
        background: none;
        color: inherit;
        border: none;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }
</style>
