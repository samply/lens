<svelte:options
    customElement={{
        tag: "lens-options",
    }}
/>

<script lang="ts">
    /**
     * this component takes the catalogue and all options set from the project and passes them to the appropriate store
     * TODO: phase this component out in favor of the setOptions, setCatalogue and setMeasures APIs
     */

    import { setOptions } from "../stores/options";
    import { setCatalogue } from "../stores/catalogue";
    import { measureStore } from "../stores/measures";
    import type { MeasureStore } from "../types/backend";

    interface Props {
        optionsJSON?: string;
        catalogueJSON?: string;
        measures?: MeasureStore;
    }

    let {
        optionsJSON = "{}",
        catalogueJSON = "[]",
        measures = {} as MeasureStore,
    }: Props = $props();

    $effect(() => {
        setOptions(JSON.parse(optionsJSON));
    });

    $effect(() => {
        setCatalogue(JSON.parse(catalogueJSON));
    });
    $effect(() => {
        $measureStore = measures;
    });
</script>
