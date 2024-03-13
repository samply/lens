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
            console.error("Lens-Options: ", validJSON.errors);
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
            console.error("Lens-Options: ", validJSON.errors);
        }
    }
</script>
