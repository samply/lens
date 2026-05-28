/**
 * Section 4 — Request Data (Negotiate) button.
 *
 * The negotiate button is disabled until at least one site row is selected
 * via its checkbox in the result table (stored in datarequestsStore).
 * The demo handler opens a mailto: link when lens-negotiate-triggered fires.
 */
import { test, expect } from "@playwright/test";
import {
    clickNegotiateButton,
    clickSearchButton,
    isNegotiateButtonDisabled,
    waitForResults,
} from "./searchbar-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

test("4.2 negotiate button is disabled when no sites are selected", async ({
    page,
}) => {
    expect(await isNegotiateButtonDisabled(page)).toBe(true);
    // Also disabled with part lens-negotiate-button-disabled
    await expect(
        page.locator('[part~="lens-negotiate-button-disabled"]'),
    ).toBeVisible();
});

test("4.1 lens-negotiate-triggered fires when button is clicked (after selecting a site)", async ({
    page,
}) => {
    // Run a search so site results arrive
    await clickSearchButton(page);
    await waitForResults(page);

    // Select "Riverside" via the result table checkbox to enable the button
    await page.evaluate(() => {
        // Directly call selectSite via the global lens API
        // The demo page exposes the lens functions via the event listener
        // We can dispatch a custom event to add to the datarequestsStore,
        // but the cleanest approach is clicking the first site checkbox.
        const table = document.querySelector("lens-result-table");
        const root = table?.shadowRoot;
        const firstCheckbox = root?.querySelector(
            'input[type="checkbox"]',
        ) as HTMLInputElement | null;
        firstCheckbox?.click();
    });
    await page.waitForTimeout(200);

    expect(await isNegotiateButtonDisabled(page)).toBe(false);

    // Listen for the event before clicking
    let eventFired = false;
    await page.exposeFunction("__onNegotiate", () => {
        eventFired = true;
    });
    await page.evaluate(() => {
        window.addEventListener("lens-negotiate-triggered", () =>
            (
                window as unknown as { __onNegotiate: () => void }
            ).__onNegotiate(),
        );
    });

    // The demo opens a mailto: link — treat it as a popup to avoid navigation
    const popupPromise = page
        .waitForEvent("popup", { timeout: 2000 })
        .catch(() => null);
    await clickNegotiateButton(page);
    const popup = await popupPromise;
    await popup?.close().catch(() => {});

    expect(eventFired).toBe(true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 (cont.) — Negotiate edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("4.3 deselecting all sites re-disables the negotiate button", async ({
    page,
}) => {
    await clickSearchButton(page);
    await waitForResults(page);

    // Select the first site row checkbox
    await page.evaluate(() => {
        const root = document.querySelector("lens-result-table")?.shadowRoot;
        const cb = root?.querySelector(
            '[part~="lens-result-table-item-body-checkbox"]',
        ) as HTMLInputElement | null;
        if (!cb) throw new Error("Site checkbox not found");
        cb.click();
    });
    await page.waitForTimeout(200);
    expect(await isNegotiateButtonDisabled(page)).toBe(false);

    // Deselect the same checkbox
    await page.evaluate(() => {
        const root = document.querySelector("lens-result-table")?.shadowRoot;
        const cb = root?.querySelector(
            '[part~="lens-result-table-item-body-checkbox"]',
        ) as HTMLInputElement | null;
        if (!cb) throw new Error("Site checkbox not found");
        cb.click();
    });
    await page.waitForTimeout(200);

    expect(await isNegotiateButtonDisabled(page)).toBe(true);
});
