/**
 * Helper to safely get a single string value from query params
 * Express query params can be string | string[] | undefined
 */
export const getQueryParam = (value: string | string[] | undefined): string | undefined => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
};

/**
 * Helper to safely get an array of strings from query params
 */
export const getQueryParamArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
};
