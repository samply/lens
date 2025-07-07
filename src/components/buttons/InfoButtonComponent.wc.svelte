<svelte:options
    customElement={{
        tag: "lens-info-button",
    }}
/>

<script lang="ts">
    interface Props {
        message?: string[] | string;
        buttonSize?: string;
        alignDialogue?: "left" | "right" | "center";
        dialogueMaxWidth?: string;
        /** Info button in search bar is white and orange on hover */
        inSearchBar?: boolean;
    }

    let {
        message = "",
        buttonSize = "16px",
        alignDialogue = "center",
        dialogueMaxWidth = "300px",
        inSearchBar = false,
    }: Props = $props();

    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = $state(false);

    const onFocusOut = (): void => {
        tooltipOpen = false;
    };

    const displayQueryInfo = (e: MouseEvent): void => {
        if (typeof message == "string") {
            message = message.split(",");
        }

        const target: HTMLElement = e.target as HTMLElement;
        if (
            target.getAttribute("part") !== "lens-info-button-dialogue" &&
            target.getAttribute("part") !== "lens-info-button-dialogue-message"
        ) {
            tooltipOpen = !tooltipOpen;
        }
    };
</script>

<button
    part="lens-info-button"
    onclick={(e) => displayQueryInfo(e)}
    onfocusout={onFocusOut}
    style="width: {buttonSize}; height: {buttonSize};"
>
    <div
        part={inSearchBar
            ? "lens-info-button-icon-in-search-bar"
            : "lens-info-button-icon"}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-info-circle"
            viewBox="0 0 16 16"
        >
            <path
                d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
            />
            <path
                d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
            />
        </svg>
    </div>
    {#if tooltipOpen}
        <div
            part="lens-info-button-dialogue {`lens-info-button-dialogue-align-${alignDialogue}`}"
            style="user-select: text; top: {buttonSize}; max-width: {dialogueMaxWidth};"
        >
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each message as msg}
                <div
                    part="lens-info-button-dialogue-message"
                    style="user-select: text;"
                >
                    {msg}
                </div>
            {/each}
        </div>
    {/if}
</button>

<style>
    [part~="lens-info-button"] {
        display: block;
        position: relative;
        cursor: pointer;
        border: none;
        padding: 0;
        background-color: transparent;
    }

    [part~="lens-info-button-icon"]:hover {
        stroke: currentColor;
        stroke-width: 0.5;
    }

    [part~="lens-info-button-icon-in-search-bar"] {
        color: var(--white);
    }

    [part~="lens-info-button-icon-in-search-bar"]:hover {
        color: var(--orange);
    }

    [part~="lens-info-button-dialogue"] {
        margin-top: var(--gap-xs);
        cursor: auto;
        position: absolute;
        background-color: var(--white);
        width: max-content;
        z-index: 100;
        padding: var(--gap-xs);
        border: solid 1px var(--blue);
        border-radius: var(--border-radius-small);
    }

    [part~="lens-info-button-dialogue-align-center"] {
        left: 50%;
        transform: translateX(-50%);
    }

    [part~="lens-info-button-dialogue-align-right"] {
        left: 0;
    }

    [part~="lens-info-button-dialogue-align-left"] {
        right: 0;
    }
</style>
