import { writable } from "svelte/store";
import { queryStore } from "./query";
import type { QueryItem } from "../types/queryData";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";

export const negotiateStore = writable<string[]>([]);

export const negotiate = async (sitesToNegotiate: string[]): Promise<void> => {

    let humanReadable = getHumanReadableQuery();
    
    /**
     * TODO: implement negotiator connection
    */

}

/**
 * @returns a human readable query string built from the current query
 */
export const getHumanReadableQuery = (): string => {

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
            humanReadableQuery += ` ${queryLayer.operand} `
        }

    })

    if(queryLayer.children.length > 1){
        humanReadableQuery += ')'
    }

    return humanReadableQuery
}

const siteToDefaultCollectionId: Map<string, string> = new Map<string, string>()
    .set("dresden", "bbmri-eric:ID:DE_BBD:collection:DILB")
    .set("frankfurt", "bbmri-eric:ID:DE_iBDF:collection:UCT")
    .set("berlin", "bbmri-eric:ID:DE_ZeBanC:collection:Onoloy")
    .set("wuerzburg", "bbmri-eric:ID:DE_ibdw:collection:bc")
    .set("brno", "bbmri-eric:ID:CZ_MMCI:collection:LTS")
    .set("aachen", "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC")
    .set("leipzig", "bbmri-eric:ID:DE_LMB:collection:LIFE_ADULT")
    .set("muenchen-hmgu", "bbmri-eric:ID:DE_Helmholtz-MuenchenBiobank:collection:DE_KORA")
    .set("Pilsen", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma")
    .set("regensburg", "bbmri-eric:ID:DE_ZBR:collection:Tissue")
    .set("heidelberg", "bbmri-eric:ID:DE_BMBH:collection:Lungenbiobank")
    .set("luebeck", "bbmri-eric:ID:DE_ICBL:collection:ICBL")
    .set("augsburg", "bbmri-eric:ID:DE_ACBB:collection:TISSUE")
    .set("mannheim", "bbmri-eric:ID:DE_BioPsy:collection:Main_collecion")
    .set("marburg", "bbmri-eric:ID:DE_CBBMR:collection:main")
    .set("goettingen", "bbmri-eric:ID:DE_UMGB:collection:UMG-startegy")
    .set("hannover", "bbmri-eric:ID:DE_HUB:collection:ProBase")
    .set("olomouc", "bbmri-eric:ID:CZ_UPOL_LF:collection:all_samples")
    .set("prague-ffm", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma")
    .set("prague-ior", "bbmri-eric:ID:CZ_CUNI_LF1:collection:all_samples")
