<script lang="ts">
    import type {
        AutocompleteElement,
        CatalogueOption,
    } from "../../types/catalogue";
    import { setContext } from "svelte";
    import DropdownList, { type DropdownItem } from "./DropdownList.svelte";
    import { translate } from "../../helpers/translations";

    interface Props {
        element: AutocompleteElement;
    }

    let { element }: Props = $props();

    let inputValue: string = $state("");
    let autoCompleteOpen = $state(false);
    let dropdownRef: DropdownList | undefined = $state();

    setContext("lens:item-added", () => {
        inputValue = "";
    });

    let options: CatalogueOption[] = $derived.by(() => {
        function collect(option: CatalogueOption): CatalogueOption[] {
            const result: CatalogueOption[] = [];
            if (option.visible !== false) result.push(option);
            for (const sub of option.suboptions ?? []) {
                result.push(...collect(sub));
            }
            return result;
        }
        return element.options.flatMap(collect);
    });

    const dropdownItems: DropdownItem[] = $derived(
        options
            .filter(
                (item) =>
                    item.name.toLowerCase().includes(inputValue) ||
                    item.description?.toLowerCase().includes(inputValue),
            )
            .map((opt) => ({
                type: "option" as const,
                element,
                option: opt,
            })),
    );

    function handleKeys(event: KeyboardEvent): void {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            dropdownRef?.navigate(1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            dropdownRef?.navigate(-1);
        } else if (event.key === "Escape") {
            inputValue = "";
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="my-2.5 relative"
    onkeydown={handleKeys}
    onfocusout={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
            autoCompleteOpen = false;
    }}
>
    <input
        class="box-border border border-gray-400 rounded-lg outline-none px-2.5 py-1 text-sm shadow-sm w-full focus:border-primary-500"
        type="text"
        bind:value={inputValue}
        placeholder={translate("search_placeholder")}
        onkeydown={(e) => {
            if (e.key === "Enter") dropdownRef?.submitFocused();
        }}
        onfocusin={() => (autoCompleteOpen = true)}
    />
    {#if autoCompleteOpen && inputValue.length > 0}
        <div
            class="box-border z-10 w-full absolute bg-white text-black border border-gray-400 rounded-lg shadow-sm max-h-96 overflow-y-auto"
        >
            <DropdownList
                bind:this={dropdownRef}
                items={dropdownItems}
                showDescription={true}
            />
        </div>
    {/if}
</div>
