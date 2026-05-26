/**
 * Section 7 — Language switching.
 *
 * The demo stores "language" in localStorage and reloads.
 * Translated strings change; we assert on the search button text which uses
 * translate("search") → "Search" (EN) / "Suchen" (DE).
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    // Start with EN to ensure a clean baseline
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

test("7.1 clicking DE reloads the page in German (search button shows 'Suchen')", async ({
    page,
}) => {
    await page.getByText("🇩🇪").click();
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-search-button"]').waitFor();

    // translate("search") → "Suchen" in DE
    const btnText = await page.evaluate(() => {
        return document
            .querySelector("lens-search-button")
            ?.shadowRoot?.querySelector('[part~="lens-search-button"]')
            ?.textContent?.trim();
    });
    expect(btnText).toContain("Suchen");
});

test("7.2 clicking GB after DE restores English (search button shows 'Search')", async ({
    page,
}) => {
    // Switch to DE first
    await page.getByText("🇩🇪").click();
    await page.waitForLoadState("networkidle");

    // Switch back to EN
    await page.getByText("🇬🇧").click();
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-search-button"]').waitFor();

    const btnText = await page.evaluate(() => {
        return document
            .querySelector("lens-search-button")
            ?.shadowRoot?.querySelector('[part~="lens-search-button"]')
            ?.textContent?.trim();
    });
    expect(btnText).toContain("Search");
});
