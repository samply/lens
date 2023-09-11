<script lang="ts">
    import { negotiateStore } from "../../stores/negotiate";
    import type { Biobank, TransformedBiobank } from "../../types/biobanks";

    export let biobank: Biobank;
    export let checked: boolean = false;

    /**
     * adds and removes biobanks from the negotiateStore whenever the checkbox is checked or unchecked
     * @returns void
     */
    const updateStoreOnCheck = (): void => {
        if (checked) {
            negotiateStore.update((store: Biobank[]) => {
                return [...store, biobank];
            });
        }
        if (!checked) {
            negotiateStore.update((store: Biobank[]) => {
                return store.filter(
                    (site) => site.get("site") !== biobank.get("site")
                );
            });
        }
    };

    $: biobankData = Array.from(biobank.entries());
</script>

<tr part="table-body-row">
    <td part="table-body-cell"
        ><input
            part="table-body-checkbox"
            type="checkbox"
            bind:checked
            on:change={updateStoreOnCheck}
        /></td
    >

    {#each biobankData as data}
        <td part="table-body-cell">{data[1]}</td>
    {/each}
</tr>
