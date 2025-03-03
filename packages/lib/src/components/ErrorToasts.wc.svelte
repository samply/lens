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
