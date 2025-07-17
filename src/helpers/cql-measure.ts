import { v4 as uuidv4 } from "uuid";
import type { FhirMeasure } from "../types/backend";

export type BuildLibraryReturn = {
    resourceType: string;
    url: string;
    status: string;
    type: {
        coding: {
            system: string;
            code: string;
        }[];
    };
    content: {
        contentType: string;
        data: string;
    }[];
};

export const buildLibrary = (cql: string): BuildLibraryReturn => {
    const libraryId = uuidv4();
    const encodedQuery = btoa(unescape(encodeURIComponent(cql)));
    return {
        resourceType: "Library",
        url: "urn:uuid:" + libraryId,
        status: "active",
        type: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/library-type",
                    code: "logic-library",
                },
            ],
        },
        content: [
            {
                contentType: "text/cql",
                data: encodedQuery,
            },
        ],
    };
};

export type BuildMeasureReturn = {
    resourceType: string;
    url: string;
    status: string;
    subjectCodeableConcept: {
        coding: {
            system: string;
            code: string;
        }[];
    };
    library: string;
    scoring: {
        coding: {
            system: string;
            code: string;
        }[];
    };
    group: FhirMeasure[];
};

export const buildMeasure = (
    libraryUrl: string,
    measures: FhirMeasure[],
): BuildMeasureReturn => {
    const measureId = uuidv4();
    return {
        resourceType: "Measure",
        url: "urn:uuid:" + measureId,
        status: "active",
        subjectCodeableConcept: {
            coding: [
                {
                    system: "http://hl7.org/fhir/resource-types",
                    code: "Patient",
                },
            ],
        },
        library: libraryUrl,
        scoring: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/measure-scoring",
                    code: "cohort",
                },
            ],
        },
        group: measures, // configuration.resultRequests.map(request => request.measures)
    };
};
