<script lang="ts">
    import { negotiateStore } from "../../stores/negotiate";

    export let tableRow: (string|number)[]
    
    let checked: boolean = false
    $: checked = $negotiateStore.includes(tableRow[0] as string);

    /**
     * adds and removes tableRows from the negotiateStore whenever the checkbox is checked or unchecked
     * @returns void
     */
    const updateStoreOnCheck = (): void => {
        console.log(checked);
        if (!checked) {
            negotiateStore.update((store: string[]) => {
                return [...store, tableRow[0] as string];
            });
        }
        if (checked) {
            negotiateStore.update((store: string[]) => {
                return store.filter(
                    (site: string) => site !== tableRow[0]
                );
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
