// const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
// const collectionParams: string | null = urlParams.get("collections");

import { get } from "svelte/store";
import { translateAstToCql } from "../cql-translator-service/ast-to-cql-translator";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import { getHumanReadableQuery } from "../stores/datarequests";
import { measureStore } from "../stores/measures";
import { lensOptions } from "../stores/options";
import { queryStore } from "../stores/query";
import type { MeasureStore } from "../types/backend";
import type {
    ProjectManagerOptions,
    ProjectManagerOptionsSiteMapping,
} from "../types/options";
import type { QueryItem, SendableQuery } from "../types/queryData";
import { v4 as uuidv4 } from "uuid";

import { errorChannel } from "../stores/error-channel";

type PmBody = {
    query: string;
    "explorer-ids": string;
    "query-format": string;
    "explorer-url": string;
};

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

export const negotiate = async (sitesToNegotiate: string[]): Promise<void> => {
    const currentProjectmanagerOptions =
        get(lensOptions)?.projectmanagerOptions;
    if (currentProjectmanagerOptions === undefined) {
        console.error('"projectmanagerOptions" is missing the lens options');
        errorChannel.set('"projectmanagerOptions" fehlt in den Lens-Optionen');
        return;
    }

    let sendableQuery!: SendableQuery;
    queryStore.subscribe((value: QueryItem[][]) => {
        const uuid = uuidv4();
        sendableQuery = {
            query: value,
            id: `${uuid}__search__${uuid}`,
        };
    });

    const humanReadable: string = getHumanReadableQuery();
    const collections: ProjectManagerOptionsSiteMapping[] = getCollections(
        currentProjectmanagerOptions,
        sitesToNegotiate,
    );

    const response: ProjectManagerResponse = await sendRequestToProjectManager(
        currentProjectmanagerOptions,
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
 * @param currentProjectmanagerOptions the current project manager options
 * @param sendableQuery the query to be sent to the negotiator
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @returns a promise containing the response from the project manager. The response contains the redirect uri
 */
async function sendRequestToProjectManager(
    currentProjectmanagerOptions: ProjectManagerOptions,
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
        ? currentProjectmanagerOptions.editProjectUrl
        : currentProjectmanagerOptions.newProjectUrl;

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
 * @param currentProjectmanagerOptions the current projectmanager options
 * @param sitesToNegotiate the sites to negotiate with
 * @returns an array of Collection objects
 */
export const getCollections = (
    currentProjectmanagerOptions: ProjectManagerOptions,
    sitesToNegotiate: string[],
): ProjectManagerOptionsSiteMapping[] => {
    const siteCollections: ProjectManagerOptionsSiteMapping[] = [];
    for (const site of sitesToNegotiate) {
        const siteCollection = currentProjectmanagerOptions.siteMappings.find(
            (siteMapping) => siteMapping.site === site,
        );
        if (siteCollection === undefined) {
            console.error(
                `Site "${site}" is missing from projectmanagerOptions.siteMappings in the lens options`,
            );
        } else {
            siteCollections.push(siteCollection);
        }
    }

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
     * The Translation is DKTK/CCP specific.
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
        query: btoa(JSON.stringify(query)),
        "explorer-ids": negotiationPartners,
        "query-format": "CQL_DATA",
        "explorer-url":
            returnURL +
            projectCodeParam +
            "&query=" +
            btoa(JSON.stringify(currentQuery)),
    };
    return JSON.stringify(body);
}
