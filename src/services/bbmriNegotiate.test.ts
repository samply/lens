import { describe, expect, test } from "vitest";
import {
    getNegotiatorCollectionIds,
    getSpecimenCustodianCollections,
    isValidBbmriCollectionId,
} from "./bbmriNegotiate";

describe("isValidBbmriCollectionId", () => {
    test("accepts Directory collection IDs", () => {
        expect(
            isValidBbmriCollectionId(
                "bbmri-eric:ID:DE_HEADLIGHTS_A:collection:plasma",
            ),
        ).toBe(true);
    });

    test("rejects other identifiers", () => {
        expect(isValidBbmriCollectionId("null")).toBe(false);
        expect(isValidBbmriCollectionId("collection:plasma")).toBe(false);
        expect(
            isValidBbmriCollectionId("bbmri-eric:ID:DE_A:specimen:plasma"),
        ).toBe(false);
    });
});

describe("getSpecimenCustodianCollections", () => {
    test("prefers the Focus 0.26 stratifier name", () => {
        const specimen = { "bbmri-eric:ID:DE_A:collection:plasma": 2 };
        expect(
            getSpecimenCustodianCollections({
                Custodian: { "bbmri-eric:ID:DE_A:collection:tissue": 1 },
                "Custodian-specimen": specimen,
            }),
        ).toBe(specimen);
    });

    test("falls back to the pre-0.26 stratifier name", () => {
        const merged = { "bbmri-eric:ID:DE_A:collection:plasma": 2, null: 1 };
        expect(getSpecimenCustodianCollections({ Custodian: merged })).toBe(
            merged,
        );
    });

    test("returns undefined without Custodian stratifiers", () => {
        expect(
            getSpecimenCustodianCollections({ gender: { female: 1 } }),
        ).toBeUndefined();
        expect(getSpecimenCustodianCollections(undefined)).toBeUndefined();
    });
});

describe("getNegotiatorCollectionIds", () => {
    test("keeps valid Custodian collection IDs and drops invalid ones", () => {
        expect(
            getNegotiatorCollectionIds(
                {
                    "bbmri-eric:ID:DE_A:collection:plasma": 2,
                    "not-a-directory-id": 1,
                    null: 1,
                },
                undefined,
            ),
        ).toEqual(["bbmri-eric:ID:DE_A:collection:plasma"]);
    });

    test("adds the fallback for sites without specimens or with null custodians", () => {
        const fallback = "bbmri-eric:ID:DE_B:collection:fallback";
        expect(getNegotiatorCollectionIds(undefined, fallback)).toEqual([
            fallback,
        ]);
        expect(getNegotiatorCollectionIds({ null: 1 }, fallback)).toEqual([
            fallback,
        ]);
        expect(
            getNegotiatorCollectionIds(
                { "bbmri-eric:ID:DE_B:collection:tissue": 1 },
                fallback,
            ),
        ).toEqual(["bbmri-eric:ID:DE_B:collection:tissue"]);
    });
});
