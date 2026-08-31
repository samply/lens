import type { Catalogue, Category, Criteria } from "../types/catalogue";

/** Shorter terms match too much to be useful, see the `type_more_message` translation. */
const minimumTermLength = 2;

/** Keeps the dropdown short and the search cheap on large catalogues. */
export const defaultMatchLimit = 50;

/** A node of the catalogue tree on the way down to a match. */
export type TreeNode = {
    key: string;
    subCategoryName: string | null;
    /** the label the tree shows for the node */
    name: string;
};

export type OpenTreeNodes = Map<
    string,
    { key: string; subCategoryNames: string[] | null }
>;

export type CatalogueMatch = {
    /** the category the match lives in */
    categoryKey: string;
    /** the criterion's name, or the category's name for a category match */
    name: string;
    description?: string;
    /** the criterion the tree should reveal, undefined for a category match. A
     * single-select scrolls to the criterion's row, an autocomplete prefills its
     * input with it */
    criterionKey?: string;
    /** the nodes from the top of the catalogue down to the category, all of which
     * have to be open for the match to be visible in the tree */
    chain: TreeNode[];
};

/**
 * Lowercase the text and strip accents so that "rhabdo" matches "Rhabdomyosarkom"
 * and "tumorentitat" matches "Tumorentität".
 * @param text the text to normalize
 * @returns the normalized text
 */
const normalize = (text: string): string =>
    text
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

/**
 * @param category the category to describe
 * @returns the category as a node of the tree
 */
const treeNode = (category: Category): TreeNode => {
    const subCategoryName =
        "subCategoryName" in category && category.subCategoryName
            ? category.subCategoryName
            : null;

    return {
        key: category.key,
        subCategoryName,
        name: subCategoryName ?? category.name,
    };
};

/**
 * A criterion matches if the term is part of its name, key or description. ICD-10
 * criteria are named by their code, so the human readable text is in the description.
 * @param criterion the criterion to test
 * @param term the normalized search term
 * @returns whether the criterion or any of its subgroup criteria match
 */
const matchesCriterion = (criterion: Criteria, term: string): boolean => {
    if (criterion.visible === false) return false;

    if (
        normalize(criterion.name).includes(term) ||
        normalize(criterion.key).includes(term) ||
        (criterion.description !== undefined &&
            normalize(criterion.description).includes(term))
    ) {
        return true;
    }

    // Subgroup criteria are not rendered, so a match inside a subgroup counts for the parent
    return (
        criterion.subgroup?.some((child) => matchesCriterion(child, term)) ??
        false
    );
};

/**
 * Collect the catalogue entries matching the search term, in tree order.
 * @param catalogue the catalogue to search
 * @param term the search term as typed by the user
 * @param limit the maximum number of matches to return
 * @returns the matches, empty for a term that is too short
 */
export const searchCatalogue = (
    catalogue: Catalogue,
    term: string,
    limit: number = defaultMatchLimit,
): CatalogueMatch[] => {
    const normalizedTerm = normalize(term.trim());
    if (normalizedTerm.length < minimumTermLength) return [];

    const matches: CatalogueMatch[] = [];

    const search = (category: Category, ancestors: TreeNode[]): void => {
        if (matches.length >= limit) return;

        const chain = [...ancestors, treeNode(category)];
        const name = chain[chain.length - 1].name;

        if (normalize(name).includes(normalizedTerm)) {
            matches.push({ categoryKey: category.key, name, chain });
        }

        if (category.fieldType === "group") {
            category.childCategories.forEach((child) => search(child, chain));
            return;
        }

        if (
            category.fieldType !== "single-select" &&
            category.fieldType !== "autocomplete"
        ) {
            return;
        }

        for (const criterion of category.criteria) {
            if (matches.length >= limit) return;
            if (!matchesCriterion(criterion, normalizedTerm)) continue;

            matches.push({
                categoryKey: category.key,
                name: criterion.name,
                description: criterion.description,
                criterionKey: criterion.key,
                chain,
            });
        }
    };

    catalogue.forEach((category) => search(category, []));
    return matches;
};

/**
 * Open the given nodes, keeping the subCategoryNames of nodes that are already open.
 * Categories can share a key and are then told apart by their subCategoryName.
 * @param openTreeNodes the open tree nodes
 * @param chain the nodes to open
 * @returns the open tree nodes
 */
export const addOpenNodes = (
    openTreeNodes: OpenTreeNodes,
    chain: TreeNode[],
): OpenTreeNodes => {
    for (const { key, subCategoryName } of chain) {
        const node = openTreeNodes.get(key);

        if (node === undefined) {
            openTreeNodes.set(key, {
                key,
                subCategoryNames: subCategoryName ? [subCategoryName] : null,
            });
            continue;
        }

        if (subCategoryName === null) continue;

        if (node.subCategoryNames === null) {
            node.subCategoryNames = [subCategoryName];
        } else if (!node.subCategoryNames.includes(subCategoryName)) {
            node.subCategoryNames.push(subCategoryName);
        }
    }

    return openTreeNodes;
};
