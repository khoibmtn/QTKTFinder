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
 * WORD-based fuzzy match
 * Searches for words (not characters) within the text.
 * Each word in the pattern must be found as a substring in the text.
 */
export const fuzzyMatch = (text, pattern) => {
    if (!pattern || !text) return false;

    const textLower = text.toLowerCase();
    const patternWords = pattern.toLowerCase().trim().split(/\s+/);

    // Every word in the pattern must be found in the text
    return patternWords.every(word => {
        if (word.length === 0) return true;
        return textLower.includes(word);
    });
};

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
