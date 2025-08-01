/**
 * Date utility functions for formatting dates in various formats
 */

/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, 4th, etc.)
 * @param day - The day number to convert
 * @returns The ordinal string representation
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Formats a date to "24th February, 2025" format
 * @param date - The date to format (can be Date object or string)
 * @returns Formatted date string in "DDth Month, YYYY" format
 */
export function formatDateToReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();

  const ordinalDay = `${day}${getOrdinalSuffix(day)}`;

  return `${ordinalDay} ${month}, ${year}`;
}

/**
 * Formats a date to standard DD/MM/YYYY format
 * @param date - The date to format (can be Date object or string)
 * @returns Formatted date string in "DD/MM/YYYY" format
 */
export function formatDateToStandard(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();

  return `${day}/${month}/${year}`;
}

/**
 * Calculates age in years from date of birth
 * @param dateOfBirth - The date of birth (can be Date object or string)
 * @returns Age in years as a string with "years" suffix
 */
export function calculateAge(dateOfBirth: Date | string): string {
  const dobObj =
    typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

  if (isNaN(dobObj.getTime())) {
    throw new Error('Invalid date of birth provided');
  }

  const today = new Date();
  let age = today.getFullYear() - dobObj.getFullYear();
  const monthDiff = today.getMonth() - dobObj.getMonth();

  // If birthday hasn't occurred this year yet, subtract 1 from age
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dobObj.getDate())
  ) {
    age--;
  }

  return `${age} years`;
}

/**
 * Formats a duration given in milliseconds to a human-readable string.
 * Example output: "1day, 2hrs, 30 minutes, 20 secs"
 * @param ms - Duration in milliseconds
 * @returns Readable duration string
 */
export function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    throw new Error('Invalid duration provided');
  }

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);

  return parts.join(', ');
}
