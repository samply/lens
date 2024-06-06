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
    import optionsSchema from "../types/options.schema.json";
    import catalogueSchema from "../types/catalogue.schema.json";
    import { parser } from "@exodus/schemasafe";
    import type { LensOptions } from "../types/options";
    import { uiSiteMappingsStore } from "../stores/mappings";

    export let options: LensOptions = {};
    export let catalogueData: Criteria[] = [];
    export let measures: MeasureStore = {} as MeasureStore;

    /**
     * Validate the options against the schema before passing them to the store
     */
    $: {
        const parse = parser(optionsSchema, {
            includeErrors: true,
            allErrors: true,
        });
        const validJSON = parse(JSON.stringify(options));
        if (validJSON.valid === true) {
            $lensOptions = options;
        } else if (typeof options === "object") {
            console.error(
                "Lens-Options are not conform with the JSON schema",
                validJSON.errors,
            );
        }
    }

    $: {
        const parse = parser(catalogueSchema, {
            includeErrors: true,
            allErrors: true,
        });
        const validJSON = parse(JSON.stringify(catalogueData));
        if (validJSON.valid === true) {
            $catalogue = catalogueData;
        } else if (typeof catalogueData === "object") {
            console.error(
                "Catalogue is not conform with the JSON schema",
                validJSON.errors,
            );
        }
    }
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
                        "deleteUrl" in options.iconOptions &&
                        typeof options.iconOptions["deleteUrl"] === "string"
                    ) {
                        store.set("deleteUrl", options.iconOptions.deleteUrl);
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
