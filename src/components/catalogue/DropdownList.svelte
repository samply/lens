<script lang="ts">
    import type {
        CatalogueOption,
        LeafCatalogueElement,
    } from "../../types/catalogue";
    import OptionInput from "./OptionInput.svelte";
    import NumericRangeInput from "./NumericRangeInput.svelte";
    import DateRangeInput from "./DateRangeInput.svelte";
    import FreeTextInput from "./FreeTextInput.svelte";
    import { translate } from "../../helpers/translations";

    export type DropdownItem =
        | { type: "heading"; label: string }
        | {
              type: "option";
              element: LeafCatalogueElement;
              option: CatalogueOption;
          }
        | { type: "input"; element: LeafCatalogueElement };

    interface Props {
        items: DropdownItem[];
        showDescription?: boolean;
    }

    let { items, showDescription = false }: Props = $props();

    type RowRef = { focus?(): void; submit?(): void };

    let rowRefs: (RowRef | undefined)[] = $state([]);

    const navigableIndices = $derived(
        items
            .map((item, i) => (item.type !== "heading" ? i : -1))
            .filter((i) => i !== -1),
    );

    let focusedIndex = $derived(navigableIndices[0] ?? -1) as number;

    let activeRowRef = $derived(
        focusedIndex >= 0 ? rowRefs[focusedIndex] : undefined,
    );

    let listEl: HTMLUListElement | undefined = $state();

    /**
     * Move focus by `delta` rows (+1 = down, -1 = up), wrapping around.
     *
     * Typical call site: `ArrowDown` / `ArrowUp` keydown handler on the outer
     * wrapper div that contains both the search input and the dropdown.
     *
     * Return value: `true` when the newly focused row is an input-type row
     * (the row's own input received focus). In that case the caller should NOT
     * re-focus the search bar — the user is now typing inside the row input.
     * `false` means an option row is focused and the search bar should keep (or
     * reclaim) focus so the user can keep typing to narrow results.
     */
    export function navigate(delta: number): boolean {
        const pos = navigableIndices.indexOf(focusedIndex);
        const next =
            navigableIndices[
                (pos + delta + navigableIndices.length) %
                    navigableIndices.length
            ];
        if (next === undefined) return false;
        focusedIndex = next;
        scrollActive();
        if (items[next]?.type === "input") {
            rowRefs[next]?.focus?.();
            return true;
        }
        return false;
    }

    /**
     * Submit the currently focused option row (i.e. add it to the query).
     *
     * Typical call site: `Enter` keydown handler on the search input element
     * itself (not the outer wrapper). Putting it on the input means it only
     * fires when the user is typing in the search box — row inputs handle their
     * own Enter via their own `onkeydown`. Has no effect when an input-type row
     * or a heading is focused.
     */
    export function submitFocused(): void {
        if (focusedIndex < 0) return;
        const item = items[focusedIndex];
        if (!item || item.type === "heading") return;
        if (item.type === "option") {
            activeRowRef?.submit?.();
        }
    }

    function scrollActive(): void {
        if (!listEl) return;
        const activeEl = listEl.querySelector(
            "[data-focused]",
        ) as HTMLElement | null;
        if (!activeEl) return;
        const containerTop = listEl.scrollTop;
        const containerBottom = containerTop + listEl.clientHeight;
        const elTop = activeEl.offsetTop;
        const elBottom = elTop + activeEl.clientHeight;
        if (elTop < containerTop) listEl.scrollTop = elTop;
        else if (elBottom > containerBottom)
            listEl.scrollTop = elBottom - listEl.clientHeight;
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ul
    bind:this={listEl}
    onmousedown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
    }}
    class="list-none m-0 p-0 overflow-y-auto"
    style="display:grid; grid-template-columns: auto max-content max-content max-content max-content"
>
    {#each items as item, i (i)}
        {#if item.type === "heading"}
            <li class="font-bold py-1.25 px-2.5" style="grid-column: 1 / -1">
                {item.label}
            </li>
        {:else}
            <li
                class="items-center py-1.25 px-2.5 cursor-pointer {i ===
                focusedIndex
                    ? 'bg-gray-200'
                    : ''}"
                style="grid-column: 1 / -1; display: grid; grid-template-columns: subgrid;"
                data-focused={i === focusedIndex ? "" : undefined}
            >
                {#if item.type === "option"}
                    <OptionInput
                        bind:this={rowRefs[i]}
                        element={item.element}
                        option={item.option}
                        {showDescription}
                    />
                {:else if item.element.type === "NumericRangeElement"}
                    <NumericRangeInput
                        bind:this={rowRefs[i]}
                        element={item.element}
                    />
                {:else if item.element.type === "DateRangeElement"}
                    <DateRangeInput
                        bind:this={rowRefs[i]}
                        element={item.element}
                    />
                {:else if item.element.type === "FreeTextElement"}
                    <FreeTextInput
                        bind:this={rowRefs[i]}
                        element={item.element}
                    />
                {/if}
            </li>
        {/if}
    {/each}
    {#if items.length === 0}
        <li class="py-1.25 px-2.5 text-sm" style="grid-column: 1 / -1">
            {translate("no_matches_found")}
        </li>
    {/if}
</ul>
