import { v4 as uuidv4 } from "uuid";

export const buildLibrary = (cql: string) => {
    const libraryId = uuidv4()
    const encodedQuery = btoa(unescape(encodeURIComponent(cql)));
    return {
        "resourceType": "Library",
        "url": "urn:uuid:" + libraryId,
        "status": "active",
        "type": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/library-type",
                    "code": "logic-library"
                }
            ]
        },
        "content": [
            {
                "contentType": "text/cql",
                "data": encodedQuery
            }
        ]
    }
}

export const buildMeasure = (libraryUrl: string, measures: object[]) => {
    const measureId = uuidv4();
    return {
      "resourceType": "Measure",
      "url": "urn:uuid:" + measureId,
      "status": "active",
      "subjectCodeableConcept": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/resource-types",
            "code": "Patient"
          }
        ]
      },
      "library": libraryUrl,
      "scoring": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/measure-scoring",
            "code": "cohort"
          }
        ]
      },
      "group": measures // configuration.resultRequests.map(request => request.measures)
    }
}
