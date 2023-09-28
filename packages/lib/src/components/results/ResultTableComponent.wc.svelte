<svelte:options
    customElement={{
        tag: "lens-result-table",
        props: { pageSize: { type: "Number" } },
    }}
/>

<script lang="ts">
    import { negotiateStore } from "../../stores/negotiate";
    import { responseStore } from "../../stores/response";
    import type { Biobank, HeaderData } from "../../types/biobanks";
    import TableItemComponent from "./TableItemComponent.svelte";

    export let title: string = "";

    /**
     * data-types for the table
     * can be set with the props of the custom element
     */
    export let headerData: HeaderData[] = [
        {
            title: "Site",
            dataKey: "site",
        },
        {
            title: "Patients",
            dataKey: "patients",
        },
        {
            title: "Samples",
            dataKey: "samples",
        },
    ];

    /**
     * pagination
     * pageSize will be set with the props of the custom element
     */
    export let pageSize: number = 5;

    let activePage: number = 1;

    $: pageItems = biobankDataAsMap.slice(
        (activePage - 1) * pageSize,
        activePage * pageSize
    );

    /**
     * TODO: refactor type of obj when structure is clear
     */
    /**
     * Data for the table is transformed to a Map to be able to sort the data
     */
    const biobankDataAsMap: Biobank[] = Array.from($responseStore).map((obj: any) => {
        const map: Biobank = new Map(Object.entries(obj));
        const headerDataKeysInOrder: string[] = headerData.map(
            (header) => header.dataKey
        );
        const sortedEntries: [string, string | number | boolean][] = Array.from(
            map
        ).sort(
            ([keyA], [keyB]) =>
                headerDataKeysInOrder.indexOf(keyA) -
                headerDataKeysInOrder.indexOf(keyB)
        );
        const sortedEntriesAsMap: Biobank = new Map(sortedEntries);
        return new Map(sortedEntriesAsMap);
    });

    /**
     * watches the negotiateStore for changes to check or uncheck the checkbox
     * @param biobank: the biobank to check
     * @returns boolean
     */
    $: checked = (biobank: Biobank): boolean => {
        const bioBankIsChecked = Array.from($negotiateStore).some(
            (item) => biobank.get("site") === item.get("site")
        );
        return bioBankIsChecked;
    };

    $: allChecked = $negotiateStore.length === biobankDataAsMap.length;

    /**
     * checks or unchecks all biobanks
     * @returns void
     */
    const checkAllBiobanks = (): void => {
        if (allChecked) {
            $negotiateStore = [];
        } else {
            $negotiateStore = biobankDataAsMap;
        }
    };
</script>

<h4 part="result-table-title">{title}</h4>
<table part="result-table">
    <thead part="table-header">
        <tr part="table-header-row">
            <th part="table-header-cell table-header-cell-checkbox"
                ><input
                    part="table-header-checkbox"
                    type="checkbox"
                    bind:checked={allChecked}
                    on:change={checkAllBiobanks}
                /></th
            >
            {#each headerData as header}
                <th part="table-header-cell table-header-datatype"
                    >{header.title}</th
                >
            {/each}
        </tr>
    </thead>
    <tbody part="table-body">
        {#each pageItems as biobank}
            <TableItemComponent {biobank} checked={checked(biobank)} />
        {/each}
    </tbody>
</table>
<div part="table-pagination">
    <button
        part="table-pagination-button pagination-pagination-previous"
        disabled={activePage === 1}
        on:click={() => {
            activePage = activePage - 1;
        }}>&#8592;</button
    >
    <div part="table-pagination-pagenumber">{activePage}</div>
    <button
        part="table-pagination-button pagination-pagination-next"
        disabled={activePage === Math.ceil($responseStore.length / pageSize)}
        on:click={() => {
            activePage = activePage + 1;
        }}>&#8594;</button
    >
</div>
