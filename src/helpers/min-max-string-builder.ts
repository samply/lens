/**
 * Format a min/max object as a string.
 * @param {{min?: string | number, max?: string | number}} param0
 *   min: The minimum value (string or number, optional).
 *   max: The maximum value (string or number, optional).
 * @returns {string} A string representation of the min/max range.
 */
export const getMinMax = ({
    min,
    max,
}: {
    min?: string | number;
    max?: string | number;
}): string => {
    if (min && max && min === max) return `${min}`;
    if (min && max) return `${min} - ${max}`;
    if (!min) return `≤ ${max}`;
    return `≥ ${min}`;
};
