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
    import { setOptions } from "../stores/options";
    import { setCatalogue } from "../stores/catalogue";
    import { measureStore } from "../stores/measures";
    import { iconStore } from "../stores/icons";
    import type { MeasureStore } from "../types/backend";
    import type { LensOptions } from "../types/options";

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

    // Transform the JSON strings to objects for validation and further processing
    let options: LensOptions = $state({} as LensOptions);
    run(() => {
        options = JSON.parse(optionsJSON);
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

    run(() => {
        updateIconStore(options);
    });
    run(() => {
        $measureStore = measures;
    });
</script>
