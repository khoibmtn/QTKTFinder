import Fuse from 'fuse.js';

// Fuzzy search configuration
const fuseOptions = {
    keys: ['tenqtkt', 'chuyenkhoa'],
    threshold: 0.4,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    includeScore: true,
    includeMatches: true
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

// Check if text matches fuzzy pattern (for ordered character matching)
export const fuzzyMatch = (text, pattern) => {
    if (!pattern || !text) return false;

    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    let patternIndex = 0;

    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
        if (textLower[i] === patternLower[patternIndex]) {
            patternIndex++;
        }
    }

    return patternIndex === patternLower.length;
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
