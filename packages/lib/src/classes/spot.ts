/**
 * TODO: document this class
 */

import type { SiteData, Status } from "../types/response";
import type { ResponseStore } from "../types/backend";
import type { BeamResult } from "../types/spot";
import { errorChannel } from "../stores/error-channel";

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
        controller: AbortController,
    ): Promise<void> {
        try {
            this.currentTask = crypto.randomUUID();
            const beamTaskResponse = await fetch(
                `${this.url}beam?sites=${this.sites.toString()}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: import.meta.env.PROD ? "include" : "omit",
                    body: JSON.stringify({
                        id: this.currentTask,
                        sites: this.sites,
                        query: query,
                    }),
                    signal: controller.signal,
                },
            );
            if (!beamTaskResponse.ok) {
                const error = await beamTaskResponse.text();
                console.debug(
                    `Received ${beamTaskResponse.status} with message ${error}`,
                );
                throw new Error(`Unable to create new beam task.`);
            }

            console.info(`Created new Beam Task with id ${this.currentTask}`);

            /**
             * Listenes to the new_result event from beam and updates the response store
             */
            const eventSource = new EventSource(
                `${this.url.toString()}beam/${this.currentTask}?wait_count=${this.sites.length}`,
                {
                    withCredentials: true,
                },
            );
            eventSource.addEventListener("new_result", (message) => {
                const response: BeamResult = JSON.parse(message.data);
                if (response.task !== this.currentTask) return;
                const site: string = response.from.split(".")[1];
                const status: Status = response.status;
                const body: SiteData =
                    status === "succeeded"
                        ? JSON.parse(atob(response.body))
                        : null;

                const parsedResponse: ResponseStore = new Map().set(site, {
                    status: status,
                    data: body,
                });
                updateResponse(parsedResponse);
            });

            // read error events from beam
            eventSource.addEventListener("error", (message) => {
                console.error(`Beam returned error ${message}`);
                eventSource.close();
            });

            // event source in javascript throws an error then the event source is closed by backend
            eventSource.onerror = () => {
                console.info(
                    `Querying results from sites for task ${this.currentTask} finished.`,
                );
                eventSource.close();
            };
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                console.log(`Aborting request ${this.currentTask}`);
            } else {
                console.error(err);
                // show user-facing error
                errorChannel.set("Fehler beim Bearbeiten der Anfrage");
            }
        }
    }
}
