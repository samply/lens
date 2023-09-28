import { buildLibrary, buildMeasure } from "../helpers/cql-measure";
import { measureStore } from "../stores/measures";

let measureDefinitions

measureStore.subscribe(store => {
    measureDefinitions = store.map((measure) => measure.measure)
})

export class Blaze {
    constructor(
        private url: URL,
        private auth: string = "",
    ) {
    }

    async send(cql: string): Promise<any> {
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
            throw new Error(`Couldn't create Library in Blaze. Received error ${libraryResponse.status} with message ${libraryResponse.text()}`)
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
           throw new Error(`Couldn't create Measure in Blaze. Received error ${measureResponse.status} with message ${measureResponse.text()}`)
        }
        const measure = await measureResponse.json();
        const dataResponse = await fetch(
            new URL(`${this.url}/Measure/$evaluate-measure?measure=${measure.url}&periodStart=2000&periodEnd=2030`)
        )
        if (!dataResponse.ok) {
            throw new Error(`Couldn't evaluate Measure in Blaze. Received error ${dataResponse.status} with message ${dataResponse.text()}`)
        }
        return dataResponse.json()
    }
}
