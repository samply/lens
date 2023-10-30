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
    import TableItemComponent from "./TableItemComponent.svelte";
    import { lensOptions } from "../../stores/options";
    import type { HeaderData } from "../../types/biobanks";
    import type { Site } from "../../types/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";

    export let title: string = "";

    /**
     * data-types for the table
     * can be set via options component
     */
    let options: any;
    $: options = ($lensOptions?.tableOptions && $lensOptions?.tableOptions) || {
        headerData: [{ title: "", dataKey: "" }],
    };

    $: options?.headerData?.forEach(
        (header: HeaderData, index: number): void => {
            header.ascending = true;
        }
    );

    /**
     * watches the responseStore for changes to update the table
     */
    type TableRowData = (string | number)[][];
    let tableRowData: TableRowData = [];

    const buildTableRowData = (responseStore): void => {
        tableRowData = [];

        responseStore.forEach((value: Site, key: string): void => {
            if (value.status !== "succeeded") return;

            let tableRow: (string | number)[] = [];

            options.headerData.forEach(
                (header: HeaderData, index: number): void => {
                    if (index === 0) {
                        const name = $uiSiteMappingsStore.get(key);
                        tableRow.push(name);
                    } else {
                        tableRow.push(
                            getSitePopulationForCode(value.data, header.dataKey)
                        );
                    }
                }
            );

            tableRowData = [...tableRowData, tableRow];
        });
    };

    $: buildTableRowData($responseStore);
    $: tableRowData = sortTable(
        sortColumnIndex,
        options.headerData[sortColumnIndex].ascending,
        tableRowData
    );

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
            $negotiateStore = tableRowData.map(
                (tableRow: (string | number)[]) => tableRow[0] as string
            );
        }
    };

    /**
     * sort tableRowData alphanumerically by the given column
     */

    let sortColumnIndex: number = 0;

    /**
     * sorts the tableRowData by the given column
     * @param column column to sort
     * @param ascending order of the sort, changes after every click but not on incoming responses
     * @param tableRowData as an argument to make the function reactive and prevent race conditions with incoming responses
     * @param changeAscending if true, the order of the sort will change after every click
     */
    const sortTable = (
        column: number,
        ascending: boolean = true,
        tableRowData: TableRowData,
        changeAscending: boolean = false
    ): TableRowData => {
        /**
         * sets the index of the column to sort, so that further incoming responses don't mess up the sorting
         */
        sortColumnIndex = column;

        tableRowData = tableRowData.sort((a, b) => {
            if (a[column] < b[column]) {
                return ascending ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return ascending ? 1 : -1;
            }
            return 0;
        });

        if (changeAscending) {
            options.headerData[column].ascending = !ascending;
        }

        return tableRowData;
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
            {#each options.headerData as header, index}
                <th
                    part="table-header-cell table-header-datatype"
                    on:click={() =>
                        sortTable(index, header.ascending, tableRowData, true)}
                    >
                    {header.title}
                    {#if header.hintText}
                        <InfoButtonComponent message={header.hintText} />
                    {/if}
                </th>
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
