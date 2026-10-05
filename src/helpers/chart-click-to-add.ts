import { v4 as uuidv4 } from "uuid";
import type { Catalogue, Criteria } from "../types/catalogue";
import type { QueryItem, QueryValue } from "../types/queryData";
import { getCategoryFromKey } from "../stores/catalogue";

/**
 * finds the first criterion matching the predicate, descending into subgroups.
 * Criteria that are not visible in the catalogue are not searched.
 */
const findCriterion = (
    criteria: Criteria[],
    predicate: (criterion: Criteria) => boolean,
): Criteria | undefined => {
    for (const criterion of criteria) {
        if (criterion.visible === false) continue;
        if (predicate(criterion)) return criterion;
        if (criterion.subgroup !== undefined) {
            const match = findCriterion(criterion.subgroup, predicate);
            if (match !== undefined) return match;
        }
    }
    return undefined;
};

/**
 * Builds the query item for a value that a chart displays, e.g. the stratum
 * code behind a clicked pie slice.
 * @param catalogue - the catalogue to look the value up in
 * @param dataKey - the dataKey of the chart, must be the key of a single-select, autocomplete or number category
 * @param value - the stratum code, not the label the chart displays for it
 * @param groupRange - the range a numeric value stands for, see the chart's groupRange prop
 * @returns the query item to add to the query, or undefined if the catalogue has nothing matching the value
 */
export function queryItemFromChartValue(
    catalogue: Catalogue,
    dataKey: string,
    value: string,
    groupRange?: number,
): QueryItem | undefined {
    const category = getCategoryFromKey(catalogue, dataKey);
    if (category === undefined) return undefined;

    let queryValue: QueryValue;

    if (category.fieldType === "number") {
        const min = parseInt(value);
        if (isNaN(min)) return undefined;
        const max = min + (groupRange ?? 1) - 1;
        queryValue = {
            name: groupRange === undefined ? value : `${min} - ${max}`,
            value: { min, max },
            queryBindId: uuidv4(),
        };
    } else if (
        category.fieldType === "single-select" ||
        category.fieldType === "autocomplete"
    ) {
        // The key takes precedence over the name across the whole category, so
        // that the result does not depend on the order of the criteria
        const criterion =
            findCriterion(category.criteria, (c) => c.key === value) ??
            findCriterion(category.criteria, (c) => c.name === value);
        if (criterion === undefined) return undefined;
        queryValue = {
            name: criterion.name,
            value: criterion.aggregatedValue ?? criterion.key,
            description: criterion.description,
            queryBindId: uuidv4(),
        };
    } else {
        return undefined;
    }

    return {
        id: uuidv4(),
        key: category.key,
        name: category.name,
        type: category.type,
        values: [queryValue],
    };
}
