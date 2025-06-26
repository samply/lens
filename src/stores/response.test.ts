import { beforeAll, expect, test } from "vitest";
import {
    setSiteResult,
    getTotal,
    getSiteTotal,
    getStratum,
    getSiteStratum,
    getStrata,
} from "./response";

beforeAll(() => {
    // Mock site responses
    setSiteResult("mannheim", {
        totals: { patients: 31020 },
        gender: { female: 11900, male: 19130 },
    });
    setSiteResult("mainz", {
        totals: { patients: 26610 },
        gender: { male: 16950, female: 9650, unknown: 10 },
    });
});

test("getTotals", () => {
    expect(getTotal("patients")).toBe(57630);
});

test("getSiteTotals", () => {
    expect(getSiteTotal("mannheim", "patients")).toBe(31020);
    expect(getSiteTotal("mainz", "patients")).toBe(26610);
});

test("getStratum", () => {
    expect(getStratum("gender", "male")).toEqual(36080);
    expect(getStratum("gender", "female")).toEqual(21550);
    expect(getStratum("gender", "unknown")).toEqual(10);
});

test("getSiteStratum", () => {
    expect(getSiteStratum("mannheim", "gender", "male")).toEqual(19130);
    expect(getSiteStratum("mannheim", "gender", "female")).toEqual(11900);
    expect(getSiteStratum("mannheim", "gender", "unknown")).toEqual(0);
    expect(getSiteStratum("mainz", "gender", "male")).toEqual(16950);
    expect(getSiteStratum("mainz", "gender", "female")).toEqual(9650);
    expect(getSiteStratum("mainz", "gender", "unknown")).toEqual(10);
});

test("getStrata", () => {
    expect(getStrata("gender").sort()).toEqual(
        ["female", "male", "unknown"].sort(),
    );
});
