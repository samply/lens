<svelte:options
    customElement={{
        tag: "lens-info-button",
    }}
/>

<script lang="ts">
    interface Props {
        message?: string[] | string;
        buttonSize?: number;
        alignDialogue?:
            | "top-left"
            | "top-center"
            | "top-right"
            | "bottom-left"
            | "bottom-center"
            | "bottom-right";
        dialogueMaxWidth?: string;
        /** Info button in search bar is white and orange on hover */
        inSearchBar?: boolean;
    }

    let {
        message = "",
        buttonSize = 16,
        alignDialogue = "bottom-center",
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

    let dialogue!: HTMLElement;

    const displayQueryInfo = (e: MouseEvent): void => {
        if (typeof message == "string") {
            message = message.split(",");
        }

        const target: HTMLElement = e.target as HTMLElement;

        if (!dialogue?.contains(target)) {
            tooltipOpen = !tooltipOpen;
        }
    };

    const top =
        alignDialogue === "top-left" ||
        alignDialogue === "top-right" ||
        alignDialogue === "top-center"
            ? `bottom: ${buttonSize}px;`
            : "";
</script>

<button
    part="lens-info-button"
    onclick={(e) => displayQueryInfo(e)}
    onfocusout={onFocusOut}
    style="height: {buttonSize}px; width: {buttonSize}px;"
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
            bind:this={dialogue}
            part="lens-info-button-dialogue lens-info-button-dialogue-align-{alignDialogue}"
            style="{top} max-width: {dialogueMaxWidth};"
        >
            {#each message as msg, index (msg + index)}
                <div part="lens-info-button-dialogue-message">
                    {msg}
                </div>
            {/each}
            <slot />
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
        flex-shrink: 0;
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
        margin-bottom: var(--gap-xs);
        cursor: auto;
        position: absolute;
        background-color: var(--white);
        width: max-content;
        z-index: 100;
        padding: var(--gap-xs);
        border: solid 1px var(--blue);
        border-radius: var(--border-radius-small);
        text-align: left;
        user-select: text;
    }

    [part~="lens-info-button-dialogue-align-top-left"],
    [part~="lens-info-button-dialogue-align-bottom-left"] {
        right: 0;
    }

    [part~="lens-info-button-dialogue-align-top-center"],
    [part~="lens-info-button-dialogue-align-bottom-center"] {
        left: 50%;
        transform: translateX(-50%);
    }

    [part~="lens-info-button-dialogue-align-top-right"],
    [part~="lens-info-button-dialogue-align-bottom-right"] {
        left: 0;
    }

    [part~="lens-info-button-dialogue-message"] {
        text-align: left;
        user-select: text;
    }
</style>
