<svelte:options customElement="lens-search-button" />

<script lang="ts">
    import { responseStore } from "../../stores/response";
    export let title: string = "Search";
    export let url: string = ''

    const getResultsFromBiobanks = async () => {
        /**
         * TODO: replace with actual fetch call
         * 
         * writes the response to the responseStore
         * response.text() with the try catch statenent prevents server responses like 500 to parse html to json
        */
        const response = await fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network error');
        }
        return response.text();
        })

        try {
           $responseStore = JSON.parse(response);
        } catch (error) {
           console.error(error);
        }

    };
</script>

<button part="lens-search-button" on:click={getResultsFromBiobanks}>
    {title}
</button>
