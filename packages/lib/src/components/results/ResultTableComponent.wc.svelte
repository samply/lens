<svelte:options
    customElement={{
        tag: "lens-result-table",
        props: { pageSize: { type: "Number" } },
    }}
/>

<script lang="ts">
    import { uiSiteMappingsStore } from "../../stores/mappings";
    import { negotiateStore } from "../../stores/negotiate";
    import {
        getSitePopulationForCode,
        responseStore,
    } from "../../stores/response";
    import type { HeaderData } from "../../types/biobanks";
    import type { Site, Status } from "../../types/response";
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
            dataKey: "specimen",
        },
    ];

    /**
     * watches the responseStore for changes to update the table
     */
    let tableRowData: (string | number)[][] = [];

    const buildTableRowData = (responseStore): void => {
        tableRowData = [];

        responseStore.forEach((value: Site, key: string): void => {
            if (value.status !== "succeeded") return;

            let tableRow: (string | number)[] = [];

            headerData.forEach((header: HeaderData, index: number): void => {
                if (index === 0) {
                    const name = $uiSiteMappingsStore.get(key);
                    tableRow.push(name);
                } else {
                    tableRow.push(
                        getSitePopulationForCode(value.data, header.dataKey)
                    );
                }
            });

            tableRowData = [...tableRowData, tableRow];
        });
    };

    $: buildTableRowData($responseStore);
    /**
     * pagination
     * pageSize will be set with the props of the custom element
     */
    export let pageSize: number = 10;

    let activePage: number = 1;

    $: pageItems = tableRowData.slice(
        (activePage - 1) * pageSize,
        activePage * pageSize
    );

    /**
     * watches the negotiateStore for changes to check or uncheck the checkbox
     * @param biobank: the biobank to check
     * @returns boolean
     */

    $: allChecked =
        $negotiateStore.length === tableRowData.length &&
        tableRowData.length !== 0;

    /**
     * checks or unchecks all biobanks
     * @returns void
     */
    const checkAllBiobanks = (): void => {
        if (allChecked) {
            $negotiateStore = [];
        } else {
            console.log(tableRowData);
            $negotiateStore = tableRowData.map(
                (tableRow: (string | number)[]) => tableRow[0] as string
            );
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
        {#each pageItems as tableRow}
            <TableItemComponent {tableRow} />
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
        disabled={activePage === Math.ceil(tableRowData.length / pageSize)}
        on:click={() => {
            activePage = activePage + 1;
        }}>&#8594;</button
    >
</div>
