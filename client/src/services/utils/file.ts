/**
 * Converts a file size in bytes to a human-readable string (KB, MB, GB, TB, etc.)
 * using the ISO/IEC 80000 decimal prefixes (powers of 1000).
 * * @param bytes The file size in bytes (number).
 * @param decimals The number of decimal places to include (number).
 * @returns The formatted file size string (e.g., "1.23 MB").
 */
export function formatFileSizeISO(bytes: number, decimals: number = 2): string {
  // 1. Handle edge case for 0 bytes
  if (bytes === 0) {
    return '0 Bytes';
  }

  // 2. Define the conversion base for ISO/SI units (powers of 1000)
  const k = 1000;

  // 3. Define the suffixes
  const sizes: string[] = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // 4. Determine the appropriate unit index (i)
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 5. Ensure the decimals is a non-negative integer
  const numDecimals = Math.max(0, decimals);

  // 6. Calculate the formatted value and append the unit
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(numDecimals));

  return `${formattedSize} ${sizes[i]}`;
}
