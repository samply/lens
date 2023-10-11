/**
 * TODO: document this class
 */


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

export class Spot {
    constructor(
        private url: URL,
        private sites: Array<string>,
    ) { }

    sendsRequests: boolean = true;

    stopRequests() {
        this.sendsRequests = false;
    }

    async send(query: string) {

        console.log(`${this.url}tasks?sites=${this.sites.toString()}`);

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

        let responseCount: number = 0
        // the time to wait in ms for a response from beam
        let requestTimeOut: number = 500;

        do {
            if (!this.sendsRequests)
                break;

            const beamResponses: Response = await fetch(
                `${this.url}tasks/${beamTask.id}?wait_count=${responseCount + 1}&wait_time=${requestTimeOut}ms`,
                {
                    // credentials: 'include'
                }
            )

            if (!beamResponses.ok) {
                const error: string = await beamResponses.text()
                console.debug(`Received ${beamResponses.status} with message ${error}`)
                throw new Error(`Error then retrieving responses from Beam. Abborting requests ...`)
            }

            const beamResponseData: Array<BeamResult> = await beamResponses.json();
            let realResponseCount = beamResponseData.filter(response => response.status !== "claimed").length;

            beamResponseData.forEach((response: BeamResult) => {

                let site: string = response.from.split(".")[1]
                let status: Status = response.status
                let body: SiteData = (status === 'succeeded') ? JSON.parse(atob(response.body)) : null;

                /**
                 * set the site in the store if the request was claimed for the first time or succeeded
                */
                let storeStatus
                responseStore.subscribe((store: ResponseStore) => {
                    storeStatus = store.get(site)?.status
                })
                if (
                    storeStatus === undefined && status === 'claimed' ||
                    storeStatus === 'claimed' && status === 'succeeded' ||
                    storeStatus === null

                ) {
                    responseStore.update((store: ResponseStore): ResponseStore => {
                        store.set(site, { status: status, data: body });
                        return store;
                    });
                }
                /**
                 * removes the site from the store if the request failed
                 */
                if (status === 'permfailed') {
                    responseStore.update((store: ResponseStore): ResponseStore => {
                        store.delete(site);
                        return store;
                    })
                }
            })

            responseCount = beamResponseData.length;


            if (realResponseCount === this.sites.length || !(beamResponses.status === 200 || beamResponses.status === 206)) {
                this.stopRequests();
            }



        } while (this.sendsRequests)

    }
}
