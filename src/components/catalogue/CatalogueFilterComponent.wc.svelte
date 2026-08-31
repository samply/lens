<svelte:options
    customElement={{
        tag: "lens-catalogue-filter",
    }}
/>

<script lang="ts">
    import {
        catalogue,
        openTreeNodes,
        revealedCriterion,
    } from "../../stores/catalogue";
    import {
        addOpenNodes,
        defaultMatchLimit,
        searchCatalogue,
        type CatalogueMatch,
    } from "../../helpers/catalogue-filter";
    import { translate } from "../../helpers/translations";

    interface Props {
        /**
         * milliseconds to wait after the last keystroke before the catalogue is searched
         */
        debounceMs?: number;
        /**
         * maximum number of matches shown in the dropdown
         */
        matchLimit?: number;
    }

    let { debounceMs = 150, matchLimit = defaultMatchLimit }: Props = $props();

    let inputElement: HTMLInputElement | undefined = $state();
    let inputValue: string = $state("");
    let searchTerm: string = $state("");
    let optionsOpen: boolean = $state(false);
    let focusedMatchIndex: number = $state(0);
    let optionElements: HTMLElement[] = $state([]);

    $effect(() => {
        const term = inputValue;
        const timeout = setTimeout(() => {
            searchTerm = term;
            focusedMatchIndex = 0;
        }, debounceMs);
        return () => clearTimeout(timeout);
    });

    let matches: CatalogueMatch[] = $derived(
        searchCatalogue($catalogue, searchTerm, matchLimit),
    );

    /**
     * opens the tree down to the match and lets the tree scroll to it
     * @param match the match to reveal
     */
    const revealMatch = (match: CatalogueMatch): void => {
        openTreeNodes.update((nodes) => addOpenNodes(nodes, match.chain));
        revealedCriterion.set({
            categoryKey: match.categoryKey,
            criterionKey: match.criterionKey ?? null,
        });
        // the tree only reads the target, so it is dropped once the tree had a chance
        // to react and cannot make a later render scroll away again
        setTimeout(() => revealedCriterion.set(null), 1000);
        // selecting with the mouse takes the focus out of the input
        inputElement?.focus();
        optionsOpen = false;
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
            optionsOpen = false;
            return;
        }
        if (matches.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            focusedMatchIndex = (focusedMatchIndex + 1) % matches.length;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusedMatchIndex =
                (focusedMatchIndex - 1 + matches.length) % matches.length;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            revealMatch(matches[focusedMatchIndex]);
        }
    };

    $effect(() => {
        optionElements[focusedMatchIndex]?.scrollIntoView({ block: "nearest" });
    });
</script>

<div part="lens-catalogue-filter">
    <input
        part="lens-catalogue-filter-input"
        type="text"
        bind:this={inputElement}
        bind:value={inputValue}
        placeholder={translate("catalogue_filter_placeholder")}
        onkeydown={handleKeyDown}
        oninput={() => (optionsOpen = true)}
        onfocusin={() => (optionsOpen = true)}
        onfocusout={() => (optionsOpen = false)}
    />
    {#if inputValue !== ""}
        <button
            part="lens-catalogue-filter-clear-button"
            title={translate("catalogue_filter_clear")}
            aria-label={translate("catalogue_filter_clear")}
            onclick={() => (inputValue = "")}
        >
            &#10005;
        </button>
    {/if}

    {#if optionsOpen && searchTerm.trim().length > 1}
        <ul part="lens-catalogue-filter-options">
            {#each matches as match, index (index)}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- onmousedown is chosen because the input looses focus when clicked
                     outside, which will close the options before the click is finished -->
                <li
                    bind:this={optionElements[index]}
                    part="lens-catalogue-filter-options-item {index ===
                    focusedMatchIndex
                        ? 'lens-catalogue-filter-options-item-focused'
                        : ''}"
                    onmousedown={() => revealMatch(match)}
                >
                    <div part="lens-catalogue-filter-options-item-name">
                        {match.name}
                    </div>
                    {#if match.description}
                        <div
                            part="lens-catalogue-filter-options-item-description"
                        >
                            {match.description}
                        </div>
                    {/if}
                    <div part="lens-catalogue-filter-options-item-path">
                        {match.chain.map((node) => node.name).join(" › ")}
                    </div>
                </li>
            {:else}
                <li
                    part="lens-catalogue-filter-options-item lens-catalogue-filter-options-item-empty"
                >
                    {translate("catalogue_filter_no_matches")}
                </li>
            {/each}
            {#if matches.length === matchLimit}
                <li
                    part="lens-catalogue-filter-options-item lens-catalogue-filter-options-item-empty"
                >
                    {translate("catalogue_filter_refine")}
                </li>
            {/if}
        </ul>
    {/if}
</div>

<style>
    [part~="lens-catalogue-filter"] {
        position: relative;
        margin-bottom: var(--gap-s);
    }

    /* Input field styled to match the autocomplete input */
    [part~="lens-catalogue-filter-input"] {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        outline: none;
        padding: var(--gap-xxs) var(--gap-m) var(--gap-xxs) var(--gap-xs);
        font-family: var(--font-family);
        font-size: var(--font-size-s);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    [part~="lens-catalogue-filter-input"]:focus {
        border-color: var(--blue);
    }

    [part~="lens-catalogue-filter-clear-button"] {
        position: absolute;
        right: var(--gap-xxs);
        top: var(--gap-xxs);
        border: none;
        background-color: unset;
        color: var(--font-color);
        font-size: var(--font-size-s);
        line-height: 1;
        padding: var(--gap-xxs);
        cursor: pointer;
    }

    [part~="lens-catalogue-filter-options"] {
        box-sizing: border-box;
        z-index: 1;
        list-style-type: none;
        padding: 0;
        margin: 0;
        width: 100%;
        position: absolute;
        background-color: white;
        color: black;
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-height: 400px;
        overflow-y: auto;
    }

    [part~="lens-catalogue-filter-options-item"] {
        cursor: pointer;
        padding: var(--gap-xxs) var(--gap-xs);
        font-size: var(--font-size-s);
    }

    [part~="lens-catalogue-filter-options-item-focused"] {
        color: var(--white);
        background-color: var(--blue);
    }

    [part~="lens-catalogue-filter-options-item"]:hover:not(
            [part~="lens-catalogue-filter-options-item-focused"]
        ) {
        background-color: var(--light-gray);
    }

    [part~="lens-catalogue-filter-options-item-empty"] {
        cursor: default;
        color: var(--gray);
    }

    [part~="lens-catalogue-filter-options-item-description"] {
        font-size: var(--font-size-xs);
    }

    [part~="lens-catalogue-filter-options-item-path"] {
        font-size: var(--font-size-xs);
        opacity: 0.7;
    }
</style>
