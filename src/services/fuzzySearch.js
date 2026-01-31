import Fuse from 'fuse.js';

// Fuzzy search configuration - WORD based matching
const fuseOptions = {
    keys: ['tenqtkt', 'chuyenkhoa'],
    threshold: 0.3,        // Lower = more strict matching
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    includeScore: true,
    includeMatches: true,
    tokenize: true,        // Enable word tokenization
    matchAllTokens: true,  // All words must match
    shouldSort: true
};

// Search method types
export const SEARCH_METHODS = {
    FLEXIBLE: 'flexible',    // Linh hoạt - words in any order
    SEQUENTIAL: 'sequential', // Tuần tự - words in order
    EXACT: 'exact'           // Chính xác - exact phrase
};

// Create fuzzy search instance
export const createFuzzySearch = (data) => {
    return new Fuse(data, fuseOptions);
};

// Perform fuzzy search
export const fuzzySearch = (fuse, query) => {
    if (!query || query.trim() === '') {
        return [];
    }
    return fuse.search(query);
};

/**
 * FLEXIBLE (Linh hoạt) - Words in any order
 * All words must exist but order doesn't matter
 * "nội soi" matches "*nội*soi*" and "*soi*nội*"
 */
export const flexibleMatch = (text, pattern) => {
    if (!pattern || !text) return false;

    const textLower = text.toLowerCase();
    const patternWords = pattern.toLowerCase().trim().split(/\s+/);

    // Every word in the pattern must be found in the text
    return patternWords.every(word => {
        if (word.length === 0) return true;
        return textLower.includes(word);
    });
};

/**
 * SEQUENTIAL (Tuần tự) - Words must appear in order
 * "nội soi" matches "*nội*soi*" but NOT "*soi*nội*"
 */
export const sequentialMatch = (text, pattern) => {
    if (!pattern || !text) return false;

    const textLower = text.toLowerCase();
    const patternWords = pattern.toLowerCase().trim().split(/\s+/);

    let lastIndex = -1;
    return patternWords.every(word => {
        if (word.length === 0) return true;
        const index = textLower.indexOf(word, lastIndex + 1);
        if (index === -1) return false;
        lastIndex = index;
        return true;
    });
};

/**
 * EXACT (Chính xác) - Exact phrase must appear
 * "nội soi" matches "*nội soi*" only (the exact phrase with space)
 */
export const exactMatch = (text, pattern) => {
    if (!pattern || !text) return false;
    return text.toLowerCase().includes(pattern.toLowerCase().trim());
};

/**
 * Unified match function based on search method
 */
export const matchByMethod = (text, pattern, method = SEARCH_METHODS.FLEXIBLE) => {
    switch (method) {
        case SEARCH_METHODS.SEQUENTIAL:
            return sequentialMatch(text, pattern);
        case SEARCH_METHODS.EXACT:
            return exactMatch(text, pattern);
        case SEARCH_METHODS.FLEXIBLE:
        default:
            return flexibleMatch(text, pattern);
    }
};

// Legacy alias for backward compatibility
export const fuzzyMatch = flexibleMatch;

// Highlight matched text
export const highlightMatches = (text, matches) => {
    if (!matches || matches.length === 0) return text;

    const indices = matches[0].indices;
    let result = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
        result += text.substring(lastIndex, start);
        result += `<mark>${text.substring(start, end + 1)}</mark>`;
        lastIndex = end + 1;
    });

    result += text.substring(lastIndex);
    return result;
};
