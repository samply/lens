import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import { responseStore } from "../stores/response";
import type { Site } from "../types/response";
import { measureStore } from "../stores/measures";

let measureDefinitions

measureStore.subscribe(store => {
    measureDefinitions = store.map((measure) => measure.measure)
})

export class Blaze {
    constructor(
        private url: URL,
        private name: string,
        private auth: string = "",
    ) {
    }

    async send(cql: string) {
        responseStore.update((store) => {
            store.set(this.name, {status: "claimed", data: null});
            return store;
        });
        let libraryResponse = await fetch(
            new URL(`${this.url}/Library`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(buildLibrary(cql))
            }
        )
        if (!libraryResponse.ok){
            this.handleError(`Couldn't create Library in Blaze`, libraryResponse);
        }
        const library = await libraryResponse.json();
        const measureResponse = await fetch(
            new URL(`${this.url}/Measure`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(buildMeasure(library.url, measureDefinitions))
            }
        )
        if (!measureResponse.ok) {
            this.handleError(`Couldn't create Measure in Blaze`, measureResponse)
        }
        const measure = await measureResponse.json();
        const dataResponse = await fetch(
            new URL(`${this.url}/Measure/$evaluate-measure?measure=${measure.url}&periodStart=2000&periodEnd=2030`)
        )
        if (!dataResponse.ok) {
            this.handleError(`Couldn't evaluate Measure in Blaze`, dataResponse)
        }
        const blazeResponse: Site = await dataResponse.json()
        responseStore.update((store) => {
            store.set(this.name, {status: 'succeeded', data: blazeResponse})
            return store;
        })
    }

    async handleError(message: string, response: Response) {
        const errorMessage = await response.text()
        console.debug(`${message}. Received error ${response.status} with message ${errorMessage}`)
        responseStore.update((store) => {
            store.set(this.name, {status: 'permfailed', data: null})
            return store;
        })
    }

}
