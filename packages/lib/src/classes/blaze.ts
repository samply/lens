import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import type { Site, SiteData } from "../types/response";
import type { Measure, ResponseStore } from "../types/backend";
import { errorChannel } from "../stores/error-channel";

export class Blaze {
    constructor(
        private url: URL,
        private name: string,
        private updateResponse: (response: ResponseStore) => void,
        private auth: string = "",
    ) {}

    /**
     * sends the query to beam and updates the store with the results
     * @param cql the query as cql string
     * @param controller the abort controller to cancel the request
     * @param measureDefinitions the measure definitions to send to blaze
     */
    async send(
        cql: string,
        controller: AbortController,
        measureDefinitions: Measure[],
    ): Promise<void> {
        try {
            let response: ResponseStore = new Map<string, Site>().set(
                this.name,
                { status: "claimed", data: {} as SiteData },
            );

            this.updateResponse(response);

            const libraryResponse = await fetch(
                new URL(`${this.url}/Library`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(buildLibrary(cql)),
                    signal: controller?.signal,
                },
            );
            if (!libraryResponse.ok) {
                this.handleError(
                    `Couldn't create Library in Blaze`,
                    libraryResponse,
                );
            }
            const library = await libraryResponse.json();
            const measureResponse = await fetch(
                new URL(`${this.url}/Measure`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        buildMeasure(library.url, measureDefinitions),
                    ),
                    signal: controller.signal,
                },
            );
            if (!measureResponse.ok) {
                this.handleError(
                    `Couldn't create Measure in Blaze`,
                    measureResponse,
                );
            }
            const measure = await measureResponse.json();
            const dataResponse = await fetch(
                new URL(
                    `${this.url}/Measure/$evaluate-measure?measure=${measure.url}&periodStart=2000&periodEnd=2030`,
                ),
                {
                    signal: controller.signal,
                },
            );
            if (!dataResponse.ok) {
                this.handleError(
                    `Couldn't evaluate Measure in Blaze`,
                    dataResponse,
                );
            }
            const blazeResponse: SiteData = await dataResponse.json();

            response = new Map<string, Site>().set(this.name, {
                status: "succeeded",
                data: blazeResponse,
            });

            this.updateResponse(response);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                console.log(`Aborting former blaze request.`);
            } else {
                console.error(err);
                errorChannel.set("Fehler beim Bearbeiten der Anfrage"); // show user-facing error
            }
        }
    }

    async handleError(message: string, response: Response): Promise<void> {
        const errorMessage = await response.text();
        console.debug(
            `${message}. Received error ${response.status} with message ${errorMessage}`,
        );

        const failedResponse: ResponseStore = new Map<string, Site>().set(
            this.name,
            { status: "permfailed" },
        );
        this.updateResponse(failedResponse);
    }
}
