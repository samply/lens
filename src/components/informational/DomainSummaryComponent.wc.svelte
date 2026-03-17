<svelte:options
    customElement={{
        tag: "lens-domain-summary",
        extend: withTailwind,
    }}
/>

<script lang="ts">
    import { TriangleAlert } from "lucide-svelte";
    import { withTailwind } from "../../helpers/tailwind";
    import { catalogue } from "../../stores/catalogue";
    import { queryStore } from "../../stores/query";
    import Tooltip from "./Tooltip.svelte";
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
        function visit(node: CatalogueElement): void {
            if (node.type === "CatalogueGroup") {
                for (const element of node.elements) {
                    visit(element);
                }
            } else {
                const domains =
                    "domains" in node ? (node.domains ?? undefined) : undefined;
                map[node.key] = domains;
            }
        }
        for (const node of nodes) {
            visit(node);
        }
        return map;
    }

    function collectAllDomains(
        domainMap: Record<string, string[] | undefined>,
    ): string[] {
        const domainsList: string[] = [];
        for (const domains of Object.values(domainMap)) {
            if (!domains) continue;
            for (const domain of domains) {
                if (!domainsList.includes(domain)) {
                    domainsList.push(domain);
                }
            }
        }
        return domainsList;
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

    type Chip = { key: string; name: string; isActive: boolean };

    const chips = $derived.by((): Chip[] => {
        const domainMap = buildDomainMap($catalogue);
        const allDomains = collectAllDomains(domainMap);
        if (allDomains.length === 0) return [];

        const hasItems = $queryStore.bars.some((b) => b.items.length > 0);
        if (!hasItems) {
            return allDomains.map((k) => ({
                key: k,
                name: k,
                isActive: true,
            }));
        }

        const activeKeys: string[] = [];

        for (const bar of $queryStore.bars) {
            if (bar.items.length === 0) continue;
            const barResult = intersectBarDomains(
                bar.items,
                domainMap,
                allDomains,
            );
            if (barResult !== null) {
                for (const k of barResult) {
                    if (!activeKeys.includes(k)) {
                        activeKeys.push(k);
                    }
                }
            }
        }

        return allDomains.map((k) => ({
            key: k,
            name: k,
            isActive: activeKeys.includes(k),
        }));
    });

    const hasActiveDomains = $derived(chips.some((chip) => chip.isActive));
</script>

{#if chips.length > 0}
    <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-(--font-color)"
            >{translate("domain_summary_label") ?? "Searched domains:"}</span
        >
        <div class="flex flex-wrap gap-1">
            {#each chips as chip (chip.key)}
                <span
                    class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                        chip.isActive
                            ? "border-(--font-color) bg-(--font-color) text-white"
                            : "border-(--light-gray) bg-transparent text-(--gray) opacity-50"
                    }`}
                >
                    {chip.name}
                </span>
            {/each}
        </div>
        {#if !hasActiveDomains}
            <Tooltip message={translate("domain_summary_conflict")}>
                <span
                    class="inline-flex text-(--orange,#f59e0b)"
                    aria-label={translate("domain_summary_conflict")}
                >
                    <TriangleAlert size={16} aria-hidden="true" />
                </span>
            </Tooltip>
        {/if}
    </div>
{/if}
