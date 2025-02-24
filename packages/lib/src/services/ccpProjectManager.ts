// const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
// const collectionParams: string | null = urlParams.get("collections");

import { translateAstToCql } from "../cql-translator-service/ast-to-cql-translator";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import { getHumanReadableQuery } from "../stores/datarequests";
import { measureStore } from "../stores/measures";
import { lensOptions } from "../stores/options";
import { queryStore } from "../stores/query";
import type { MeasureStore } from "../types/backend";
import type {
    LensOptions,
    ProjectManagerOptions,
    ProjectManagerOptionsSiteMapping,
} from "../types/options";
import type { QueryItem, SendableQuery } from "../types/queryData";
import { v4 as uuidv4 } from "uuid";

type PmBody = {
    query: string;
    explorer_ids: string;
    query_format: string;
    explorer_url: string;
};

let negotiateOptions: ProjectManagerOptions;
const siteCollectionMap: Map<string, ProjectManagerOptionsSiteMapping> =
    new Map();

//const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
//const collectionParams: string | null = urlParams.get("collections");

let currentQuery: QueryItem[][] = [[]];

let currentMeasures: MeasureStore = [];

type ProjectManagerResponse = Response & {
    redirect_uri?: string;
};

queryStore.subscribe((query) => {
    currentQuery = query;
});

measureStore.subscribe((measures) => {
    currentMeasures = measures;
});

lensOptions.subscribe((options: LensOptions) => {
    /**
     * TODO: implement multiple collections per site
     * need to know how multiple collections are returned from the backend
     */

    negotiateOptions = options.projectmanagerOptions as ProjectManagerOptions;

    if (negotiateOptions != undefined) {
        negotiateOptions.siteMappings?.forEach(function (site) {
            siteCollectionMap.set(site.site, site);
        });
    }
});

export const negotiate = async (sitesToNegotiate: string[]): Promise<void> => {
    let sendableQuery!: SendableQuery;
    queryStore.subscribe((value: QueryItem[][]) => {
        const uuid = uuidv4();
        sendableQuery = {
            query: value,
            id: `${uuid}__search__${uuid}`,
        };
    });

    const humanReadable: string = getHumanReadableQuery();
    const collections: ProjectManagerOptionsSiteMapping[] =
        getCollections(sitesToNegotiate);

    const response: ProjectManagerResponse = await sendRequestToProjectManager(
        sendableQuery,
        humanReadable,
        collections,
    );

    if (!response.redirect_uri) {
        console.error("Projectmanager response does not contain redirect uri");
        return;
    }

    window.location.href = response.redirect_uri;
};

/**
 * handle redirect to project manager url
 */
//     // project manager

/**
 *
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @returns a promise containing the response from the project manager. The response contains the redirect uri
 */
async function sendRequestToProjectManager(
    sendableQuery: SendableQuery,
    humanReadable: string,
    collections: ProjectManagerOptionsSiteMapping[],
): Promise<ProjectManagerResponse> {
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
    // const queryParam: string =
    //     queryBase64String != "" ? `&query=${queryBase64String}` : "";

    const negotiationPartners = collections
        .map((collection) => collection.collection.toLocaleLowerCase())
        .join(",");
    const returnURL: string = `${window.location.protocol}//${window.location.host}/?collections=${negotiationPartners}`;
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

    let response!: ProjectManagerResponse;

    /**
     * send request to project manager
     * Explorer IDS = Options Struktur = lens-<standortname>
     */

    const pmRequestUrl = `${negotiateUrl}`;

    try {
        response = await fetch(pmRequestUrl, {
            method: "POST",
            headers: {
                returnAccept: "application/json; charset=utf-8",
                "Content-Type": "application/json",
                Authorization: temporaryToken ? temporaryToken : "",
            },
            body: buildPMBody(
                humanReadable,
                negotiationPartners,
                returnURL,
                projectCodeParam,
            ),
        }).then((response) => response.json());

        return response;
    } catch (error) {
        console.log("error", error);
        return new Response() as ProjectManagerResponse;
    }
}

/**
 * @param sitesToNegotiate the sites to negotiate with
 * @returns an array of Collection objects
 */
export const getCollections = (
    sitesToNegotiate: string[],
): ProjectManagerOptionsSiteMapping[] => {
    const siteCollections: ProjectManagerOptionsSiteMapping[] = [];

    sitesToNegotiate.forEach((site: string) => {
        const siteCollection = siteCollectionMap.get(site);
        if (siteCollection !== undefined) {
            siteCollections.push(siteCollection);
        }
    });

    return siteCollections;
};

/**
 * @param humanReadable the human readable string of the query
 * @param negotiationPartners all the selected sites in a string with , seperated
 * @param returnURL the url to return to lens
 * @param projectCodeParam if the project already exists
 * @returns a base64 encoded CQL query
 */
function buildPMBody(
    humanReadable: string,
    negotiationPartners: string,
    returnURL: string,
    projectCodeParam: string,
): string {
    const ast = buildAstFromQuery(currentQuery);

    /**
     * TODO:
     * For now backenMeasures is hardcoded because
     * this function only needed for dktk project manager so far.
     * Change if needed for negotiator.
     *
     * should be configurable via options other than spot/blaze, so custom backends can be used
     */

    const cql = translateAstToCql(
        ast,
        false,
        "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
        currentMeasures[0].measures,
    );

    const library = buildLibrary(`${cql}`);
    const measure = buildMeasure(
        library.url,
        currentMeasures[0].measures.map((measureItem) => measureItem.measure),
    );
    const query = { lang: "cql", lib: library, measure: measure };

    const body: PmBody = {
        query: btoa(decodeURI(JSON.stringify(query))),
        explorer_ids: negotiationPartners,
        query_format: "CQL_DATA",
        explorer_url:
            returnURL +
            projectCodeParam +
            "&query=" +
            btoa(JSON.stringify(ast)),
    };

    return JSON.stringify(body);
}
