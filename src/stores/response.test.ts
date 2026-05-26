import { beforeAll, expect, test } from "vitest";
import {
    setSiteResult,
    getTotal,
    getSiteTotal,
    getStratum,
    getSiteStratum,
    getStrata,
    siteResults,
} from "./response";
import { get } from "svelte/store";

beforeAll(() => {
    // Mock site responses
    setSiteResult("mannheim", {
        stratifiers: {
            gender: { female: 11900, male: 19130 },
        },
        totals: { patients: 31020 },
    });
    setSiteResult("mainz", {
        stratifiers: {
            gender: { male: 16950, female: 9650, unknown: 10 },
        },
        totals: { patients: 26610 },
    });
});

test("getTotals", () => {
    expect(getTotal(get(siteResults), "patients")).toBe(57630);
});

test("getSiteTotals", () => {
    expect(getSiteTotal(get(siteResults), "mannheim", "patients")).toBe(31020);
    expect(getSiteTotal(get(siteResults), "mainz", "patients")).toBe(26610);
});

test("getStratum", () => {
    expect(getStratum(get(siteResults), "gender", "male")).toEqual(36080);
    expect(getStratum(get(siteResults), "gender", "female")).toEqual(21550);
    expect(getStratum(get(siteResults), "gender", "unknown")).toEqual(10);
});

test("getSiteStratum", () => {
    expect(
        getSiteStratum(get(siteResults), "mannheim", "gender", "male"),
    ).toEqual(19130);
    expect(
        getSiteStratum(get(siteResults), "mannheim", "gender", "female"),
    ).toEqual(11900);
    expect(
        getSiteStratum(get(siteResults), "mannheim", "gender", "unknown"),
    ).toEqual(0);
    expect(getSiteStratum(get(siteResults), "mainz", "gender", "male")).toEqual(
        16950,
    );
    expect(
        getSiteStratum(get(siteResults), "mainz", "gender", "female"),
    ).toEqual(9650);
    expect(
        getSiteStratum(get(siteResults), "mainz", "gender", "unknown"),
    ).toEqual(10);
});

test("getStrata", () => {
    expect(getStrata(get(siteResults), "gender").sort()).toEqual(
        ["female", "male", "unknown"].sort(),
    );
});

import {
    markSiteClaimed,
    removeFailedSite,
    clearSiteResults,
    siteStatus,
} from "./response";

test("markSiteClaimed marks a site as 'claimed' in siteStatus", () => {
    markSiteClaimed("pending-site");
    const status = get(siteStatus);
    expect(status.get("pending-site")).toBe("claimed");
});

test("removeFailedSite removes the site from both siteStatus and siteResults", () => {
    setSiteResult("to-remove", { stratifiers: {}, totals: { patients: 5 } });
    markSiteClaimed("to-remove");
    removeFailedSite("to-remove");
    expect(get(siteStatus).has("to-remove")).toBe(false);
    expect(get(siteResults).has("to-remove")).toBe(false);
});

test("clearSiteResults empties both siteResults and siteStatus", () => {
    setSiteResult("site-a", { stratifiers: {}, totals: { patients: 1 } });
    markSiteClaimed("site-b");
    clearSiteResults();
    expect(get(siteResults).size).toBe(0);
    expect(get(siteStatus).size).toBe(0);
});
