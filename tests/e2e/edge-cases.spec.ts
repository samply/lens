/**
 * Edge cases that require non-standard test setup
 * (e.g. intentionally no search, or page state before any interaction).
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 (pre-search) — Zero-results rendering
// ─────────────────────────────────────────────────────────────────────────────

test("3.7 result summary and table render without crashing before any search is fired", async ({
    page,
}) => {
    // Intentionally do NOT click search — this covers the zero-results state
    await expect(page.locator("lens-result-summary")).toBeVisible();
    await expect(page.locator("lens-result-table")).toBeVisible();

    // Table body should contain only empty spacing rows (no real data rows)
    const nonEmptyRows = await page.evaluate(() => {
        const tableRoot =
            document.querySelector("lens-result-table")?.shadowRoot;
        const rows = Array.from(
            tableRoot?.querySelectorAll("tbody tr") ?? [],
        );
        return rows.filter((r) => (r.textContent?.trim() ?? "") !== "").length;
    });
    expect(nonEmptyRows).toBe(0);
});
