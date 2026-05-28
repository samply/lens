import { test, expect } from "@playwright/test";
import {
    addOrBar,
    addStringFilter,
    clickAutocompleteItem,
    clickSearchButton,
    getChipTexts,
    getOrBarCount,
    typeInFirstSearchBar,
    typeInLastSearchBar,
} from "./searchbar-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Ensure the search bar component is mounted
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Autocomplete behaviour
// ─────────────────────────────────────────────────────────────────────────────

test("1.1 typing 1 char shows the type-more message", async ({ page }) => {
    await typeInFirstSearchBar(page, "f");
    // The type-more message is inside an <ul> with this CSS part
    await expect(
        page.locator(
            '[part~="lens-searchbar-autocomplete-options-type-more-message"]',
        ),
    ).toBeVisible();
});

test("1.2 typing 2 unmatched chars shows 'No matches found'", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "zz");
    // "No matches found" is a hardcoded prop default (not translated)
    const list = page.locator('[part~="lens-searchbar-autocomplete-options"]');
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toContainText("No matches found");
});

test("1.3 typing 'firs' shows First name heading and string input", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "firs");
    // Category heading
    await expect(
        page.locator('[part~="lens-searchbar-autocomplete-options-heading"]', {
            hasText: "First name",
        }),
    ).toBeVisible();
    // String input rendered inside the autocomplete list item
    await expect(
        page.locator('[part~="lens-string-formfield"]').first(),
    ).toBeVisible();
});

test("1.4 typing 'C31' shows criterion name and description", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "C31");
    await expect(
        page
            .locator(
                '[part~="lens-searchbar-autocomplete-options-item-name"]',
                {
                    hasText: "C31",
                },
            )
            .first(),
    ).toBeVisible();
    // Description element is present (may be empty for some but rendered)
    await expect(
        page
            .locator(
                '[part~="lens-searchbar-autocomplete-options-item-description"]',
            )
            .first(),
    ).toBeVisible();
});

test("1.5 typing 'blood' shows facet count badges", async ({ page }) => {
    await typeInFirstSearchBar(page, "blood");
    const facetCounts = page.locator(
        '[part~="lens-searchbar-autocomplete-options-item-facet-count"]',
    );
    await expect(facetCounts.first()).toBeVisible();
    // At least one badge with a non-zero count (A+: 10 is set in demo)
    const text = await facetCounts.first().textContent();
    expect(Number(text?.trim())).toBeGreaterThan(0);
});

test("1.6 ArrowDown focuses an item; Enter adds it as a chip", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "male");
    const input = page.locator('[part~="lens-searchbar-input"]').first();
    await input.press("ArrowDown");
    // A focused item gets the -focused CSS part
    await expect(
        page
            .locator(
                '[part~="lens-searchbar-autocomplete-options-item-focused"]',
            )
            .first(),
    ).toBeVisible();
    await input.press("Enter");
    // Chip should now appear
    const chips = await getChipTexts(page);
    expect(chips.length).toBeGreaterThan(0);
});

test("1.7 Escape clears the input and closes the autocomplete", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "male");
    await expect(
        page.locator('[part~="lens-searchbar-autocomplete-options"]'),
    ).toBeVisible();

    const input = page.locator('[part~="lens-searchbar-input"]').first();
    await input.press("Escape");

    // Autocomplete must be gone
    await expect(
        page.locator('[part~="lens-searchbar-autocomplete-options"]'),
    ).not.toBeVisible();
    // Input must be empty
    await expect(input).toHaveValue("");
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Query building: chips, AND, OR, delete, URL
// ─────────────────────────────────────────────────────────────────────────────

test("2.1 string filter adds a chip with bold category label", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    const chip = page.locator('[part~="lens-searchbar-chip"]').first();
    await expect(chip).toBeVisible();
    await expect(chip.locator('[part~="lens-searchbar-chip-name"]')).toHaveText(
        "First name:",
    );
    await expect(
        chip.locator('[part~="lens-searchbar-chip-item-text"]'),
    ).toHaveText("Olaf");
});

test("2.2 criterion filter (Gender: male) adds a chip", async ({ page }) => {
    await typeInFirstSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");
    const chips = await getChipTexts(page);
    expect(chips.some((t) => t.includes("Gender") && t.includes("male"))).toBe(
        true,
    );
});

test("2.3 two criteria in the same bar creates an AND (two chips in one bar)", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await typeInFirstSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");
    // Both chips should live in the same bar (one OR group)
    const barCount = await getOrBarCount(page);
    expect(barCount).toBe(1);
    const chips = await getChipTexts(page);
    expect(chips.length).toBeGreaterThanOrEqual(2);
});

test("2.4 clicking + adds a second bar with an 'or' indicator", async ({
    page,
}) => {
    await addOrBar(page);
    expect(await getOrBarCount(page)).toBe(2);
    // 'or' indicator between bars
    await expect(
        page.locator('[part~="lens-searchbar-multiple-or-indicator"]'),
    ).toBeVisible();
});

test("2.5 criteria added to the second OR bar stay in that bar", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await addOrBar(page);
    await typeInLastSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");

    // Should still be exactly 2 bars
    expect(await getOrBarCount(page)).toBe(2);
    // Both bars must have at least one chip
    const chipCount = await page.evaluate(() => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        return (
            root?.querySelectorAll('[part~="lens-searchbar-chip"]').length ?? 0
        );
    });
    expect(chipCount).toBeGreaterThanOrEqual(2);
});

test("2.6 clicking a chip's delete button removes it", async ({ page }) => {
    await addStringFilter(page, "firs", "Olaf");
    const chipsBefore = await getChipTexts(page);
    expect(chipsBefore.length).toBeGreaterThan(0);

    // The delete button is the last button inside the chip
    await page
        .locator('[part~="lens-searchbar-chip"]')
        .first()
        .locator("button")
        .last()
        .click();

    await page.waitForTimeout(300);
    const chipsAfter = await getChipTexts(page);
    expect(chipsAfter.length).toBeLessThan(chipsBefore.length);
});

test("2.7 the bar's × button removes the entire OR group", async ({ page }) => {
    await addOrBar(page);
    expect(await getOrBarCount(page)).toBe(2);

    // Each bar renders a StoreDeleteButtonComponent as the last button in the bar
    const deleteBarBtn = page
        .locator('[part~="lens-searchbar-multiple-wrapper"]')
        .first()
        .locator("button")
        .last();
    await deleteBarBtn.click();
    await page.waitForTimeout(300);

    expect(await getOrBarCount(page)).toBe(1);
});

test("2.8 URL is updated with ?query= after adding a filter", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await page.waitForTimeout(300);
    expect(page.url()).toContain("query=");
});

test("2.9 navigating to a URL with ?query= pre-loads the chip", async ({
    page,
}) => {
    const preBuiltQuery = encodeURIComponent(
        JSON.stringify([
            [
                {
                    id: "pre-test",
                    key: "first-name",
                    name: "First name",
                    type: "EQUALS",
                    values: [
                        {
                            name: "Olaf",
                            value: "Olaf",
                            queryBindId: "pre-test-val",
                        },
                    ],
                },
            ],
        ]),
    );
    await page.goto(`/?query=${preBuiltQuery}`);
    await page.waitForLoadState("networkidle");

    const chip = page.locator('[part~="lens-searchbar-chip"]').first();
    await expect(chip).toBeVisible();
    await expect(
        chip.locator('[part~="lens-searchbar-chip-item-text"]'),
    ).toHaveText("Olaf");
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 (partial) — Search button fires the event
// ─────────────────────────────────────────────────────────────────────────────

test("search button fires lens-search-triggered", async ({ page }) => {
    let eventFired = false;
    await page.exposeFunction("__onSearchTriggered", () => {
        eventFired = true;
    });
    await page.evaluate(() => {
        window.addEventListener("lens-search-triggered", () =>
            (
                window as unknown as { __onSearchTriggered: () => void }
            ).__onSearchTriggered(),
        );
    });

    await clickSearchButton(page);
    await page.waitForTimeout(300);
    expect(eventFired).toBe(true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 (cont.) — Autocomplete edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("1.8 special characters in search input are treated as literals (no crash)", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "<script>");
    const list = page.locator('[part~="lens-searchbar-autocomplete-options"]');
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toContainText("No matches found");
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 (cont.) — Query building edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("2.10 adding the same criterion twice results in a single merged chip", async ({
    page,
}) => {
    await typeInFirstSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");

    await typeInFirstSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");

    const chips = await getChipTexts(page);
    const genderChips = chips.filter(
        (t) => t.includes("Gender") && t.includes("male"),
    );
    expect(genderChips.length).toBe(1);
});

test("2.12 deleting the last chip in the only bar leaves the app in a usable state", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    expect((await getChipTexts(page)).length).toBeGreaterThan(0);

    await page
        .locator('[part~="lens-searchbar-chip"]')
        .first()
        .locator("button")
        .last()
        .click();
    await page.waitForTimeout(300);

    await expect(
        page.locator('[part~="lens-searchbar-input"]').first(),
    ).toBeVisible();
    expect((await getChipTexts(page)).length).toBe(0);
});

test("2.14 adding 7 extra OR bars (8 total) all render and one can be deleted", async ({
    page,
}) => {
    for (let i = 0; i < 7; i++) {
        await addOrBar(page);
    }
    expect(await getOrBarCount(page)).toBe(8);

    // Delete the first bar (non-last bar: its only button is the delete button)
    const firstWrapper = page
        .locator('[part~="lens-searchbar-multiple-wrapper"]')
        .first();
    await firstWrapper.locator("button").last().click();
    await page.waitForTimeout(300);

    expect(await getOrBarCount(page)).toBe(7);
});

test("2.15 malformed JSON in ?query= URL param shows a toast and does not crash", async ({
    page,
}) => {
    await page.goto("/?query=NOTJSON{{{");
    await page.waitForLoadState("networkidle");

    await expect(
        page.locator('[part~="lens-searchbar-input"]').first(),
    ).toBeVisible();
    await expect(page.locator('[part~="lens-toast-message"]')).toBeVisible({
        timeout: 3000,
    });
    expect((await getChipTexts(page)).length).toBe(0);
});

test("2.16 ?query= with an unknown criterion key does not crash the app", async ({
    page,
}) => {
    const query = encodeURIComponent(
        JSON.stringify([
            [
                {
                    id: "unknown-1",
                    key: "this-key-does-not-exist-in-catalogue",
                    name: "Unknown Field",
                    type: "EQUALS",
                    values: [
                        {
                            name: "test",
                            value: "test",
                            queryBindId: "unknown-val-1",
                        },
                    ],
                },
            ],
        ]),
    );
    await page.goto(`/?query=${query}`);
    await page.waitForLoadState("networkidle");

    await expect(
        page.locator('[part~="lens-searchbar-input"]').first(),
    ).toBeVisible();
});
