/**
 * TODO: document this class
 */

import { responseStore } from "../stores/response";
import type { ResponseStore } from "../types/backend";

import type { SiteData, Status } from "../types/response";

type BeamResult = {
    body: string;
    from: string;
    metadata: string;
    status: Status;
    task: string;
    to: string[];
};

/**
 * Implements requests to multiple targets through the middleware spot (see: https://github.com/samply/spot).
 * The responses are received via Server Sent Events
 */
export class Spot {
    private currentTask!: string;

    constructor(
        private url: URL,
        private sites: Array<string>,
    ) {}

    /**
     * sends the query to beam and updates the store with the results
     * @param query the query as base64 encoded string
     * @param controller the abort controller to cancel the request
     */
    async send(query: string, controller?: AbortController): Promise<void> {
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

                responseStore.update((store: ResponseStore): ResponseStore => {
                    store.set(site, { status: status, data: body });
                    return store;
                });
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
            }
        }
    }
}
