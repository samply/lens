/**
 * Section 9 — AST verification.
 *
 * Each test adds criteria via the catalogue, fires a search, and asserts that
 * the AST emitted by the library (logged by the demo as "AST: <json>") matches
 * the expected structure. The console listener must be registered before the
 * search button is clicked.
 */
import { test, expect } from "@playwright/test";
import {
    addOrBar,
    captureAstOnNextSearch,
    clickSearchButton,
} from "./searchbar-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[part~="lens-searchbar-input"]').first().waitFor();
});

test("9.1 empty search emits an OR node with no children", async ({ page }) => {
    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({ operand: "OR", children: [] });
});

test("9.2 single-select criterion Gender:male produces the correct AST leaf", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    await catalogue
        .getByText("Donor/Clinical Information", { exact: true })
        .click();
    await page.waitForTimeout(300);
    await catalogue.locator("text=Gender").first().click();
    await page.waitForTimeout(300);
    await catalogue
        .locator("text=male")
        .first()
        .locator("..")
        .locator("button")
        .first()
        .click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "male" }],
                    },
                ],
            },
        ],
    });
});

test("9.3 string input First name:Olaf produces the correct AST leaf", async ({
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
        .click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "first-name",
                        operand: "OR",
                        children: [
                            { key: "first-name", type: "EQUALS", value: "Olaf" },
                        ],
                    },
                ],
            },
        ],
    });
});

test("9.4 date range 2020-01-01 to 2024-01-01 produces a BETWEEN leaf with string dates", async ({
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
    await dateInputs.nth(0).fill("2020-01-01");
    await dateInputs.nth(1).fill("2024-01-01");
    await dateForm.locator("button").click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "date-of-birth",
                        operand: "OR",
                        children: [
                            {
                                key: "date-of-birth",
                                type: "BETWEEN",
                                value: { min: "2020-01-01", max: "2024-01-01" },
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("9.5 number range Body weight 50-100 produces a BETWEEN leaf with numeric values", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");
    await catalogue.getByText("Body weight", { exact: true }).click();
    await page.waitForTimeout(200);

    const numberForm = catalogue
        .locator('[part~="lens-number-input-form"]')
        .first();
    await expect(numberForm).toBeVisible();
    const numberInputs = numberForm.locator(
        '[part~="lens-number-input-formfield"]',
    );
    await numberInputs.nth(0).fill("50");
    await numberInputs.nth(1).fill("100");
    await numberForm.locator("button").click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "body_weight",
                        operand: "OR",
                        children: [
                            {
                                key: "body_weight",
                                type: "BETWEEN",
                                value: { min: 50, max: 100 },
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("9.6 AND combination of Gender:male and Sample ID:S1 produces an AND node with two children", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");

    // Add Gender: male
    await catalogue
        .getByText("Donor/Clinical Information", { exact: true })
        .click();
    await page.waitForTimeout(300);
    await catalogue.locator("text=Gender").first().click();
    await page.waitForTimeout(300);
    await catalogue
        .locator("text=male")
        .first()
        .locator("..")
        .locator("button")
        .first()
        .click();
    await page.waitForTimeout(300);

    // Add Sample ID: S1
    await catalogue.getByText("Sample ID", { exact: true }).click();
    await page.waitForTimeout(200);
    const sampleField = catalogue
        .locator('[part~="lens-string-formfield"]')
        .first();
    await sampleField.fill("S1");
    await catalogue
        .locator('[part~="lens-string-form"]')
        .first()
        .locator("button")
        .click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "male" }],
                    },
                    {
                        key: "sample-id",
                        operand: "OR",
                        children: [
                            { key: "sample-id", type: "EQUALS", value: "S1" },
                        ],
                    },
                ],
            },
        ],
    });
});

test("9.7 two OR groups Gender:male and Gender:female produce an OR node with two AND children", async ({
    page,
}) => {
    const catalogue = page.locator("lens-catalogue");

    // Add Gender: male to bar 1
    await catalogue
        .getByText("Donor/Clinical Information", { exact: true })
        .click();
    await page.waitForTimeout(300);
    await catalogue.locator("text=Gender").first().click();
    await page.waitForTimeout(300);
    await catalogue
        .locator("text=male")
        .first()
        .locator("..")
        .locator("button")
        .first()
        .click();
    await page.waitForTimeout(300);

    // Add OR bar (bar 2 becomes active)
    await addOrBar(page);

    // Gender grid has no per-row wrappers; nth(1) = female (male is index 0).
    await catalogue
        .locator('[part~="lens-add-to-query-button"]')
        .nth(1)
        .click();
    await page.waitForTimeout(300);

    const astPromise = captureAstOnNextSearch(page);
    await clickSearchButton(page);
    const ast = await astPromise;

    expect(ast).toMatchObject({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "male" }],
                    },
                ],
            },
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [
                            { key: "gender", type: "EQUALS", value: "female" },
                        ],
                    },
                ],
            },
        ],
    });
});
