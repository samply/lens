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
    import { iconStore } from "../stores/icons";
    import type { Criteria } from "../types/treeData";
    import optionsSchema from "../interfaces/options.schema.json";
    import catalogueSchema from "../interfaces/catalogue.schema.json";
    import { parser } from "@exodus/schemasafe";
    import type { LensOptions } from "../types/options";

    export let options: LensOptions = {};
    export let catalogueData: Criteria[] = [];

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

    $: $lensOptions = options;
    $: updateIconStore(options);
    $: $catalogue = catalogueData;
</script>
