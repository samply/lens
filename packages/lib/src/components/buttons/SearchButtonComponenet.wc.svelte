<svelte:options customElement="lens-search-button" />

<script lang="ts">
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
    import { responseStore } from "../../stores/response";
    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;

    const getResultsFromBiobanks = async () => {
        buildAstFromQuery($queryStore);

        /**
         * TODO: replace with actual fetch call
         *
         * writes the response to the responseStore
         * response.text() with the try catch statenent prevents server responses like 500 to parse html to json
         */
        const response = await fetch(backendUrl).then((response) => {
            if (!response.ok) {
                throw new Error("Network error");
            }
            return response.text();
        });

        try {
            // $responseStore = JSON.parse(response);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * ast zusammenbauen
     * daten an cql converter
     * cql converter vom projekt injecten
     * cql über request target an beam oder blaze
     *
     *
     */
</script>

<button
    part={`lens-search-button lens-search-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={getResultsFromBiobanks}
    {disabled}
>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>
