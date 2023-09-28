import { buildLibrary, buildMeasure } from "../helpers/cql-measure";

const measureDefinitionsMock = [
    {
        "code": {
            "text": "patients"
        },
        "population": [
            {
                "code": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/measure-population",
                            "code": "initial-population"
                        }
                    ]
                },
                "criteria": {
                    "language": "text/cql-identifier",
                    "expression": "InInitialPopulation"
                }
            }
        ],
        "stratifier": [
            {
                "code": {
                    "text": "Gender"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "Gender"
                }
            },
            {
                "code": {
                    "text": "75186-7"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "Deceased"
                }
            },
            {
                "code": {
                    "text": "Age"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "AgeClass"
                }
            }
        ]
    }
]

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
                body: JSON.stringify(buildMeasure(library.url, measureDefinitionsMock))
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
        return dataResponse.json
    }
}
