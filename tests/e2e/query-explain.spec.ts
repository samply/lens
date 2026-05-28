/**
 * Section 5 — Query Explain button.
 *
 * The button opens a tooltip/dialog showing the AST in human-readable form.
 * Translated strings (query_info_header, query_info_group_header) are
 * asserted via CSS part selectors, not text content.
 */
import { test, expect } from "@playwright/test";
import {
    addOrBar,
    addStringFilter,
    clickAutocompleteItem,
    clickQueryExplainButton,
    typeInLastSearchBar,
} from "./searchbar-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

test("5.1 explain with empty query shows 'Search for all results'", async ({
    page,
}) => {
    await clickQueryExplainButton(page);
    // "Search for all results" is a hardcoded prop default (not translated)
    await expect(page.getByText("Search for all results")).toBeVisible();
});

test("5.2 explain with 1-group query shows exactly one group entry", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await clickQueryExplainButton(page);

    // Header element must be present (translated — assert by part, not text)
    await expect(
        page.locator('[part~="lens-query-explain-header"]'),
    ).toBeVisible();

    // Exactly one group
    const groups = page.locator('[part~="lens-query-explain-group-item"]');
    await expect(groups).toHaveCount(1);

    // The entry for First name: Olaf
    await expect(
        page.locator('[part~="lens-query-explain-bottom-level-item-entry"]'),
    ).toContainText("First name:");
    await expect(
        page.locator('[part~="lens-query-explain-bottom-level-item-entry"]'),
    ).toContainText("Olaf");
});

test("5.3 explain with 2-group OR query shows two group entries", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await addOrBar(page);
    await typeInLastSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");

    await clickQueryExplainButton(page);

    const groups = page.locator('[part~="lens-query-explain-group-item"]');
    await expect(groups).toHaveCount(2);

    const entries = page.locator(
        '[part~="lens-query-explain-bottom-level-item-entry"]',
    );
    const texts = await entries.allTextContents();
    expect(texts.some((t) => t.includes("First name"))).toBe(true);
    expect(texts.some((t) => t.includes("Gender"))).toBe(true);
});

test("5.4 per-chip info button shows single-row message for that value", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");

    // Playwright auto-pierces shadow DOM for part selectors, so we can find the
    // info button inside the chip regardless of how many shadow roots nest it.
    const chipItem = page.locator('[part~="lens-searchbar-chip-item"]').first();
    await expect(chipItem).toBeVisible();
    await chipItem.locator('[part~="lens-info-button"]').first().click();

    await expect(
        page.locator('[part~="lens-query-explain-single-row-message"]'),
    ).toContainText("First name:");
    await expect(
        page.locator('[part~="lens-query-explain-single-row-message"]'),
    ).toContainText("Olaf");
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 (cont.) — Query explain edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("5.5 query explain reflects the updated query when re-opened after a new filter is added", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "Olaf");
    await clickQueryExplainButton(page);

    await expect(
        page.locator('[part~="lens-query-explain-group-item"]'),
    ).toHaveCount(1);

    // Toggle the explain tooltip off
    await clickQueryExplainButton(page);
    await page.waitForTimeout(200);

    // Add a second OR group with a different filter
    await addOrBar(page);
    await typeInLastSearchBar(page, "male");
    await clickAutocompleteItem(page, "male");

    // Re-open query explain
    await clickQueryExplainButton(page);
    await page.waitForTimeout(200);

    await expect(
        page.locator('[part~="lens-query-explain-group-item"]'),
    ).toHaveCount(2);
});
