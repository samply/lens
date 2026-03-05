<svelte:options
    customElement={{
        tag: "lens-domain-summary",
    }}
/>

<script lang="ts">
    import { catalogue } from "../../stores/catalogue";
    import { queryStore } from "../../stores/query";
    import { lensOptions } from "../../stores/options";
    import type {
        CatalogueElement,
        LensCatalogue,
    } from "../../types/catalogue";
    import type { QueryItem } from "../../types/query";
    import { translate } from "../../helpers/translations";

    /**
     * Flattens the catalogue tree into a plain object from key → domains (string[] | undefined).
     */
    function buildDomainMap(
        nodes: LensCatalogue,
    ): Record<string, string[] | undefined> {
        const map: Record<string, string[] | undefined> = {};
        const visit = (node: CatalogueElement): void => {
            if (node.type === "CatalogueGroup") {
                node.elements.forEach(visit);
            } else {
                const domains =
                    "domains" in node ? (node.domains ?? undefined) : undefined;
                map[node.key] = domains;
            }
        };
        nodes.forEach(visit);
        return map;
    }

    /**
     * Compute the domain keys searched for a single query bar (AND logic):
     * Start from the full set of configured domain keys and intersect
     * with each item's domain restriction.
     */
    function intersectBarDomains(
        items: QueryItem[],
        domainMap: Record<string, string[] | undefined>,
        allDomainKeys: string[],
    ): string[] | null {
        let current: string[] = [...allDomainKeys];
        for (const item of items) {
            const domains = domainMap[item.key];
            if (domains && domains.length > 0) {
                current = current.filter((d) => domains.includes(d));
            }
        }
        return current.length > 0 ? current : null;
    }

    type Chip = { key: string; name: string; color: string | null };

    const chips = $derived.by((): Chip[] => {
        const opts = $lensOptions;
        if (!opts?.domains || Object.keys(opts.domains).length === 0) return [];

        const allDomainKeys = Object.keys(opts.domains);
        const domainMap = buildDomainMap($catalogue);

        const hasItems = $queryStore.bars.some((b) => b.items.length > 0);
        if (!hasItems) return [];

        let searchedKeys: string[] = [];
        let allBarsConflict = true;

        for (const bar of $queryStore.bars) {
            if (bar.items.length === 0) continue;
            const barResult = intersectBarDomains(
                bar.items,
                domainMap,
                allDomainKeys,
            );
            if (barResult !== null) {
                allBarsConflict = false;
                for (const k of barResult) {
                    if (!searchedKeys.includes(k)) searchedKeys.push(k);
                }
            }
        }

        if (allBarsConflict) {
            return [
                {
                    key: "__conflict__",
                    name:
                        translate("domain_summary_conflict") ??
                        "No domain matches criteria",
                    color: null,
                },
            ];
        }

        return allDomainKeys
            .filter((k) => searchedKeys.includes(k))
            .map((k) => ({
                key: k,
                name: opts.domains![k]?.name ?? k,
                color: opts.domains![k]?.color ?? null,
            }));
    });
</script>

{#if chips.length > 0}
    <div part="lens-domain-summary">
        <span part="lens-domain-summary-label"
            >{translate("domain_summary_label") ?? "Searched domains:"}</span
        >
        <div part="lens-domain-summary-chips">
            {#each chips as chip (chip.key)}
                {#if chip.key === "__conflict__"}
                    <span
                        part="lens-domain-summary-chip lens-domain-summary-chip-conflict"
                        >{chip.name}</span
                    >
                {:else}
                    <span
                        part="lens-domain-summary-chip"
                        style="background-color: {chip.color ?? 'var(--gray)'};"
                        >{chip.name}</span
                    >
                {/if}
            {/each}
        </div>
    </div>
{/if}

<style>
    [part~="lens-domain-summary"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
        flex-wrap: wrap;
    }

    [part~="lens-domain-summary-label"] {
        font-family: var(--font-family);
        font-size: var(--font-size-s);
        color: var(--gray);
        white-space: nowrap;
    }

    [part~="lens-domain-summary-chips"] {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    [part~="lens-domain-summary-chip"] {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: var(--font-size-xs);
        font-family: var(--font-family);
        font-weight: 600;
        white-space: nowrap;
        color: #ffffff;
        line-height: 1.6;
    }

    [part~="lens-domain-summary-chip-conflict"] {
        background-color: var(--red);
        font-weight: 400;
    }
</style>
