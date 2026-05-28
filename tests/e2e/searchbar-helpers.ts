/**
 * Shadow DOM helpers for Lens E2E tests.
 *
 * All SearchBar content (autocomplete, chips, string inputs) renders inline
 * inside lens-search-bar-multiple's single shadow root — there is no nested
 * custom-element boundary there. Button components (lens-search-button,
 * lens-negotiate-button, lens-query-explain-button) each have their own
 * shadow root.
 */
import type { ConsoleMessage, Page } from "@playwright/test";

// ─── Search bar ──────────────────────────────────────────────────────────────

export async function typeInLastSearchBar(page: Page, text: string) {
    const input = page.locator('[part~="lens-searchbar-input"]').last();
    await input.click();
    await input.fill(text);
}

export async function typeInFirstSearchBar(page: Page, text: string) {
    const input = page.locator('[part~="lens-searchbar-input"]').first();
    await input.click();
    await input.fill(text);
}

/**
 * Click an autocomplete item by its exact criterion name.
 * Uses mousedown because the component closes the list on focusout, which
 * fires before a plain click completes.
 */
export async function clickAutocompleteItem(page: Page, exactName: string) {
    await page.evaluate((name: string) => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        const items = root?.querySelectorAll(
            '[part~="lens-searchbar-autocomplete-options-item"]',
        );
        if (!items?.length)
            throw new Error("No autocomplete items visible in shadow DOM");
        for (const item of items) {
            const nameEl = item.querySelector(
                '[part~="lens-searchbar-autocomplete-options-item-name"]',
            );
            if (nameEl?.textContent?.trim() === name) {
                item.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                return;
            }
        }
        const found = Array.from(items)
            .map(
                (i) =>
                    i
                        .querySelector(
                            '[part~="lens-searchbar-autocomplete-options-item-name"]',
                        )
                        ?.textContent?.trim() ?? "?",
            )
            .join(", ");
        throw new Error(`Item "${name}" not found. Visible: ${found}`);
    }, exactName);
}

/**
 * Add a string-type filter (e.g. First name: Olaf) via the search bar.
 * searchTerm must produce at least 2 chars to open the autocomplete.
 */
export async function addStringFilter(
    page: Page,
    searchTerm: string,
    value: string,
) {
    await typeInLastSearchBar(page, searchTerm);
    const field = page.locator('[part~="lens-string-formfield"]').first();
    await field.waitFor({ state: "visible" });
    await field.fill(value);
    await field.press("Enter");
}

export async function addOrBar(page: Page) {
    await page
        .locator('[part~="lens-searchbar-multiple-add-button"]')
        .click();
    await page.waitForTimeout(200);
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export async function clickSearchButton(page: Page) {
    await page.evaluate(() => {
        const btn = document
            .querySelector("lens-search-button")
            ?.shadowRoot?.querySelector('[part~="lens-search-button"]');
        if (!btn) throw new Error("lens-search-button not found in shadow DOM");
        (btn as HTMLElement).click();
    });
}

export async function clickNegotiateButton(page: Page) {
    await page.evaluate(() => {
        const btn = document
            .querySelector("lens-negotiate-button")
            ?.shadowRoot?.querySelector('[part~="lens-negotiate-button"]');
        if (!btn)
            throw new Error("lens-negotiate-button not found in shadow DOM");
        (btn as HTMLElement).click();
    });
}

export async function clickQueryExplainButton(page: Page) {
    await page.evaluate(() => {
        const root = document.querySelector(
            "lens-query-explain-button",
        )?.shadowRoot;
        if (!root) throw new Error("No shadow root on lens-query-explain-button");
        // InfoButtonComponent renders a <button> at the top level of the shadow root
        const btn = root.querySelector("button");
        if (!btn) throw new Error("Info button not found in query-explain shadow root");
        (btn as HTMLElement).click();
    });
}

// ─── Waiting ─────────────────────────────────────────────────────────────────

/** Wait for the demo's simulated site results to arrive (1 s timeout in demo.svelte). */
export async function waitForResults(page: Page) {
    await page.waitForTimeout(1800);
}

// ─── Assertions ──────────────────────────────────────────────────────────────

/**
 * Count how many search bar chips are visible across all OR groups.
 */
export async function getChipTexts(page: Page): Promise<string[]> {
    return page.evaluate(() => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        const chips = root?.querySelectorAll('[part~="lens-searchbar-chip"]');
        return Array.from(chips ?? []).map((c) => c.textContent?.trim() ?? "");
    });
}

export async function getOrBarCount(page: Page): Promise<number> {
    return page.evaluate(() => {
        const root = document.querySelector(
            "lens-search-bar-multiple",
        )?.shadowRoot;
        return (
            root?.querySelectorAll('[part~="lens-searchbar-multiple-wrapper"]')
                .length ?? 0
        );
    });
}

export async function isNegotiateButtonDisabled(page: Page): Promise<boolean> {
    return page.evaluate(() => {
        const btn = document
            .querySelector("lens-negotiate-button")
            ?.shadowRoot?.querySelector('[part~="lens-negotiate-button"]');
        return btn?.hasAttribute("disabled") ?? true;
    });
}

export function captureAstOnNextSearch(page: Page): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
        const timer = setTimeout(() => {
            page.off("console", handler);
            reject(new Error("AST capture timed out after 5 s"));
        }, 5000);

        function handler(msg: ConsoleMessage) {
            if (msg.text().startsWith("AST:")) {
                clearTimeout(timer);
                page.off("console", handler);
                try {
                    resolve(JSON.parse(msg.text().slice(4).trim()));
                } catch {
                    reject(new Error(`Failed to parse AST: ${msg.text()}`));
                }
            }
        }
        page.on("console", handler);
    });
}
