<script lang="ts">
    import type { FreeTextElement } from "../../types/catalogue";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { translate } from "../../helpers/translations";
    import { getContext } from "svelte";
    import AddButton from "./AddButton.svelte";

    let { element }: { element: FreeTextElement } = $props();

    const onItemAdded = getContext<(() => void) | undefined>("lens:item-added");

    let input: HTMLInputElement;
    let value: string | null = $state(null);

    export function focus(): void {
        input.focus();
    }

    $effect(() => {
        input.setCustomValidity("");
        if (!value) {
            input.setCustomValidity(translate("cannot_be_empty"));
        }
    });

    function submit({ negated = false }: { negated?: boolean } = {}): void {
        if (!input.reportValidity()) {
            return;
        }

        addItemToQuery(
            {
                type: "SetItem",
                key: element.key,
                negated,
                values: [input.value],
            },
            $activeQueryGroupIndex,
        );
        onItemAdded?.();
    }
</script>

<div class="grid grid-cols-subgrid col-span-full items-center">
    <input
        class="border border-gray-400 rounded-lg outline-none py-1 px-2.5 text-base shadow-sm focus:border-primary-500"
        type="text"
        bind:this={input}
        bind:value
        placeholder={translate("enter_filter_term")}
        onkeydown={(e) => {
            if (e.key === "Enter") submit();
        }}
    />
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
