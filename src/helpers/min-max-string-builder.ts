/**
 * Format a min/max object as a string.
 * @param min The minimum value
 * @param max The maximum value
 * @returns A string representation of the min/max range.
 */
export const getMinMax = (
    min: string | number | null,
    max: string | number | null,
): string => {
    if (min && max && min === max) return `${min}`;
    if (min && max) return `${min} - ${max}`;
    if (!min && max) return `≤ ${max}`;
    if (min && !max) return `≥ ${min}`;
    return "";
};
