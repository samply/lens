/**
 * Section 8 — Toast notifications.
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
});

test("8.1 clicking 'Error toast test' shows an error toast", async ({
    page,
}) => {
    await page.getByText("Error toast test").click();
    // Toast content lives inside lens-toast's shadow DOM;
    // Playwright pierces shadow roots for part-attribute selectors.
    await expect(page.locator('[part~="lens-toast-message"]')).toBeVisible({
        timeout: 3000,
    });
    await expect(page.locator('[part~="lens-toast-message"]')).toContainText(
        "Task failed successfully.",
    );
});

test("8.2 clicking 'Info toast test' shows an info toast", async ({ page }) => {
    await page.getByText("Info toast test").click();
    await expect(page.locator('[part~="lens-toast-message"]')).toBeVisible({
        timeout: 3000,
    });
    await expect(page.locator('[part~="lens-toast-message"]')).toContainText(
        "Task sent successfully.",
    );
});
