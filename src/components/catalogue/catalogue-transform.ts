import type { Catalogue, Category } from "../../types/catalogue";

export function transformCatalogue(catalogue: Catalogue): Catalogue {
    return catalogue.map((category) => {
        const result = { ...category };

        if (Array.isArray(category.infoButtonText)) {
            const infoText = category.infoButtonText.join(" ");
            const match = infoText.match(
                /Enthalten in den Kohorten:\s*\{([^}]*)\}/,
            );

            if (match) {
                result.cohort = match[1]
                    .split(",")
                    .map((cohort) => cohort.trim().replace(/['"]/g, ""))
                    .filter(Boolean);
            }
        }

        if (category.fieldType === "group" && result.fieldType === "group") {
            if (Array.isArray(category.childCategories)) {
                result.childCategories = transformCatalogue(
                    category.childCategories,
                );
            }
        }
        return result;
    });
}
export function filterCatalogue(
    catalogue: Catalogue,
    selectedCohorts: string[],
): Catalogue {
    return catalogue.reduce((result: Category[], category) => {
        const hasCohort =
            "cohort" in category &&
            Array.isArray(category.cohort) &&
            category.cohort.length > 0;

        const hasMatchingCohort =
            hasCohort &&
            category.cohort?.some((cohort) => selectedCohorts.includes(cohort));

        if (category.fieldType === "group") {
            const filteredChildren = filterCatalogue(
                category.childCategories,
                selectedCohorts,
            );

            if (filteredChildren.length > 0) {
                result.push({ ...category, childCategories: filteredChildren });
            }
        } else if (!hasCohort || hasMatchingCohort) {
            result.push(category);
        }

        return result;
    }, []);
}
