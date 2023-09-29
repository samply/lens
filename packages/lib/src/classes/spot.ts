import { responseStore } from "../stores/response"

import type { Status } from "../types/response"

type BeamResult = {
    body: string,
    from: string,
    metadata: string,
    status: Status,
    task: string,
    to: string[]
}

export class Spot {
    constructor(
        private url: URL,
        private sites: Array<string>,
    ) { }

    async send(query: string) {
        const beamTaskResponse = await fetch(
            `${this.url}tasks?sites=${this.sites.toString()}`,
            {
                method: 'POST',
                // credentials: 'include',
                body: query,
            }
        )
        if (!beamTaskResponse.ok) {
            const error = await beamTaskResponse.text()
            console.debug(`Received ${beamTaskResponse.status} with message ${error}`)
            throw new Error(`Unable to create new beam task.`)
        }
        const beamTask = await beamTaskResponse.json()

        let responseCount = 0
        // the time to wait in ms for a response from beam
        let requestTimeOut = 500;
        let continueRequests = false;

        do {

            const beamResponses = await fetch(
                `${this.url}tasks/${beamTask.id}?wait_count=${responseCount + 1}&wait_time=${requestTimeOut}ms`,
            )

            if (!beamResponses.ok) {
                const error = await beamResponses.text()
                console.debug(`Received ${beamResponses.status} with message ${error}`)
                throw new Error(`Error then retrieving responses from Beam. Abborting requests ...`)
            }

            const beamResponseData: Array<BeamResult> = await beamResponses.json();

            responseStore.update((store) => {
                beamResponseData.forEach((response: BeamResult) => {
                    let site = response.from.split(".")[1]
                    let status = response.status
                    let body = (status !== "claimed") ? JSON.parse(atob(response.body)) : null;
                    store.set(site, {status: status, data: body});
                });
                return store;
            })

            responseCount = beamResponseData.length;
            let realResponseCount = beamResponseData.filter(response => response.status !== "claimed").length;

            if (
                (beamResponses.status === 200 || beamResponses.status === 206)
                    && realResponseCount !== this.sites.length
            ) {
                continueRequests = true;
            } else {
                continueRequests = false;
                break;
            }

        } while (true)

    }
}
