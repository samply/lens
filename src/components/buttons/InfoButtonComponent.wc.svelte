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
            viewBox="4 4 40 40"
        >
            <path
                d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"
            ></path>
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
        stroke-width: 1;
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
