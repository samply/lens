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

<tr part="table-body-row">
    <td part="table-body-cell"
        ><input
            part="table-body-checkbox"
            type="checkbox"
            {checked}
            onchange={updateStoreOnCheck}
        /></td
    >

    {#each tableRow as data}
        <td part="table-body-cell">{data}</td>
    {/each}
</tr>
