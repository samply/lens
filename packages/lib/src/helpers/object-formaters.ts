import type { Criteria } from "../types/treeData";

/**
 * Takes a criteria array and adds a .% option for searching for all subgroups
 * @param criteria the array of criteria
 * @returns the array of criteria with the .% option
 */
export const addPercentageSignToCriteria = (criteria: Criteria[]): Criteria[] => {
    /**
     * dereference the array to avoid side effects
     */
    criteria = Object.assign([], criteria);

    criteria.forEach((criterion: Criteria, index: number) => {
        criterion.name.length === 3 &&
        criteria.splice(index + 1, 0, {
            ...criterion,
            name: criterion.name + ".%",
            key: criterion.key + ".%",
            description: `search for all subgroups of ${criterion.name}`,
        });
    });
    return criteria;
};
