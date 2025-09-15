/**
 * Format a min/max object as a string.
 * @param {{min?: string | number, max?: string | number}} param0
 *   min: The minimum value (string or number, optional).
 *   max: The maximum value (string or number, optional).
 * @returns {string} A string representation of the min/max range.
 */
export const getMinMax = (
    min: string | number | null,
    max: string | number | null,
): string => {
    if (min !== null && max !== null && min === max) return `${min}`;
    if (min !== null && max !== null) return `${min} - ${max}`;
    if (min === null && max !== null) return `≤ ${max}`;
    if (min !== null && max === null) return `≥ ${min}`;
    return "";
};
