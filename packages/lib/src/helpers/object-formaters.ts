import type { Criteria } from "../types/treeData";

/**
 * Takes a criteria array and adds a .% option for searching for all subgroups
 * @param criteria the array of criteria. 
 * Make sure to only criteria which are structured clones to avoid altering the store!
 * @returns the array of criteria with the .% option
 */
export const addPercentageSignToCriteria = (criteria: Criteria[]): Criteria[] => {

    let criteriaGroup = new Set();
    
    criteria.forEach((criterion: Criteria, index: number) => {

        const regex = new RegExp(/^[A-Z][0-9]{2}\.[0-9]*/);

        if(!regex.test(criterion.key)) {
            return;
        }

        if(criteriaGroup.has(criterion.key.split('.')[0])) {
            return
        }

        criteria.splice(index - 1, 0, {
            ...criterion,
            name: criterion.name.split('.')[0] + ".%",
            key: criterion.key.split('.')[0] + ".%",
            /**
             * TODO: add configuration for text
            */
            description: `search for all subgroups of ${criterion.name.split('.')[0]}`,
        });

        criteriaGroup.add(criterion.key.split('.')[0]);
    });

    criteria = criteria.sort((a, b) => {
        if(a.key < b.key) {
            return -1;
        }
        if(a.key > b.key) {
            return 1;
        }
        return 0;
    })
  
    return criteria;
};
