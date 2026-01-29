// Parse CSV line with proper handling of quoted fields
const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    result.push(current.trim());
    return result;
};

// Parse CSV file to JSON
export const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }

    // Get headers
    const headers = parseCSVLine(lines[0]);

    // Validate headers
    const requiredHeaders = ['chuanqtkt', 'qdbanhanh', 'chuyenkhoa', 'tenqtkt'];
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasAllHeaders) {
        throw new Error(`CSV must have columns: ${requiredHeaders.join(', ')}`);
    }

    // Parse data rows
    const records = [];
    const skippedRows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length !== headers.length) {
            skippedRows.push({
                row: i + 1,
                expected: headers.length,
                actual: values.length,
                content: lines[i].substring(0, 100) + '...'
            });
            continue;
        }

        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index];
        });

        records.push(record);
    }

    // Log skipped rows for debugging
    if (skippedRows.length > 0) {
        console.warn(`Skipped ${skippedRows.length} rows due to column mismatch:`);
        console.table(skippedRows.slice(0, 10)); // Show first 10 skipped rows
    }

    console.log(`✅ Parsed ${records.length} records from ${lines.length - 1} total rows`);

    return records;
};

// Read file as text
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
};
