<script lang="ts">
    import type { NumericRangeElement } from "../../types/catalogue";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { translate } from "../../helpers/translations";
    import { getContext } from "svelte";
    import AddButton from "./AddButton.svelte";

    let { element }: { element: NumericRangeElement } = $props();

    const onItemAdded = getContext<(() => void) | undefined>("lens:item-added");

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: number | null = $state(null);
    let to: number | null = $state(null);

    export function focus(): void {
        fromInput.focus();
    }

    $effect(() => {
        fromInput.setCustomValidity("");
        if (from === null && to === null) {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
        } else if (from !== null && to !== null && from > to) {
            fromInput.setCustomValidity(translate("min_must_be_less_than_max"));
        }
    });

    function submit({ negated = false }: { negated?: boolean } = {}): void {
        if (!fromInput.reportValidity() || !toInput.reportValidity()) {
            return;
        }

        addItemToQuery(
            {
                type: "NumericRangeItem",
                key: element.key,
                negated,
                min: from ?? undefined,
                max: to ?? undefined,
            },
            $activeQueryGroupIndex,
        );
        onItemAdded?.();
    }
</script>

<div class="grid grid-cols-subgrid col-span-full items-center">
    <div class="flex items-center gap-1.25">
        <div
            class="flex text-[10pt] border border-gray-400 rounded-lg overflow-hidden shadow-sm focus-within:border-primary-500"
        >
            <input
                class="border-none outline-none py-1 px-2.5 w-12.5 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                step="any"
                min={element.min}
                max={element.max}
                bind:value={from}
                bind:this={fromInput}
                onkeydown={(e) => {
                    if (e.key === "Enter") submit();
                }}
            />
            {#if element.unitText !== undefined}
                <span
                    class="flex items-center border-l border-gray-400 px-2.5 bg-gray-100 text-xs"
                    >{element.unitText}</span
                >
            {/if}
        </div>
        <span>-</span>
        <div
            class="flex text-[10pt] border border-gray-400 rounded-lg overflow-hidden shadow-sm focus-within:border-primary-500"
        >
            <input
                class="border-none outline-none py-1 px-2.5 w-12.5 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                step="any"
                min={element.min}
                max={element.max}
                bind:value={to}
                bind:this={toInput}
                onkeydown={(e) => {
                    if (e.key === "Enter") submit();
                }}
            />
            {#if element.unitText !== undefined}
                <span
                    class="flex items-center border-l border-gray-400 px-2.5 bg-gray-100 text-xs"
                    >{element.unitText}</span
                >
            {/if}
        </div>
    </div>
    <div></div>
    <div></div>
    <div class="flex items-center">
        <AddButton negated={false} onclick={() => submit()} />
    </div>
    <div class="flex items-center">
        {#if element.negatable}
            <AddButton
                negated={true}
                onclick={() => submit({ negated: true })}
            />
        {/if}
    </div>
</div>
