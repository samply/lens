import type { Criteria } from "../types/treeData";

export const addPercentageSignToCriteria = (criteria: Criteria[]): void => {
    criteria.forEach((criterion: Criteria, index: number) => {
        criterion.name.length === 3 &&
        criteria.splice(index + 1, 0, {
            ...criterion,
            name: criterion.name + ".%",
            key: criterion.key + ".%",
            description: `search for all subgroups of ${criterion.name}`,
        });
    });
};
