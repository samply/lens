import { responseStore } from "../stores/response"
import type { ResponseStore } from "../types/backend";

import type { SiteData, Status } from "../types/response"

type BeamResult = {
    body: string,
    from: string,
    metadata: string,
    status: Status,
    task: string,
    to: string[]
}

/**
 * Implements requests to multiple targets through the middleware spot (see: https://github.com/samply/spot).
 * The responses are received via Server Sent Events
 */
// Note that this implementation of the class is a revert to an earlier implementation, with tweaks
// to the way that UUIDs are generated.
// Reason for the revert: the new implementation simply did not work.
// Reason for the UUID tweak: crypto.randomUUID() is not available if Lens is run behind a Traefik
// reverse proxy.
export class Spot {

    private currentTask: string;

    constructor(
        private url: URL,
        private sites: Array<string>,
    ) {}

    async send(query: string, controller?: AbortController) {
        try {
            this.currentTask = this.randomUUID();
            const beamTaskResponse = await fetch(
                `${this.url}beam?sites=${this.sites.toString()}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: (import.meta.env.PROD) ? "include" : "omit",
                    body: JSON.stringify({
                        id: this.currentTask,
                        sites: this.sites,
                        query: query
                    }),
                    signal: controller.signal
                }

            )
            if (!beamTaskResponse.ok) {
                const error = await beamTaskResponse.text()
                console.debug(`Received ${beamTaskResponse.status} with message ${error}`)
                throw new Error(`Unable to create new beam task.`)
            }

            console.log(`Created new Beam Task with id ${this.currentTask}`)

            let eventSource = new EventSource(`${this.url.toString()}beam/${this.currentTask}?wait_count=${this.sites.length}`)
            eventSource.addEventListener("new_result", (message) => {
                const response: BeamResult = JSON.parse(message.data)
                if (response.task !== this.currentTask) return
                let site: string = response.from.split(".")[1]
                let status: Status = response.status
                let body: SiteData = (status === "succeeded") ? JSON.parse(atob(response.body)) : null;

                console.log(`send: status: ${status}`)
                console.log(`send: response.body: ${atob(response.body)}`)

                responseStore.update((store: ResponseStore): ResponseStore => {
                    store.set(site, { status: status, data: body })
                    return store;
                })
            })

            // read error events from beam
            eventSource.addEventListener("error", (message) => {
                console.warn(`Beam returned error ${message}`)
                eventSource.close()
            })

            // event source in javascript throws an error then the event source is closed by backend
            eventSource.onerror = () => {
                eventSource.close()
            }

        } catch (err) {
            if (err.name === "AbortError") {
                console.log(`Aborting request ${this.currentTask}`)
            } else {
                console.log(`General error`)
                console.error(err)
            }
        }
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
