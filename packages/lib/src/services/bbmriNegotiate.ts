import { get } from "svelte/store";
import { lensOptions } from "../stores/options";
import { getHumanReadableQuery } from "../stores/datarequests";
import { errorChannel } from "../stores/error-channel";

/**
 * The request payload expected by the BBMRI Negotiator to start the application
 * process.
 */
type BbmriNegotiateRequest = {
    /** URL of the lens interface. The BBMRI Negotiator uses this to send the user back to lens. */
    url: string;
    /** A human readable description of the query used in lens */
    humanReadable: string;
    /** The resources that are requested */
    resources: BbmriCollectionResource[];
};

/**
 * Description of a resource as expected by the BBMRI Negotiator.
 */
type BbmriCollectionResource = {
    /** A unique Identifier of the Resource */
    id: string;
    /** Name of the Resource */
    name: string;
    /** Organization managing the resource */
    organization: {
        /** Unique identifier of the organization */
        id: number;
        /** External identifier of the organization */
        externalId: string;
        /** Name of the organization */
        name: string;
    };
};

/**
 * Initiate the process of applying for access to samples or data (also known as
 * resources). Sends a request to the BBBMRI Negitiator describing the resources
 * of interest. The user is then redirected to the BBMRI Negitator to submit the
 * application.
 * @param sitesToNegotiate The names of the sites with resources of interest.
 * These are looked up in the "siteMappings" array of the "negotiateOptions"
 * object in the lens options.
 */
export async function bbmriNegotiate(
    sitesToNegotiate: string[],
): Promise<void> {
    const currentLensOptions = get(lensOptions);
    if (currentLensOptions?.negotiateOptions === undefined) {
        console.error('"negotiateOptions" is missing the lens options');
        errorChannel.set('"negotiateOptions" fehlt in den Lens-Optionen');
        return;
    }

    const bbmriCollectionResources: BbmriCollectionResource[] = [];
    for (const site of sitesToNegotiate) {
        const siteMapping =
            currentLensOptions.negotiateOptions.siteMappings.find(
                (siteMapping) => siteMapping.site === site,
            );
        if (siteMapping === undefined) {
            console.error(
                `Site "${site}" is missing from negotiateOptions.siteMappings in the lens options`,
            );
        } else {
            bbmriCollectionResources.push({
                id: siteMapping.collection,
                name: siteMapping.collection,
                organization: {
                    id: 0,
                    externalId: siteMapping.site_id,
                    name: siteMapping.site,
                },
            });
        }
    }

    const bbmriNegotiatorRequest: BbmriNegotiateRequest = {
        humanReadable: getHumanReadableQuery(),
        url: `${window.location.protocol}//${window.location.host}`,
        resources: bbmriCollectionResources,
    };

    await sendRequestToNegotiator(
        currentLensOptions.negotiateOptions.url,
        currentLensOptions.negotiateOptions.authorizationHeader,
        bbmriNegotiatorRequest,
    );
}

/**
 * Sends the request to the BBMRI Negotiator to start the application process.
 * In case of success the user is redirected to the BBMRI Negotiator to continue
 * the application process. In case of a network error or if the BBMRI
 * Negotiator responds with an unexpected HTTP status code an error is shown to
 * the user.
 * @param url The request endpoint for starting the application process
 * @param authorizationHeader The value of the Authorization header
 * @param bbmriNegotiateRequest The request payload
 */
async function sendRequestToNegotiator(
    url: string,
    authorizationHeader: string,
    bbmriNegotiateRequest: BbmriNegotiateRequest,
): Promise<void> {
    let response;
    try {
        // Swagger documentation: https://negotiator.bbmri-eric.eu/api/swagger-ui/index.html#/Requests/add
        response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json",
                Authorization: authorizationHeader,
            },
            body: JSON.stringify(bbmriNegotiateRequest),
        });
    } catch (error) {
        console.error(error);
        errorChannel.set("Fehler beim Anfragen der Daten und Proben");
        return;
    }

    if (response.status === 201) {
        const data = await response.json();
        // Redirect the user
        window.location.href = data.redirectUrl;
    } else {
        console.error(
            `Expected HTTP status 201 from BBMRI Negotiator but got ${response.status} with response body: ${await response.text()}`,
        );
        errorChannel.set("Fehler beim Anfragen der Daten und Proben");
    }
}
