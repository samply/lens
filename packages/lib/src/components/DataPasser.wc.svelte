<svelte:options
    customElement={{
        tag: "lens-data-passer",
    }}
/>
<!-- This component offers an api to pass and get data from the stores -->
<script lang="ts">
	import { catalogue } from "../stores/catalogue";
    import { responseStore } from "../stores/response";
	import { addStratifier, queryStore} from "../stores/query";
	import type { QueryItem } from "../types/queryData";
    import type { ResponseStore } from "../types/backend";
    import { buildAstFromQuery } from "../helpers/ast-transformer";

    /**
     * returns the query store to the library user
     * @returns the query store
     */
    export const getQuery = () : QueryItem[][] => {
        return $queryStore;
    }

    /**
     * lets the library user add a single stratifier to the query store
     * @param label the value of the stratifier (e.g. "C31")
     * @param catalogueGroupCode the code of the group where the stratifier is located (e.g. "diagnosis")
     * @param queryGroupIndex the index of the query group where the stratifier should be added
     */

    interface SetQueryParams {
        label: string;
        catalogueGroupCode: string;
        groupRange?: string;
        queryGroupIndex?: number;
    }

    export const setQuery = ({label, catalogueGroupCode, groupRange, queryGroupIndex}) : void => {
        addStratifier({label, catalogueGroupCode, catalogue: $catalogue, queryGroupIndex, groupRange});
    }

    
    /**
     * returns the response from the backend to the library user
     * @returns the response from the backend
    */
    export const getResponse = () : ResponseStore => {
        return $responseStore;
    }

    /**
     * returns the AST to the library user
     * @returns the AST
    */
    export const getAST = () : string => {
        return buildAstFromQuery($queryStore);
    }

</script>