<script lang="ts">
    import type { DateRangeElement } from "../../types/catalogue";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { translate } from "../../helpers/translations";
    import { getContext } from "svelte";
    import AddButton from "./AddButton.svelte";

    let { element }: { element: DateRangeElement } = $props();

    const onItemAdded = getContext<(() => void) | undefined>("lens:item-added");

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: string = $state("");
    let to: string = $state("");

    export function focus(): void {
        fromInput.focus();
    }

    $effect(() => {
        fromInput.setCustomValidity("");
        if (!from && !to) {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
        } else if (from && to && from > to) {
            fromInput.setCustomValidity(translate("min_must_be_less_than_max"));
        }
    });

    function submit({ negated = false }: { negated?: boolean } = {}): void {
        if (!fromInput.reportValidity() || !toInput.reportValidity()) {
            return;
        }

        addItemToQuery(
            {
                type: "DateRangeItem",
                key: element.key,
                negated,
                min: from || undefined,
                max: to || undefined,
            },
            $activeQueryGroupIndex,
        );
        onItemAdded?.();
    }
</script>

<div class="grid grid-cols-subgrid col-span-full items-center">
    <div class="flex items-center gap-2.5">
        <input
            class="border border-gray-400 rounded-lg outline-none py-1 px-2.5 text-xs shadow-sm focus:border-primary-500"
            type="date"
            min={element.min}
            max={element.max}
            bind:value={from}
            bind:this={fromInput}
            onkeydown={(e) => {
                if (e.key === "Enter") submit();
            }}
        />
        <span>-</span>
        <input
            class="border border-gray-400 rounded-lg outline-none py-1 px-2.5 text-xs shadow-sm focus:border-primary-500"
            type="date"
            min={element.min}
            max={element.max}
            bind:value={to}
            bind:this={toInput}
            onkeydown={(e) => {
                if (e.key === "Enter") submit();
            }}
        />
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
