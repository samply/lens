/**
 * TODO: document this class
 */

import type { SiteData, Status } from "../types/response";
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
        controller: AbortController,
    ): Promise<void> {
        console.info(`send: entered`);
        try {
            console.info(`Do a crypto.randomUUID()`);
            this.currentTask = this.randomUUID();
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
            console.info(`We got a Beam response`);
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
            }
        }
        console.info(`send: finished`);
    }

    /**
     * Generates a random UUID (Universally Unique Identifier) using the built-in `crypto.randomUUID()` function if available,
     * or falls back to a simple pseudo-random algorithm if the function is not available.
     *
     * @returns A string representing the generated UUID.
     */
    randomUUID(): string {
        // Check if the built-in `crypto.randomUUID()` function is available
        if (crypto.randomUUID && crypto.randomUUID.bind(crypto)) {
            return crypto.randomUUID();
        } else {
            // Fall back to a home-grown function if `crypto.randomUUID()` is not available
            return this.generatePseudoRandomUuid();
        }
    }

    /**
     * Generates a UUID (Universally Unique Identifier) using a pseudo-random algorithm.
     *
     * @returns A string representing the generated UUID.
     */
    generatePseudoRandomUuid(): string {
        // Define the characters to be used in the UUID
        const chars = '0123456789abcdef'.split('');

        // Array to store the UUID components
        const uuid = [];

        // Pseudo-random number generator function
        const rnd = Math.random;

        // Set specific positions in the UUID array to fixed values
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'; // Section separator
        uuid[14] = '4'; // Version 4

        // Generate the remaining components of the UUID
        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                // Generate a random value (ranging from 0 to 15)
                const r = 0 | rnd() * 16;

                // Set the UUID component based on the random value
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r & 0xf];
            }
        }

        // Join the UUID components and return the result
        return uuid.join('');
    }
}
