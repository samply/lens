import { lensOptions } from "../stores/options";
import type {
    LensOptions,
    NegotiatorOptions,
    NegotiateOptionsSiteMapping,
} from "../types/options";
import { getHumanReadableQuery } from "../stores/datarequests";
import { errorChannel } from "../stores/error-channel";

type NegotiatorResponse = Response & {
    url?: string;
    redirect_uri?: string;
    id?: string;
    status: number;
};

let negotiateOptions: NegotiatorOptions;
const siteCollectionMap: Map<string, NegotiateOptionsSiteMapping> = new Map();

lensOptions.subscribe((options: LensOptions) => {
    if (!options) return;

    /**
     * TODO: implement multiple collections per site
     * need to know how multiple collections are returned from the backend
     */

    negotiateOptions = options.negotiateOptions as NegotiatorOptions;
    negotiateOptions?.siteMappings?.forEach((site) => {
        siteCollectionMap.set(site.site, site);
    });
});

/**
 * @param sitesToNegotiate the sites to negotiate with
 * @returns an array of Collection objects
 */
export const getCollections = (
    sitesToNegotiate: string[],
): NegotiateOptionsSiteMapping[] => {
    const siteCollections: NegotiateOptionsSiteMapping[] = [];

    sitesToNegotiate.forEach((site: string) => {
        // TODO: Why is site id mapped to Uppercase?
        if (siteCollectionMap.has(site) && siteCollectionMap.get(site) !== "") {
            siteCollections.push(siteCollectionMap.get(site));
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
export const bbmrinegotiate = async (
    sitesToNegotiate: string[],
): Promise<void> => {
    const humanReadable: string = getHumanReadableQuery();
    const collections: NegotiateOptionsSiteMapping[] =
        getCollections(sitesToNegotiate);
    const negotiatorResponse = await sendRequestToNegotiator(
        humanReadable,
        collections,
    );

    switch (negotiatorResponse.status) {
        case 201: {
            if (!negotiatorResponse.url) {
                console.error(
                    "Negotiator response does not contain redirect uri",
                );
                errorChannel.set("Die Antwort vom Negotiator ist fehlerhaft"); // show user-facing error
                return;
            } else {
                const data = await negotiatorResponse.json();
                window.location.href = data.redirectUrl;
            }
            break;
        }
        case 401: {
            alert(
                "An unexpected error has occurred. Please contact support if the issue persists.",
            );
            break;
        }
        case 400:
        case 500: {
            alert(
                "The service is temporarily unavailable. Please try again in a few minutes.",
            );
            break;
        }
    }
};

interface BbmriCollectionResource {
    id: string;
    name: string;
    organization: {
        id: number;
        externalId: string;
        name: string;
    };
}

/**
 *
 * @param humanReadable a human readable query string to view in the negotiator project
 * @param collections the collections to negotiate with
 * @returns the redirect uri from the negotiator
 */
async function sendRequestToNegotiator(
    humanReadable: string,
    collections: NegotiateOptionsSiteMapping[],
): Promise<NegotiatorResponse> {
    /**
     * handle redirect to negotiator url
     */
    const returnURL: string = `${window.location.protocol}//${window.location.host}`;

    let response!: Response;

    const BBMRI_collection_resource: BbmriCollectionResource[] = [];

    collections.forEach(function (collection) {
        BBMRI_collection_resource.push({
            id: collection.collection,
            name: collection.collection,
            organization: {
                id: 0,
                externalId: collection.site_id,
                name: collection.site,
            },
        });
    });

    try {
        response = await fetch(`${negotiateOptions.url}`, {
            method: "POST",
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json",
                Authorization:
                    "Basic YmJtcmktZGlyZWN0b3J5Omw5RFJLVUROcTBTbDAySXhaUGQ2",
            },
            body: JSON.stringify({
                humanReadable: humanReadable,
                url: returnURL,
                resources: BBMRI_collection_resource,
            }),
        });

        return response as NegotiatorResponse;
    } catch (error) {
        console.error(error);
        errorChannel.set("Fehler beim Bearbeiten der Anfrage"); // show user-facing error
        return new Response() as NegotiatorResponse;
    }
}
