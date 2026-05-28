/**
 * Section 3 — Search execution and result display.
 *
 * The demo's event handler sets fake results for "riverside" (9 patients),
 * "summit" (33 patients), removes "failingsite", and sets empty results for
 * sites A-J — giving 12 sites total and 42 patients.
 */
import { test, expect } from "@playwright/test";
import {
    clickSearchButton,
    isNegotiateButtonDisabled,
    waitForResults,
} from "./searchbar-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
    await clickSearchButton(page);
    await waitForResults(page);
});

test("3.1 result summary shows 12 sites and 42 patients after empty search", async ({
    page,
}) => {
    // Title set in demo config as "Ergebnisse" (hardcoded, not translated)
    await expect(page.getByText("Ergebnisse")).toBeVisible();
    // The demo config maps dataKey "collections" → counts sites; "patients" → sums totals
    await expect(page.getByText(/12\s*\/\s*12/)).toBeVisible();
    await expect(page.getByText("42")).toBeVisible();
});

test("3.3 'Failing Site' is not shown in the result table", async ({
    page,
}) => {
    // The demo calls removeFailedSite("failingsite") and siteMappings maps it
    // to "Failing Site". It must not appear as a table row.
    const table = page.locator("lens-result-table");
    await expect(table).toBeVisible();
    await expect(table.getByText("Failing Site")).not.toBeVisible();
});

test("3.4 Riverside (9 patients) shows the rounding tooltip 'Exact value'", async ({
    page,
}) => {
    // The table is paginated (pageSize=10). Site keys sort case-sensitively, so
    // Sites A-J (uppercase S) fill page 1 and "riverside" (lowercase r) lands on
    // page 2. Navigate there first.
    await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        const nextBtn = tableRoot?.querySelector(
            "[part~='lens-result-pagination-pagination-next']",
        ) as HTMLElement | null;
        if (!nextBtn) throw new Error("Pagination next button not found");
        nextBtn.click();
    });
    await page.waitForTimeout(200);

    // Trigger mouseenter on the Riverside row's tooltip span
    await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        if (!tableRoot)
            throw new Error("lens-result-table shadow root not found");
        for (const row of tableRoot.querySelectorAll("tr")) {
            if (row.textContent?.includes("Riverside")) {
                const trigger = row.querySelector(
                    "[part~='lens-tooltip-trigger']",
                ) as HTMLElement | null;
                if (!trigger)
                    throw new Error(
                        "Tooltip trigger not found in Riverside row",
                    );
                trigger.dispatchEvent(
                    new MouseEvent("mouseenter", { bubbles: true }),
                );
                return;
            }
        }
        const texts = Array.from(tableRoot.querySelectorAll("tr")).map((r) =>
            r.textContent?.trim().substring(0, 40),
        );
        throw new Error(
            "Riverside row not found on page 2. Rows: " + JSON.stringify(texts),
        );
    });
    await page.waitForTimeout(300);

    const tooltipText = await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        return (
            tableRoot
                ?.querySelector("[part~='lens-tooltip-message']")
                ?.textContent?.trim() ?? null
        );
    });
    expect(tooltipText).toContain("Exact value");
});

test("3.5 gender pie chart renders after search", async ({ page }) => {
    // lens-chart renders a <canvas> element for the pie chart
    const genderChart = page
        .locator("lens-chart")
        .filter({ hasText: "Gender distribution" });
    await expect(genderChart).toBeVisible();
    await expect(genderChart.locator("canvas")).toBeVisible();
});

test("3.6 diagnosis bar chart renders after search", async ({ page }) => {
    const diagChart = page
        .locator("lens-chart")
        .filter({ hasText: "Diagnosis distribution" })
        .first();
    await expect(diagChart).toBeVisible();
    await expect(diagChart.locator("canvas")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 (cont.) — Results edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("3.9 result table tooltip closes when mouse leaves the trigger", async ({
    page,
}) => {
    // Navigate to page 2 where Riverside (9 patients — Exact value) lives
    await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        const nextBtn = tableRoot?.querySelector(
            "[part~='lens-result-pagination-pagination-next']",
        ) as HTMLElement | null;
        if (!nextBtn) throw new Error("Pagination next button not found");
        nextBtn.click();
    });
    await page.waitForTimeout(200);

    // Open tooltip via mouseenter
    await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        if (!tableRoot) throw new Error("No shadow root");
        for (const row of tableRoot.querySelectorAll("tr")) {
            if (row.textContent?.includes("Riverside")) {
                const trigger = row.querySelector(
                    "[part~='lens-tooltip-trigger']",
                ) as HTMLElement | null;
                if (!trigger) throw new Error("Tooltip trigger not found");
                trigger.dispatchEvent(
                    new MouseEvent("mouseenter", { bubbles: true }),
                );
                return;
            }
        }
        throw new Error("Riverside row not found");
    });
    await page.waitForTimeout(200);

    const tooltipVisible = await page.evaluate(() => {
        return !!document
            .querySelector("lens-result-table")
            ?.shadowRoot?.querySelector("[part~='lens-tooltip-message']");
    });
    expect(tooltipVisible).toBe(true);

    // Close tooltip via mouseleave
    await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        if (!tableRoot) throw new Error("No shadow root");
        for (const row of tableRoot.querySelectorAll("tr")) {
            if (row.textContent?.includes("Riverside")) {
                const trigger = row.querySelector(
                    "[part~='lens-tooltip-trigger']",
                ) as HTMLElement | null;
                if (!trigger) throw new Error("Tooltip trigger not found");
                trigger.dispatchEvent(
                    new MouseEvent("mouseleave", { bubbles: false }),
                );
                return;
            }
        }
        throw new Error("Riverside row not found");
    });
    await page.waitForTimeout(200);

    const tooltipGone = await page.evaluate(() => {
        return !!document
            .querySelector("lens-result-table")
            ?.shadowRoot?.querySelector("[part~='lens-tooltip-message']");
    });
    expect(tooltipGone).toBe(false);
});

test("3.11 site checkbox selection and negotiate button state persist across a new search", async ({
    page,
}) => {
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

    // Fire a second search
    await clickSearchButton(page);
    await waitForResults(page);

    // Selection must persist — negotiate button remains enabled
    expect(await isNegotiateButtonDisabled(page)).toBe(false);

    // The first site's checkbox must still be visually checked
    const isChecked = await page.evaluate(() => {
        const root = document.querySelector("lens-result-table")?.shadowRoot;
        const cb = root?.querySelector(
            '[part~="lens-result-table-item-body-checkbox"]',
        ) as HTMLInputElement | null;
        return cb?.checked ?? false;
    });
    expect(isChecked).toBe(true);
});
