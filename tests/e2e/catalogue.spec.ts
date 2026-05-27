/**
 * Section 6 — Catalogue panel.
 */
import { test, expect } from "@playwright/test";
import { addStringFilter, getChipTexts } from "./searchbar-helpers";

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
    await catalogue.getByText("Donor/Clinical Information", { exact: true }).click();
    await page.waitForTimeout(300);

    const genderSection = catalogue.locator("text=Gender").first();
    await genderSection.click();
    await page.waitForTimeout(300);

    const maleRow = catalogue.locator("text=male").first();
    await maleRow.locator("..").locator("button").first().click();
    await page.waitForTimeout(300);

    const chips = await getChipTexts(page);
    expect(chips.some((t) => t.includes("male"))).toBe(true);
});

test("6.4 submitting an empty string input in catalogue shows validation error", async ({
    page,
}) => {
    const firstNameEntry = page
        .locator("lens-catalogue")
        .getByText("First name", { exact: true });
    await firstNameEntry.click();
    await page.waitForTimeout(200);

    const stringForm = page
        .locator("lens-catalogue")
        .locator('[part~="lens-string-form"]')
        .first();
    await expect(stringForm).toBeVisible();

    await stringForm.locator("button").click();

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

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 (cont.) — Catalogue edge cases
// ─────────────────────────────────────────────────────────────────────────────

test("6.5 whitespace-only string input in catalogue should be rejected by validation", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    await catalogue.getByText("First name", { exact: true }).click();
    await page.waitForTimeout(200);

    const field = catalogue.locator('[part~="lens-string-formfield"]').first();
    await field.fill("   ");
    await catalogue
        .locator('[part~="lens-string-form"]')
        .first()
        .locator("button")
        .click();
    await page.waitForTimeout(200);

    const isInvalid = await page.evaluate(() => {
        const input = document
            .querySelector("lens-catalogue")
            ?.shadowRoot?.querySelector(
                '[part~="lens-string-formfield"]',
            ) as HTMLInputElement | null;
        return input ? !input.validity.valid : false;
    });
    expect(isInvalid).toBe(true);
    expect((await getChipTexts(page)).length).toBe(0);
});

test("6.6 HTML content in string input is stored as escaped literal text in the chip", async ({
    page,
}) => {
    await addStringFilter(page, "firs", "<b>test</b>");
    const chips = await getChipTexts(page);
    expect(chips.some((t) => t.includes("<b>test</b>"))).toBe(true);

    const hasBoldElement = await page.evaluate(() => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        return !!root?.querySelector('[part~="lens-searchbar-chip"] b');
    });
    expect(hasBoldElement).toBe(false);
});

test("6.7 rapid double-click on catalogue Add button creates only one chip-item value", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    await catalogue.getByText("First name", { exact: true }).click();
    await page.waitForTimeout(200);

    const field = catalogue.locator('[part~="lens-string-formfield"]').first();
    await field.fill("Olaf");

    await catalogue
        .locator('[part~="lens-string-form"]')
        .first()
        .locator("button")
        .dblclick();
    await page.waitForTimeout(300);

    const chipItemCount = await page.evaluate(() => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        return (
            root?.querySelectorAll('[part~="lens-searchbar-chip-item"]')
                .length ?? 0
        );
    });
    expect(chipItemCount).toBe(1);
});

test("6.10 date range with start date after end date shows a validation error", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    await catalogue.getByText("Date of birth", { exact: true }).click();
    await page.waitForTimeout(200);

    const dateForm = catalogue
        .locator('[part~="lens-date-input-form"]')
        .first();
    await expect(dateForm).toBeVisible();

    const dateInputs = dateForm.locator('[part~="lens-date-input-formfield"]');
    await dateInputs.nth(0).fill("2024-01-01");
    await dateInputs.nth(1).fill("2020-01-01");
    await page.waitForTimeout(200);
    await dateForm.locator("button").click();
    await page.waitForTimeout(200);

    const isInvalid = await page.evaluate(() => {
        const cat = document.querySelector("lens-catalogue")?.shadowRoot;
        const inputs = cat?.querySelectorAll(
            '[part~="lens-date-input-formfield"]',
        ) as NodeListOf<HTMLInputElement> | undefined;
        return inputs?.[0] ? !inputs[0].validity.valid : false;
    });
    expect(isInvalid).toBe(true);
    expect((await getChipTexts(page)).length).toBe(0);
});

test("6.11 adding a criterion from catalogue while the search bar autocomplete is open works without error", async ({
    page,
}) => {
    const searchInput = page
        .locator('[part~="lens-searchbar-input"]')
        .first();
    await searchInput.click();
    await searchInput.fill("male");
    await expect(
        page.locator('[part~="lens-searchbar-autocomplete-options"]'),
    ).toBeVisible();

    // Click in catalogue — focus leaves the search bar, autocomplete closes
    const catalogue = page.locator("lens-catalogue");
    await catalogue.getByText("First name", { exact: true }).click();
    await page.waitForTimeout(200);

    const field = catalogue.locator('[part~="lens-string-formfield"]').first();
    await field.fill("Olaf");
    await catalogue
        .locator('[part~="lens-string-form"]')
        .first()
        .locator("button")
        .click();
    await page.waitForTimeout(300);

    const chips = await getChipTexts(page);
    expect(chips.some((t) => t.includes("Olaf"))).toBe(true);
    await expect(
        page.locator('[part~="lens-searchbar-input"]').first(),
    ).toBeVisible();
});
