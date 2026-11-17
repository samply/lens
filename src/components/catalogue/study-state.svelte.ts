import type { Catalogue } from "../../types/catalogue";
import { filterCatalogue } from "./catalogue-transform";

export const studyState = $state({
    studies: [] as string[],
    alias: [] as string[],
    activeButton: [] as boolean[],
});

const colorTable = [
    "#3366cc",
    "#1f9d6b",
    "#c8443a",
    "#b86e0a",
    "#8a56c9",
    "#1f8fa6",
];
const inactiveColor = "#a3a9b3";

export function addStudy(name: string, alias?: string): void {
    studyState.studies.push(name);
    const al = alias ? alias : studyState.studies.length.toString();
    studyState.alias.push(al);
    studyState.activeButton.push(true);
}

export function addStudies(names: string[]): void {
    for (const name of names) {
        addStudy(name);
    }
}

export function getSelectedStudies(): string[] {
    return studyState.studies.filter(
        (_, index) => studyState.activeButton[index] === true,
    );
}

export function getStudyColor(index: number): string {
    return colorTable[index % colorTable.length];
}

export function toggleStudy(index: number): void {
    studyState.activeButton[index] = !studyState.activeButton[index];
}

export function selectAllStudies(): void {
    for (let i = 0; i < studyState.activeButton.length; i++) {
        studyState.activeButton[i] = true;
    }
}

export function countDataElements(catalogue: Catalogue): number {
    let count = 0;
    for (const category of catalogue) {
        if (category.fieldType === "group") {
            count += countDataElements(category.childCategories);
        } else {
            count++;
        }
    }
    return count;
}

export function countDataElementsOfStudy(
    catalogue: Catalogue,
    study: string,
): number {
    return (
        countDataElements(filterCatalogue(catalogue, [study])) -
        countDataElements(filterCatalogue(catalogue, []))
    );
}

export function getCohortParam(cohort: string): {
    study: string;
    name: string;
    color: string;
    active: boolean;
} {
    const index = studyState.studies.indexOf(cohort);
    if (index === -1) {
        return {
            study: cohort,
            name: cohort,
            color: inactiveColor,
            active: false,
        };
    }
    const active = studyState.activeButton[index] === true;
    return {
        study: cohort,
        name: studyState.alias[index],
        color: active ? getStudyColor(index) : inactiveColor,
        active,
    };
}
