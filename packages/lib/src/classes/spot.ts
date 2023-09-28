import { responseStore } from "../stores/response"

export class Spot {
    constructor(
        private url: URL,
        private sites: Array<string>,
    ) { }

    async send(query: string): Promise<any> {
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

            const beamResponseData = await beamResponses.json();

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

            console.log(continueRequests)

            // responseStore.set(beamResponseData)
        } while (true)

    }
}
