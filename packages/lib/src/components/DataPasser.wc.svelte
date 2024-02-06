<svelte:options
    customElement={{
        tag: "lens-data-passer",
    }}
/>
<!-- This component offers an api to pass and get data from the stores -->
<script lang="ts">
	import { catalogue } from "../stores/catalogue";
    import { responseStore } from "../stores/response";
	import { addStratifier, queryStore, removeItemFromQuery, removeValueFromQuery} from "../stores/query";
    import { buildAstFromQuery } from "../helpers/ast-transformer";
	import type { QueryItem, QueryValue } from "../types/queryData";
    import type { ResponseStore } from "../types/backend";
    import type { AstTopLayer } from "../types/ast";

    /**
     * returns the query store to the library user
     * @returns the query store
     */
    export const getQueryAPI = () : QueryItem[][] => {
        return $queryStore;
    }


    /**
     * lets the library user add a single stratifier to the query store
     * @param label the value of the stratifier (e.g. "C31")
     * @param catalogueGroupCode the code of the group where the stratifier is located (e.g. "diagnosis")
     * @param queryGroupIndex the index of the query group where the stratifier should be added
     */

    interface addStratifierToQueryAPIParams {
        label: string;
        catalogueGroupCode: string;
        groupRange?: string;
        queryGroupIndex?: number;
    }

    export const addStratifierToQueryAPI = ({label, catalogueGroupCode, groupRange, queryGroupIndex}: addStratifierToQueryAPIParams) : void => {
        addStratifier({label, catalogueGroupCode, catalogue: $catalogue, queryGroupIndex, groupRange});
    }


    /**
     * removes a query item from the query store
     * @param queryObject the query object that should be removed
     * @param queryGroupIndex the index of the query group where the stratifier should be removed
    */
    
    interface RemoveItemFromQueryAPIParams {
        queryObject: QueryItem;
        queryGroupIndex?: number;
    }

    export const removeItemFromQuyeryAPI = ({queryObject, queryGroupIndex = 0}: RemoveItemFromQueryAPIParams): void => {
        removeItemFromQuery(queryObject, queryGroupIndex);
    }
    
    
    /**
     * removes the value of a query item from the query store
     * @param queryItem the query item from which the value should be removed from
     * @param value the value that should be removed
    */

    interface RemoveValueFromQueryAPIParams {
        queryItem: QueryItem;
        value: QueryValue;
        queryGroupIndex?: number;
    }

    export const removeValueFromQueryAPI = ({ queryItem, value, queryGroupIndex = 0}: RemoveValueFromQueryAPIParams): void => {
        const queryObject = {
            ...queryItem,
            values: [value]
        }
        removeValueFromQuery(queryObject, queryGroupIndex);
    }
    

    /**
     * returns the response from the backend to the library user
     * @returns the response from the backend
    */
    export const getResponseAPI = () : ResponseStore => {
        return $responseStore;
    }


    /**
     * returns the AST to the library user
     * @returns the AST
    */
    export const getAstAPI = () : AstTopLayer => {
        return buildAstFromQuery($queryStore);
    }

</script>