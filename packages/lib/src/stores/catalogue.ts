import { writable } from "svelte/store";
import type { Category, TreeNode } from "../types/treeData";
import type { QueryItem } from "../types/queryData";

/**
 * store to hold the catalogue
 * populated by the searchbar or the catalogue
 * DISCUSSION: should there be a seperate component without markup just for populating for the catalogue?
 * there could be some corner cases for that
 */
export const catalogue = writable<Category[]>([]);

export const openTreeNodes = writable<Map<string, {key: string, subCategoryNames: string[] | null}>>(new Map());

export const activeNumberInputs = writable<QueryItem[]>([]);


/**
 * get the bottom level items of a category
 * @param category string of the category you want to get the bottom level items from
 * @returns array of strings containing the bottom level items' keys
 */
export const getCriteria = (category: string): string[] => {
    let bottomLevelItems

    catalogue.subscribe((catalogue) => {
        bottomLevelItems = getBottomLevelItems(catalogue, category)
    })
    
    return bottomLevelItems
}

/**
 * @param item the TreeNode you want to check
 * @returns true if the item is a bottom level item, false otherwise
 */
const itemIsBottomLevel = (item: TreeNode): Boolean => {
    if (item instanceof Array || 'childCategories' in item || 'criteria' in item || 'aggregatedValue' in item || 'fieldType' in item) {
        return false
    }
    return true;
}

/**
 * @param item takes any item from the catalogue
 * @param category string of the category you want to get the bottom level items from
 * @returns an array of strings containing the bottom level items' keys
 */
const getBottomLevelItems = (item: TreeNode, category: string): string[] => {

    /**
     * FIX ME:
     *  there seems to be a race condition where the catalogue is not yet loaded and the function is called right away
     *  the data being a string comes from the data being passed as a json string
     */
    if (typeof item === 'string') {
        return
    }

    if (item instanceof Array) {
        return item.map((childCategory) => getBottomLevelItems(childCategory, category)).flat().filter(item => item !== undefined)
    }

    if ('childCategories' in item) {
        return item.childCategories.map((childCategory) => getBottomLevelItems(childCategory, category)).flat()
    }

    if ('criteria' in item && item.key === category) {
        return item.criteria.map((criterion) => getBottomLevelItems(criterion, category)).flat()
    }


    /**
     * TODO:
     * find deeper nested items to search for eg glioma
     * not needed for right now
     */

    // if ('criteria' in item) {
    //     return item.criteria.map((criterion) => {
    //         if (criterion.aggregatedValue) {
    //             return getBottomLevelItems(criterion, category)
    //         }
    //     }).flat()
    // }

    // if ('aggregatedValue' in item) {
    //     return item.aggregatedValue.map((aggregatedValue) => getBottomLevelItems(aggregatedValue, category)).flat()
    // }

    if (itemIsBottomLevel(item) && 'key' in item) {
        return [item.key]
    }

    return
}



export const getCriteriaNamesFromKey = (catalogue: Category[], key: string): string[] => {
    
    let criteriaNames: string[] = []


    if(catalogue.length === 0 || key === '') {
        return criteriaNames
    }

    catalogue.forEach((category: Category):void => {
        if ('childCategories' in category) {
            category.childCategories.forEach((childCategory: Category):void => {
                if ('criteria' in childCategory && childCategory.key === key) {
                    criteriaNames = childCategory.criteria.map((criterion) => criterion.name)
                }
            })
        }
    })

    if(criteriaNames.length === 0) {
        criteriaNames = ['20', '30', '40', '50',]
    }
    return criteriaNames
}

