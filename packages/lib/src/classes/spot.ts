/**
 * TODO: document this class
 */

import type { Site, SiteData, Status, BeamResult } from "../types/response";
import type { ResponseStore } from "../types/backend";

export class Spot {
    private currentTask!: string;

    constructor(
        private url: URL,
        private sites: Array<string>,
    ) {}

    /**
     * sends the query to beam and updates the store with the results
     * @param query the query as base64 encoded string
     * @param updateResponse the function to update the response store
     * @param controller the abort controller to cancel the request
     */
    async send(
        query: string,
        updateResponse: (response: ResponseStore) => void,
        controller?: AbortController,
    ): Promise<void> {
        try {
            const beamTaskResponse = await fetch(
                `${this.url}tasks?sites=${this.sites.toString()}`,
                {
                    method: "POST",
                    credentials: import.meta.env.PROD ? "include" : "omit",
                    body: query,
                    signal: controller?.signal,
                },
            );
            if (!beamTaskResponse.ok) {
                const error = await beamTaskResponse.text();
                console.debug(
                    `Received ${beamTaskResponse.status} with message ${error}`,
                );
                throw new Error(`Unable to create new beam task.`);
            }
            this.currentTask = (await beamTaskResponse.json()).id;

            let responseCount: number = 0;

            do {
                const beamResponses: Response = await fetch(
                    `${this.url}tasks/${this.currentTask}?wait_count=${responseCount + 1}`,
                    {
                        credentials: import.meta.env.PROD ? "include" : "omit",
                        signal: controller?.signal,
                    },
                );

                if (!beamResponses.ok) {
                    const error: string = await beamResponses.text();
                    console.debug(
                        `Received ${beamResponses.status} with message ${error}`,
                    );
                    throw new Error(
                        `Error then retrieving responses from Beam. Abborting requests ...`,
                    );
                }

                const beamResponseData: Array<BeamResult> =
                    await beamResponses.json();

                const changes = new Map<string, Site>();
                beamResponseData.forEach((response: BeamResult) => {
                    if (response.task !== this.currentTask) return;
                    const site: string = response.from.split(".")[1];
                    const status: Status = response.status;
                    const body: SiteData =
                        status === "succeeded"
                            ? JSON.parse(atob(response.body))
                            : null;

                    changes.set(site, { status: status, data: body });
                });

                updateResponse(changes);

                responseCount = beamResponseData.length;
                const realResponseCount = beamResponseData.filter(
                    (response) => response.status !== "claimed",
                ).length;

                if (
                    (beamResponses.status !== 200 &&
                        beamResponses.status !== 206) ||
                    realResponseCount === this.sites.length
                ) {
                    break;
                }
            } while (true);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                console.log(`Aborting request ${this.currentTask}`);
            } else {
                console.error(err);
            }
        }
    }
}
