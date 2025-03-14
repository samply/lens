<svelte:options
    customElement={{
        tag: "lens-data-passer",
    }}
/>

<!-- This component offers an api to pass and get data from the stores -->
<script lang="ts">
    import { get } from "svelte/store";
    import { catalogue, getCriteria } from "../stores/catalogue";
    import { responseStore, updateResponseStore } from "../stores/response";
    import {
        addStratifier,
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
    } from "../stores/query";
    import { buildAstFromQuery } from "../helpers/ast-transformer";
    import type { QueryItem } from "../types/queryData";
    import type { ResponseStore } from "../types/backend";
    import type { AstTopLayer } from "../types/ast";
    import type {
        AddStratifierToQueryAPIParams,
        RemoveItemFromQuyeryAPIParams,
        RemoveValueFromQueryAPIParams,
    } from "../types/dataPasser";
    import { buildQueryFromAst } from "../helpers/ast-transformer";
    import type { Category } from "../types/catalogue";

    /**
     * Getters
     */

    /**
     * returns the query store to the library user
     * @returns the query store
     */
    export const getQueryAPI = (): QueryItem[][] => {
        return $queryStore;
    };

    /**
     * returns the response from the backend to the library user
     * @returns the response from the backend
     */
    export const getResponseAPI = (): ResponseStore => {
        return $responseStore;
    };

    /**
     * returns the AST to the library user
     * @returns the AST
     */
    export const getAstAPI = (): AstTopLayer => {
        return buildAstFromQuery($queryStore);
    };

    /**
     * sets the response from the backend if any changes in status are detected
     * @param response the response from the backend
     */
    export const updateResponseStoreAPI = (response: ResponseStore): void => {
        updateResponseStore(response);
    };

    /**
     * returns the catalogue to the library user
     * @param category the category name (e.g. "diagnosis")
     * @returns array of strings containing the bottom level items' keys
     * @deprecated Marked for deletion in a future version. You may use getCatalogueAPI() and extract the criteria yourself.
     */
    export const getCriteriaAPI = (category: string): string[] => {
        return getCriteria(category);
    };

    /**
     * Get the catalogue
     * @returns The catalogue
     */
    export const getCatalogueAPI = (): Category[] => {
        return get(catalogue);
    };

    /**
     * Setters
     */

    /**
     * sets the query store
     * @param newQuery the new query store
     */
    export const setQueryStoreAPI = (newQuery: QueryItem[][]): void => {
        queryStore.set(newQuery);
    };

    /**
     * sets the query store using the ast representation of a query
     * @param ast the ast that should be imported
     */
    export const setQueryStoreFromAstAPI = (ast: AstTopLayer): void => {
        let query = buildQueryFromAst(ast);
        queryStore.set(query);
    };

    /**
     * lets the library user add a single stratifier to the query store
     * @param params the parameters for the function
     * @param params.label the value of the stratifier (e.g. "C31")
     * @param params.catalogueGroupCode the code of the group where the stratifier is located (e.g. "diagnosis")
     * @param params.groupRange of the numerical groups in charts
     * @param params.queryGroupIndex the index of the query group where the stratifier should be added
     * @param params.system the system used to describe the datafield in data model (e.g. a fhir system)
     */
    export const addStratifierToQueryAPI = ({
        label,
        catalogueGroupCode,
        groupRange,
        queryGroupIndex,
        system,
    }: AddStratifierToQueryAPIParams): void => {
        addStratifier({
            label,
            catalogueGroupCode,
            catalogue: $catalogue,
            queryGroupIndex,
            groupRange,
            system,
        });
    };

    /**
     * removes a query item from the query store
     * @param params the parameters for the function
     * @param params.queryObject the query object that should be removed
     * @param params.queryGroupIndex the index of the query group where the stratifier should be removed
     */
    export const removeItemFromQuyeryAPI = ({
        queryObject,
        queryGroupIndex = 0,
    }: RemoveItemFromQuyeryAPIParams): void => {
        removeItemFromQuery(queryObject, queryGroupIndex);
    };

    /**
     * removes the value of a query item from the query store
     * @param params the parameters for the function
     * @param params.queryItem the query item from which the value should be removed from
     * @param params.value the value that should be removed
     * @param params.queryGroupIndex the index of the query group where the value should be removed
     */

    export const removeValueFromQueryAPI = ({
        queryItem,
        value,
        queryGroupIndex = 0,
    }: RemoveValueFromQueryAPIParams): void => {
        const queryObject = {
            ...queryItem,
            values: [value],
        };
        removeValueFromQuery(queryObject, queryGroupIndex);
    };
</script>
