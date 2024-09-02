import { writable } from "svelte/store";
import { queryStore } from "./query";
import type { QueryItem } from "../types/queryData";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";
import { lensOptions } from "./options";
import { v4 as uuidv4 } from "uuid";
import type { Collection } from "../types/collection";
import type { SendableQuery } from "../types/queryData";
import { translateAstToCql } from "../cql-translator-service/ast-to-cql-translator";
import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import type { MeasureStore } from "../types/backend";
import { measureStore } from "./measures";
import type { LensOptions } from "../types/options";

export const negotiateStore = writable<string[]>([]);

let currentQuery: QueryItem[][] = [[]];

let currentMeasures: MeasureStore = [];

queryStore.subscribe((query) => {
    currentQuery = query;
});

measureStore.subscribe((measures) => {
    currentMeasures = measures;
});

/**
 * Recursively builds a human readable query string from the AST
 * @param queryLayer the current layer of the query
 * @param humanReadableQuery string to append to
 * @returns a human readable query string
 */
export const buildHumanReadableRecursively = (
    queryLayer: AstElement,
    humanReadableQuery: string,
): string => {
    if (
        queryLayer === null ||
        !("children" in queryLayer) ||
        ("children" in queryLayer &&
            (queryLayer.children === null ||
                queryLayer.children.length === 0 ||
                queryLayer.children[0] === null))
    ) {
        return humanReadableQuery;
    }

    if (queryLayer.children.length > 1) {
        humanReadableQuery += "(";
    }

    queryLayer.children.forEach((child: AstElement, index: number): void => {
        if ("type" in child && "value" in child && "key" in child) {
            if (typeof child.value === "string") {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value})`;
            }
            if (
                typeof child.value === "object" &&
                "min" in child.value &&
                "max" in child.value
            ) {
                humanReadableQuery += `(${child.key} ${child.type} ${child.value.min} and ${child.value.max})`;
            }
        }

        humanReadableQuery = buildHumanReadableRecursively(
            child,
            humanReadableQuery,
        );

        if (index === queryLayer.children.length - 1) {
        }
        if (index < queryLayer.children.length - 1) {
            humanReadableQuery += ` ${queryLayer.operand} `;
        }
    });

    if (queryLayer.children.length > 1) {
        humanReadableQuery += ")";
    }

    return humanReadableQuery;
};

/**
 * @returns a human readable query string built from the current query
 */
export const getHumanReadableQuery = (): string => {
    let humanReadableQuery: string = "";

    queryStore.subscribe((value: QueryItem[][]) => {
        const query: AstTopLayer = buildAstFromQuery(value);
        humanReadableQuery = buildHumanReadableRecursively(
            query,
            humanReadableQuery,
        );
    });

    return humanReadableQuery;
};

/**
 * sets all options needed for the negotiator
 */
type NegotiateOptions = {
    siteMapping: { site: string; collection: string }[];
    negotiatorURL: string;
    newProjectUrl: string;
    editProjectUrl: string;
};

let negotiateOptions: NegotiateOptions;
const siteCollectionMap: Map<string, string> = new Map();
const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
const collectionParams: string | null = urlParams.get("collections");

lensOptions.subscribe((options: LensOptions) => {
    if (!options) return;

    negotiateOptions = options.negotiateOptions as NegotiateOptions;
    negotiateOptions?.siteMapping?.forEach(
        ({ site, collection }: { site: string; collection: string }) => {
            siteCollectionMap.set(site, collection);
            if (
                collectionParams !== null &&
                collectionParams.split(",").includes(collection)
            ) {
                negotiateStore.update((value) => {
                    return [...value, site];
                });
            }
        },
    );
});

/**
 * @param sitesToNegotiate the sites to negotiate with
 * @returns an array of Collection objects
 */
export const getCollections = (sitesToNegotiate: string[]): Collection[] => {
    const siteCollections: Collection[] = [];

    sitesToNegotiate.forEach((site: string) => {
        let collectionId: string = "";

        // TODO: Why is site id mapped to Uppercase?
        if (siteCollectionMap.has(site) && siteCollectionMap.get(site) !== "") {
            collectionId = siteCollectionMap.get(site) || "";
        }

        const siteId: string = site.split(":collection:")[0];

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

        if (collectionId !== "") {
            siteCollections.push({
                siteId,
                site,
                collectionId,
                /**
                 * TODO: add the local redirect uri here
                 */
                localRedirectUri: "some uri",
            });
        }
    });

    return siteCollections;
};

/**
 * builds a sendable query object from the current query
 * sends query to negotiator
 * redirects to negotiator
 * @param sitesToNegotiate the sites to negotiate with
 */
export const negotiate = async (sitesToNegotiate: string[]): Promise<void> => {
    //TODO: get auth token here
    console.log("enter negotiate");
    let sendableQuery!: SendableQuery;
    queryStore.subscribe((value: QueryItem[][]) => {
        const uuid = uuidv4();
        sendableQuery = {
            query: value,
            id: `${uuid}__search__${uuid}`,
        };
    });

    const queryBase64String: string = btoa(JSON.stringify(sendableQuery.query));
    const humanReadable: string = getHumanReadableQuery();
    const collections: Collection[] = getCollections(sitesToNegotiate);
    // TODO: Implement proper configuration option for the switch between negotiator and project manager
    const negotiatorResponse = false
        ? await sendRequestToNegotiator(
              sendableQuery,
              humanReadable,
              collections,
              queryBase64String,
          )
        : await sendRequestToProjectManager(
              sendableQuery,
              humanReadable,
              collections,
              queryBase64String,
          );

    const indexOfQuestionMark: number = negotiatorResponse.redirect_uri
        .toString()
        .indexOf("?");

    if (!negotiatorResponse.redirect_uri) {
        console.error("Negotiator response does not contain redirect uri");
        return;
    }

    const subpage = "/project-view";
    const negotiationURI =
        negotiatorResponse.redirect_uri
            .toString()
            .slice(0, indexOfQuestionMark) +
        `${subpage}` +
        negotiatorResponse.redirect_uri.toString().slice(indexOfQuestionMark);

    window.location.href = negotiationURI;
};

/**
 *
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @param queryBase64String the query in base64 string format
 * @returns the redirect uri from the negotiator
 */
async function sendRequestToNegotiator(
    sendableQuery: SendableQuery,
    humanReadable: string,
    collections: Collection[],
    queryBase64String: string,
): Promise<Response & { redirect_uri: string }> {
    const base64Query: string = btoa(JSON.stringify(sendableQuery.query));

    const returnURL: string = `${window.location.protocol}//${window.location.host}/?nToken=${sendableQuery.id}&query=${base64Query}`;

    const response: Response & { redirect_uri: string } = (await fetch(
        `${negotiateOptions.negotiatorURL}?nToken=${sendableQuery.id}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json",
                Authorization:
                    "Basic YmJtcmktZGlyZWN0b3J5Omw5RFJLVUROcTBTbDAySXhaUGQ2",
            },
            body: JSON.stringify({
                humanReadable: humanReadable,
                URL: returnURL,
                collections: collections,
                nToken: sendableQuery.id,
                query: queryBase64String,
            }),
        },
    )) as Response & { redirect_uri: string };
    return response;
}

/**
 *
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @param queryBase64String the query in base64 string format
 * @returns a promise containing the response from the project manager. The response contains the redirect uri
 */
async function sendRequestToProjectManager(
    sendableQuery: SendableQuery,
    humanReadable: string,
    collections: Collection[],
    queryBase64String: string,
): Promise<Response & { redirect_uri: string }> {
    /**
     * get temporary token from oauth2
     */
    let temporaryToken: string | null = "";

    try {
        const res = await fetch(`/oauth2/auth`, {
            method: "GET",
            credentials: "include",
        });

        temporaryToken = res.headers.get("Authorization");
    } catch (error) {
        console.log("error", error);
        return new Response() as Response & { redirect_uri: string };
    }

    /**
     * build query params
     */
    const queryParam: string =
        queryBase64String != "" ? `&query=${queryBase64String}` : "";

    const negotiationPartners = collections
        .map((collection) => collection.collectionId.toLocaleLowerCase())
        .join(",");
    const returnURL: string = `${window.location.protocol}//${window.location.host}/?collections=${negotiationPartners}${queryParam}`;
    const urlParams: URLSearchParams = new URLSearchParams(
        window.location.search,
    );
    const projectCode: string | null = urlParams.get("project-code");
    const projectCodeParam: string = projectCode
        ? `&project-code=${projectCode}`
        : "";
    const negotiateUrl = projectCode
        ? negotiateOptions.editProjectUrl
        : negotiateOptions.newProjectUrl;

    let response!: Response & { redirect_uri: string };

    /**
     * send request to project manager
     */
    try {
        response = await fetch(
            `${negotiateUrl}?explorer-ids=${negotiationPartners}&query-format=CQL_DATA&human-readable=${humanReadable}&explorer-url=${encodeURIComponent(returnURL)}${projectCodeParam}`,
            {
                method: "POST",
                headers: {
                    returnAccept: "application/json; charset=utf-8",
                    "Content-Type": "application/json",
                    Authorization: temporaryToken ? temporaryToken : "",
                },
                body: getCql(),
            },
        ).then((response) => response.json());

        /**
         * replace query-code with project-code
         * TODO: remove when backend bug is fixed
         */
        if (response?.redirect_uri) {
            response.redirect_uri = response.redirect_uri.replace(
                "query-code",
                "project-code",
            );
        }

        return response;
    } catch (error) {
        console.log("error", error);
        return new Response() as Response & { redirect_uri: string };
    }
}

/**
 * @returns a base64 encoded CQL query
 */
function getCql(): string {
    // NOTE: $ only works within svelte components
    const ast = buildAstFromQuery(currentQuery);
    const cql = translateAstToCql(ast, false, backendMeasures);

    const library = buildLibrary(`${cql}`);
    const measure = buildMeasure(
        library.url,
        currentMeasures.map((measureItem) => measureItem.measure),
    );
    const query = { lang: "cql", lib: library, measure: measure };

    return btoa(decodeURI(JSON.stringify(query)));
}
