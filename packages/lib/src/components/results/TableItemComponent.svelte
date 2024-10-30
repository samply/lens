<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";

    export let tableRow: (string | number)[];

    let checked: boolean = false;
    $: checked = $datarequestsStore.includes(tableRow[0] as string);

    /**
     * adds and removes tableRows from the negotiateStore whenever the checkbox is checked or unchecked
     */
    const updateStoreOnCheck = (): void => {
        if (!checked) {
            datarequestsStore.update((store: string[]) => {
                return [...store, tableRow[0] as string];
            });
        }
        if (checked) {
            datarequestsStore.update((store: string[]) => {
                return store.filter((site: string) => site !== tableRow[0]);
            });
        }
    };
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

    {#each tableRow as data}
        <td part="table-body-cell">{data}</td>
    {/each}
</tr>
