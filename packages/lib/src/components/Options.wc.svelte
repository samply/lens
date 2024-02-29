<svelte:options
    customElement={{
        tag: "lens-options",
        props: {
            options: { type: "Object" },
            catalogueData: { type: "Object" },
        },
    }}
/>

<script lang="ts">
    /**
     * this component takes the catalogue and all options set from the project and passes them to the appropriate store
     * TODO: refactor all mappings and configurations to be passed in here
     */
    import { lensOptions } from "../stores/options";
    import { catalogue } from "../stores/catalogue";
    import { measureStore } from "../stores/measures";
    import type { Criteria } from "../types/treeData";
    import type { Measure } from "../types/backend";
    import type { LensOptions } from "../types/options";

    export let options: LensOptions = {};
    export let catalogueData: Criteria[] = [];
    export let measures: Measure[] = [];

    $: $lensOptions = options;
    $: $catalogue = catalogueData;
    $: $measureStore = measures;
</script>
