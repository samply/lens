import { writable } from "svelte/store";
import { queryStore } from "./query";
import type { QueryItem } from "../types/queryData";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";
import { lensOptions } from "./options";
import { responseStore } from "./response";
import { v4 as uuidv4 } from 'uuid';
import type { Collection } from "../types/collection";
import type { SendableQuery } from "../types/queryData";
import { authStore } from "./auth";

export const negotiateStore = writable<string[]>([]);

let authHeader: string = "";

authStore.subscribe((value) => {
    authHeader=value;
})


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


    if (queryLayer.children.length > 1) {
        humanReadableQuery += '('
    }

    queryLayer.children.forEach((child: AstElement, index: number): void => {

        if ('type' in child && 'value' in child && 'key' in child) {
            if (typeof child.value === 'string') {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value})`
            }
            if (typeof child.value === 'object' && 'min' in child.value && 'max' in child.value) {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value.min} and ${child.value.max})`
            }
        }

        humanReadableQuery = buildHumanReadableRecursively(child, humanReadableQuery)

        if (index === queryLayer.children.length - 1) {
        }
        if (index < queryLayer.children.length - 1) {
            humanReadableQuery += ` ${queryLayer.operand} `
        }

    })

    if (queryLayer.children.length > 1) {
        humanReadableQuery += ')'
    }

    return humanReadableQuery
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
 * sets all options needed for the negotiator
*/

let negotiateOptions: any = {}
const siteCollectionMap: Map<string,string> = new Map()

lensOptions.subscribe((options: any) => {
    if (!options) return

    negotiateOptions = options.negotiateOptions
    options.negotiateOptions.siteMapping.forEach(({ site, collection }) => {
        siteCollectionMap.set(site, collection)
    })
})


/**
 * @param sitesToNegotiate the sites to negotiate with
 * @returns an array of Collection objects
*/
export const getCollections = (sitesToNegotiate: string[]): Collection[] => {

    let siteCollections: Collection[] = []

    sitesToNegotiate.forEach((site: string) => {
        let collectionId: string = "couldn't map site in search UI"

        // TODO: Why is site id mapped to Uppercase?
        if (siteCollectionMap.has(site) && siteCollectionMap.get(site) !== '') {
            collectionId = siteCollectionMap[site]
        }

        const siteId: string = site.split(':collection:')[0]

        /**
         * Create Collection object with stratifier coming from response store 
         * 
         * seems to need only stratifier 'custodian', why?
         */

        // if (custodianStartifier != undefined) {
        //     siteCollections = siteCollections.concat(
        //       custodianStartifier.stratum
        //         .filter(stratum => {
        //           return stratum.key != null && stratum.key.indexOf(siteId) > -1
        //         })
        //         .map(stratum => {
        //           return new Collection(
        //             siteId,
        //             site,
        //             stratum.key,
        //             localRedirectUri
        //           )
        //         })
        //     )

        siteCollections.push({
            siteId,
            site,
            collectionId,
            /**
             * TODO: add the local redirect uri here
             */
            localRedirectUri: 'some uri'
        })
    })

    return siteCollections
}


/**
 * builds a sendable query object from the current query
 * sends query to negotiator
 * redirects to negotiator
 * @param sitesToNegotiate the sites to negotiate with
*/
export const negotiate = async (sitesToNegotiate: string[], queryBase64String: string) => {

    let sendableQuery: SendableQuery
    queryStore.subscribe((value: QueryItem[][]) => {
        const uuid = uuidv4()
        sendableQuery = {
            query: value,
            id: `${uuid}__search__${uuid}`
        }
    })

    let humanReadable: string = getHumanReadableQuery();
    let collections: Collection[] = getCollections(sitesToNegotiate)
    // TODO: Implement proper configuration option for the switch between negotiator and project manager
    let negotiatorResponse = (false)
        ? await sendRequestToNegotiator(sendableQuery, humanReadable, collections, queryBase64String)
        : await sendRequestToProjectManager(sendableQuery, humanReadable, collections, queryBase64String)
    window.location.href = negotiatorResponse.redirect_uri.toString()
}


/**
 * 
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @returns the redirect uri from the negotiator
 */
async function sendRequestToNegotiator(sendableQuery: SendableQuery, humanReadable: string, collections: Collection[], queryBase64String: string): Promise<any> {

    let base64Query: string = btoa(JSON.stringify(sendableQuery.query))

    const returnURL: string = `${window.location.protocol}//${window.location.host}/?nToken=${sendableQuery.id}&query=${base64Query}`;

    const response: Response = await fetch(
        `${negotiateOptions.negotiatorURL}?nToken=${sendableQuery.id}`, 
        {
            method: "POST",
            headers: {
                'Accept': 'application/json; charset=utf-8',
                "Content-Type": "application/json",
                'Authorization': 'Basic YmJtcmktZGlyZWN0b3J5Omw5RFJLVUROcTBTbDAySXhaUGQ2'

            },
            body: JSON.stringify({
                humanReadable: humanReadable,
                URL: returnURL,
                collections: collections,
                nToken: sendableQuery.id,
                query: queryBase64String
            }),
        }
    );
    return response.json();
}

/**
 *
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @returns the redirect uri from the negotiator
 * */
async function sendRequestToProjectManager(sendableQuery: SendableQuery, humanReadable: string, collections: Collection[], queryBase64String: string): Promise<any> {


    let base64Query: string = btoa(JSON.stringify(sendableQuery.query))

    const returnURL: string = `${window.location.protocol}//${window.location.host}/?query=${base64Query}`;

    console.log(collections)
    // TODO: should use collectionId
    const negotiationPartners = collections.map(collection => collection.siteId.toLocaleLowerCase()).join(',')
    console.log(negotiationPartners)

    const response: Response = await fetch(
        `${negotiateOptions.negotiatorURL}?explorerIds=${negotiationPartners}&query-format=CQL_DATA&human-readable=${humanReadable}&explorer-url=${returnURL}`,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': authHeader
                // NOTE: Workaround then david can't solve the bearer token issue
                // 'Cookie': 'JSESSIONID=6C0A111CF969B92606A445E8A5E0FB7'
            },
            body: base64Query,
        }
    );
    return response.json();
}
