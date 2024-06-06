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
    import { iconStore } from "../stores/icons";
    import type { MeasureStore } from "../types/backend";
    import type { Criteria } from "../types/treeData";
    import type { LensOptions } from "../types/options";
    import { uiSiteMappingsStore } from "../stores/mappings";

    export let options: LensOptions = {};
    export let catalogueData: Criteria[] = [];
    export let measures: MeasureStore = {} as MeasureStore;

    /**
     * updates the icon store with the options passed in
     * @param options the Lens options
     */
    const updateIconStore = (options: LensOptions): void => {
        iconStore.update((store) => {
            if (typeof options === "object" && "iconOptions" in options) {
                if (
                    typeof options.iconOptions === "object" &&
                    options.iconOptions
                ) {
                    if (
                        "infoUrl" in options.iconOptions &&
                        typeof options.iconOptions["infoUrl"] === "string"
                    ) {
                        store.set("infoUrl", options.iconOptions.infoUrl);
                    }
                    if (
                        "selectAll" in options.iconOptions &&
                        typeof options.iconOptions["selectAll"] === "object" &&
                        options.iconOptions.selectAll
                    ) {
                        // Allow for future possibility of iconUrl instead of text
                        if (
                            "text" in options.iconOptions.selectAll &&
                            typeof options.iconOptions.selectAll["text"] ===
                                "string"
                        )
                            store.set(
                                "selectAllText",
                                options.iconOptions.selectAll.text,
                            );
                    }
                }
            }

            return store;
        });
    };

    /**
     * watches the backendConfig for changes to populate the uiSiteMappingsStore with a map
     * web components' props are json, meaning that Maps are not supported
     * therefore it's a 2d array of strings which is converted to a map
     */
    $: uiSiteMappingsStore.update((mappings) => {
        if (!options?.siteMappings) return mappings;
        console.log("options", options);
        console.log(Object.entries(options?.siteMappings));
        Object.entries(options?.siteMappings)?.forEach((site) => {
            mappings.set(site[0], site[1]);
        });

        return mappings;
    });

    $: $lensOptions = options;
    $: updateIconStore(options);
    $: $catalogue = catalogueData;
    $: $measureStore = measures;
</script>
