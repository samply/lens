<svelte:options
    customElement={{
        tag: "lens-options",
    }}
/>

<script lang="ts">
    /**
     * this component takes the catalogue and all options set from the project and passes them to the appropriate store
     * TODO: refactor all mappings and configurations to be passed in here
     */

    import { run } from "svelte/legacy";
    import { lensOptions } from "../stores/options";
    import { catalogue } from "../stores/catalogue";
    import { measureStore } from "../stores/measures";
    import { iconStore } from "../stores/icons";
    import type { MeasureStore } from "../types/backend";
    import type { Catalogue } from "../types/catalogue";
    import optionsSchema from "../types/options.schema.json";
    import catalogueSchema from "../types/catalogue.schema.json";
    import type { LensOptions } from "../types/options";
    import {
        catalogueKeyToResponseKeyMap,
        uiSiteMappingsStore,
    } from "../stores/mappings";
    import { showError } from "../stores/toasts";
    import Ajv from "ajv";
    import addFormats from "ajv-formats";

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

    // Transform the JSON strings to objects for validation and further processing
    let options: LensOptions = $state({} as LensOptions);
    let catalogueData: Catalogue = $state([]);
    run(() => {
        options = JSON.parse(optionsJSON);
    });
    run(() => {
        catalogueData = JSON.parse(catalogueJSON);
    });

    // Validate the options against the schema before passing them to the store
    $effect(() => {
        const ajv = new Ajv({
            allErrors: true,
        });
        addFormats(ajv);
        const valid = ajv.validate(optionsSchema, options);
        if (valid) {
            $lensOptions = options;
        } else {
            console.error(
                "The lens options are not conform with the JSON schema",
                ajv.errors,
            );
            showError(
                "Die Lens-Optionen sind nicht mit dem JSON-Schema konform",
            );
        }
    });

    $effect(() => {
        const ajv = new Ajv({
            allErrors: true,
        });
        addFormats(ajv);
        const valid = ajv.validate(catalogueSchema, catalogueData);
        if (valid) {
            $catalogue = catalogueData;
        } else {
            console.error(
                "The catalogue is not conform with the JSON schema",
                ajv.errors,
            );
            showError("Der Katalog ist nicht mit dem JSON-Schema konform");
        }
    });

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
    run(() => {
        uiSiteMappingsStore.update((mappings) => {
            if (!options?.siteMappings) return mappings;
            Object.entries(options?.siteMappings)?.forEach((site) => {
                mappings.set(site[0], site[1]);
            });

            return mappings;
        });
    });

    run(() => {
        catalogueKeyToResponseKeyMap.update((mappings) => {
            if (!options?.catalogueKeyToResponseKeyMap) return mappings;

            options.catalogueKeyToResponseKeyMap.forEach((mapping) => {
                mappings.set(mapping[0], mapping[1]);
            });
            return mappings;
        });
    });

    run(() => {
        updateIconStore(options);
    });
    run(() => {
        $measureStore = measures;
    });
</script>
