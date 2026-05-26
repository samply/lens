/**
 * Section 6 — Catalogue panel.
 */
import { test, expect } from "@playwright/test";
import { getChipTexts } from "./helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

test("6.1 all top-level catalogue categories are visible", async ({ page }) => {
    const catalogue = page.locator("lens-catalogue");
    await expect(catalogue).toBeVisible();

    for (const name of [
        "Diagnosis",
        "Blood group",
        "Body weight",
        "Date of birth",
        "First name",
        "Donor/Clinical Information",
        "Tumorentität",
        "Sample ID",
    ]) {
        await expect(catalogue.getByText(name, { exact: true }).first()).toBeVisible();
    }
});

test("6.2 expanding 'Donor/Clinical Information' shows child categories", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    // The group has a toggle button/chevron; click the group header
    const groupHeader = catalogue.getByText("Donor/Clinical Information", {
        exact: true,
    });
    await groupHeader.click();
    await page.waitForTimeout(300);

    await expect(catalogue.getByText("Gender", { exact: true })).toBeVisible();
    await expect(
        catalogue.getByText("Diagnosis ICD-10", { exact: true }),
    ).toBeVisible();
    await expect(catalogue.getByText("Diagnosis age", { exact: true })).toBeVisible();
});

test("6.3 clicking Gender 'male' criterion in catalogue adds a chip", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    // Expand the group first
    await catalogue.getByText("Donor/Clinical Information", { exact: true }).click();
    await page.waitForTimeout(300);

    // Gender sub-group may need expanding too
    const genderSection = catalogue.locator("text=Gender").first();
    await genderSection.click();
    await page.waitForTimeout(300);

    // Click the "+" button next to "male"
    const maleRow = catalogue.locator("text=male").first();
    // The add button is adjacent; look for a button within the same list item
    await maleRow.locator("..").locator("button").first().click();
    await page.waitForTimeout(300);

    const chips = await getChipTexts(page);
    expect(chips.some((t) => t.includes("male"))).toBe(true);
});

test("6.4 submitting an empty string input in catalogue shows validation error", async ({
    page,
}) => {
    // Click "First name" in catalogue to show the string input
    const firstNameEntry = page
        .locator("lens-catalogue")
        .getByText("First name", { exact: true });
    await firstNameEntry.click();
    await page.waitForTimeout(200);

    // Find the string form and submit without entering a value
    const stringForm = page
        .locator("lens-catalogue")
        .locator('[part~="lens-string-form"]')
        .first();
    await expect(stringForm).toBeVisible();

    // Try to submit via the AddButton (the + inside the form)
    await stringForm.locator("button").click();

    // Browser native validation makes the input invalid; check validity state
    const isInvalid = await page.evaluate(() => {
        const input = document
            .querySelector("lens-catalogue")
            ?.shadowRoot?.querySelector('[part~="lens-string-formfield"]') as
            | HTMLInputElement
            | null;
        return input ? !input.validity.valid : false;
    });
    expect(isInvalid).toBe(true);
});
