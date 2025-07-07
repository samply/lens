<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";

    interface Props {
        tableRow: (string | number)[];
    }

    let { tableRow }: Props = $props();

    let checked: boolean = $derived(
        $datarequestsStore.includes(tableRow[0] as string),
    );

    /**
     * adds and removes tableRows from the negotiateStore whenever the checkbox is checked or unchecked
     */
    const updateStoreOnCheck = (): void => {
        if (!checked) {
            datarequestsStore.update((store: string[]) => {
                return [...store, tableRow[0] as string];
            });
        } else {
            datarequestsStore.update((store: string[]) => {
                return store.filter((site: string) => site !== tableRow[0]);
            });
        }
    };
</script>

<tr part="lens-result-table-item-body-row">
    <td
        part="lens-result-table-item-body-cell lens-result-table-item-body-cell-checkbox"
        ><input
            part="lens-result-table-item-body-checkbox"
            type="checkbox"
            {checked}
            onchange={updateStoreOnCheck}
        /></td
    >

    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each tableRow as data}
        <td part="lens-result-table-item-body-cell">{data}</td>
    {/each}
</tr>

<style>
    [part~="lens-result-table-item-body-row"] {
        border-bottom: solid 1px var(--light-gray);
    }

    [part~="lens-result-table-item-body-cell"] {
        padding-top: var(--gap-xs);
    }
</style>
