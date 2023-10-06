/**
 * TODO: document this class
 */


import { responseStore } from "../stores/response"
import type { ResponseStore } from "../types/backend";

import type { Site, SiteData, Status } from "../types/response"

type BeamResult = {
    body: string,
    from: string,
    metadata: string,
    status: Status,
    task: string,
    to: string[]
}

export class Spot {
    private storeCache;
    constructor(
        private url: URL,
        private sites: Array<string>,
    ) {
        responseStore.subscribe(store => this.storeCache = store)
    }

    async send(query: string) {
        console.log(`${this.url}tasks?sites=${this.sites.toString()}`);

        const beamTaskResponse = await fetch(
            `${this.url}tasks?sites=${this.sites.toString()}`,
            {
                method: 'POST',
                credentials: 'include',
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
        let continueRequests: boolean = false;

        do {

            const beamResponses: Response = await fetch(
                `${this.url}tasks/${beamTask.id}?wait_count=${responseCount + 1}`,
                {
                    credentials: 'include'
                }
            )

            if (!beamResponses.ok) {
                const error: string = await beamResponses.text()
                console.debug(`Received ${beamResponses.status} with message ${error}`)
                throw new Error(`Error then retrieving responses from Beam. Abborting requests ...`)
            }

            const beamResponseData: Array<BeamResult> = await beamResponses.json();

            let changes = new Map<string, Site>();
            beamResponseData.forEach((response: BeamResult) => {
                let site: string = response.from.split(".")[1]
                let status: Status = response.status
                let body: SiteData = (status === "succeeded") ? JSON.parse(atob(response.body)) : null;

                // if the site is already in the store and the status is claimed, don't update the store
                if(this.storeCache.get(site)?.status === status) return;

                // TODO: Make this a ste
                changes.set(site, {status: status, data: body});
            });
            if (changes.size > 0) {
                responseStore.update((store: ResponseStore): ResponseStore => {
                    changes.forEach((value, key) => {
                        store.set(key, value)
                    })
                    return store;
                })
            }

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
