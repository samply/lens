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
    import { parser } from "@exodus/schemasafe";

    export let options: object = {};
    export let catalogueData: Criteria[] = [];

    /**
     * Validate the options against the schema
     */
    const parse = parser(optionsSchema, { includeErrors: true });
    $: {
        const validJSON = parse(JSON.stringify(options));
        if (options !== {} && options !== "" && validJSON.errors) {
            console.error("Lens-Options: ", validJSON.errors);
        }
    }

    $: $lensOptions = options;
    $: $catalogue = catalogueData;
</script>
