<svelte:options
    customElement={{
        tag: "lens-search-button",
    }}
/>

<script lang="ts">
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryModified, queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import { translateAstToCql } from "../../cql-translator-service/ast-to-cql-translator";
    import { buildLibrary, buildMeasure } from "../../helpers/cql-measure";
    import { Spot } from "../../classes/spot";
    import { Blaze } from "../../classes/blaze";
    import { responseStore, updateResponseStore } from "../../stores/response";
    import { lensOptions } from "../../stores/options";
    import { showErrorToast } from "../../stores/toasts";
    import type {
        Measure,
        MeasureItem,
        MeasureOption,
    } from "../../types/backend";
    import { isTopLayer, type AstTopLayer } from "../../types/ast";
    import type { QueryEvent } from "../../types/queryEvent";
    import { translate } from "../../helpers/translations";
    import type {
        BackendOptions,
        SpotOption,
        BlazeOption,
    } from "../../types/options";

    interface Props {
        title?: string;
        disabled?: boolean;
    }

    let { title = translate("search"), disabled = false }: Props = $props();

    let options = $derived($lensOptions?.backends as BackendOptions);

    let controller: AbortController = new AbortController();

    /**
     * Triggers a request to the backend.
     * Multiple spots and blazes can be configured in lens options.
     * Emits the ast and the updateResponseStore function to the project
     * for running the query on other backends as well.
     */
    const getResultsFromBackend = (): void => {
        if (controller) {
            controller.abort();
        }
        responseStore.set(new Map());

        controller = new AbortController();

        const ast: AstTopLayer = buildAstFromQuery($queryStore);

        // The root node of the AST is an OR node that has AND nodes as children - one for each search bar.
        // If one of the AND nodes has no children, means the corresponding search bar is empty.
        if (
            ast.children.some(
                (child) => isTopLayer(child) && child.children.length === 0,
            ) &&
            ast.children.some(
                (child) => isTopLayer(child) && child.children.length !== 0,
            )
        ) {
            console.error(
                "There is at least one empty and one non-empty search bar, aborting search",
            );
            showErrorToast(translate("search_bar_error"));
            return;
        }

        options?.spots?.forEach((spot: SpotOption) => {
            const name = spot.name;
            const measureItem: MeasureOption | undefined = $measureStore.find(
                (measureStoreItem: MeasureOption) =>
                    spot.name === measureStoreItem.name,
            );

            if (measureItem === undefined) {
                throw new Error(
                    `No measures found for backend ${name}. Please check the measures store.`,
                );
            }
            const measures: Measure[] = measureItem.measures.map(
                (measureItem: MeasureItem) => measureItem.measure,
            );

            const cql = translateAstToCql(
                ast,
                false,
                spot.backendMeasures,
                measureItem.measures,
            );

            const library = buildLibrary(`${cql}`);
            const measure = buildMeasure(library.url, measures);
            const query = { lang: "cql", lib: library, measure: measure };

            const backend = new Spot(new URL(spot.url), spot.sites);

            backend.send(
                btoa(decodeURI(JSON.stringify(query))),
                updateResponseStore,
                controller,
            );
        });

        options?.blazes?.forEach((blaze: BlazeOption) => {
            const {
                name,
                url,
                backendMeasures,
            }: { name: string; url: string; backendMeasures: string } = blaze;

            const measureItem: MeasureOption | undefined = $measureStore.find(
                (measureStoreItem: MeasureOption) =>
                    name === measureStoreItem.name,
            );

            if (measureItem === undefined) {
                throw new Error(
                    `No measures found for backend ${name}. Please check the measures store.`,
                );
            }

            const measures: Measure[] = measureItem.measures.map(
                (measureItem: MeasureItem) => measureItem.measure,
            );

            const cql = translateAstToCql(
                ast,
                false,
                backendMeasures,
                measureItem.measures,
            );

            const backend = new Blaze(new URL(url), name, updateResponseStore);

            backend.send(cql, controller, measures);
        });

        options?.customAstBackends?.forEach((customAstBackendUrl: string) => {
            customBackendCallWithAst(ast, customAstBackendUrl);
        });
        emitEvent(ast);

        queryModified.set(false);
    };

    /**
     * Sends the ast to a custom backend
     * @param ast the ast to be sent to the backend
     * @param url the url of the backend
     */
    const customBackendCallWithAst = (ast: AstTopLayer, url: string): void => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ast),
        })
            .then((response) => response.json())
            .then((data) => {
                updateResponseStore(data);
            })
            .catch((error) => {
                console.error("Error:", error);
                showErrorToast(translate("network_error"));
            });
    };

    /**
     * Emits the ast and the updateResponseStore function to the project
     * @param ast the ast to be emitted
     */
    const emitEvent = (ast: AstTopLayer): void => {
        const event: QueryEvent = new CustomEvent("emit-lens-query", {
            detail: {
                ast: ast,
                updateResponse: updateResponseStore,
                abortController: controller,
            },
        });
        window.dispatchEvent(event);
    };
</script>

<button part="lens-search-button" onclick={getResultsFromBackend} {disabled}>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>

<style>
    [part~="lens-search-button"] {
        color: var(--button-color);
        border: none;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xs) var(--gap-s);
        font-size: var(--font-size-m);
        cursor: pointer;
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        background-color: var(--blue);
    }
    [part~="lens-search-button"]:disabled {
        background-color: var(--gray);
    }
    [part~="lens-search-button"]:hover {
        background-color: var(--light-blue);
    }
    [part~="lens-search-button-magnifying-glass"] {
        transform: rotate(-45deg);
        font-size: var(--font-size-xl);
        line-height: 0;
    }
    [part~="lens-search-button-title"] {
        font-family: var(--font-family);
    }
</style>
