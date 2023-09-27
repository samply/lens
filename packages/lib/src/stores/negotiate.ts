import { writable } from "svelte/store";
import type { Biobank } from "../types/biobanks";
import { responseStore } from "./response";
import { queryStore } from "./query";
import type { QueryItem } from "../types/queryData";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";

export const negotiateStore = writable<Biobank[]>([]);

export const negotiate = async (sitesToNegotiate: string[]): Promise<void> => {

    let humanReadable = getHumanReadableQuery();
    
    /**
     * TODO: implement negotiator connection
    */

}

/**
 * @returns a human readable query string built from the current query
 */
const getHumanReadableQuery = (): string => {

    let humanReadableQuery: string = "";
    let query: AstTopLayer

    queryStore.subscribe((value: QueryItem[][]) => {
        query = buildAstFromQuery(value)
    })

    humanReadableQuery = buildHumanReadableRecursively(query, humanReadableQuery)

    return humanReadableQuery
}


/**
 * Recursively builds a human readable query string from the AST
 * @param queryLayer the current layer of the query 
 * @param humanReadableQuery string to append to
 * @returns a human readable query string
 */
const buildHumanReadableRecursively = (queryLayer: AstElement, humanReadableQuery: string): string => {
    if (
        queryLayer === null || 
        !('children' in queryLayer) ||
        'children' in queryLayer && 
        (
            queryLayer.children === null || 
            queryLayer.children.length === 0 || 
            queryLayer.children[0] === null
        )
    ) {
        return humanReadableQuery
    }


    if(queryLayer.children.length > 1){
        humanReadableQuery += '('
    }

    queryLayer.children.forEach((child: AstElement, index: number): void => {
        
        if('type' in child && 'value' in child && 'key' in child){
            if( typeof child.value === 'string') {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value})`
            }
            if( typeof child.value === 'object' && 'min' in child.value && 'max' in child.value) {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value.min} and ${child.value.max})`
            }
        }
        
        humanReadableQuery = buildHumanReadableRecursively(child, humanReadableQuery)
        
        if(index === queryLayer.children.length - 1){
        }
        if(index < queryLayer.children.length - 1){
            humanReadableQuery += queryLayer.operand
        }

    })

    if(queryLayer.children.length > 1){
        humanReadableQuery += ')'
    }

    return humanReadableQuery
}