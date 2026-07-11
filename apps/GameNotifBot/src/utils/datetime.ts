import { normalizeWhitespace } from "./string.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Parsing user input form "mm/dd/yyyy hh:mm" for datetime into Date, to store into db. UTC
export function parseEventTimestamp(input: string): Date {
    const match = normalizeWhitespace(input).match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/); // regex for (mm/dd/yyyy hh:mm)
    if (!match) {
        throw new Error(
            `Invalid format. Expected "mm/dd/yyyy hh:mm (24-hour), but got "${input}"`,
        );
    }

    const [, mm, dd, yyyy, hh, min] = match;
    const month = Number(mm);
    const day = Number(dd);
    const year = Number(yyyy);
    const hours = Number(hh);
    const minutes = Number(min);

    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    // Guard Date.UTC automatically rolling impossible date forward.
    // Rejects the date forwarding, rejects input if they mismatch what user typed.
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day ||
        date.getUTCHours() !== hours ||
        date.getUTCMinutes() !== minutes
    ) {
        throw new Error(`Impossible calendar date: "${input}"`);
    }

    return date;
}

// Rendering timestamps as Discord tokens
export type DiscordTimestampStyle = 
    't' | // (Short time), displaying only hours and minutes        ["07:30 PM"]
    'T' | // (Long time), displaying hours, minutes, and seconds    ["07:30:40"]
    'd' | // (Short Date), displaying the month, day, and year      [07/04/1970]
    'D' | // (Long Date), displaying the date in String/ spelling out the date               [July 4, 1970]
    'f' | // (Short Date and Time), combines the short date and short time styles            [July 4, 1970 07:30 PM]
    'F' | // (Long Date and Time), Includes the day of the week, spelled-out date, and time  [Saturday, July 4, 1970 07:30 PM]
    'R';  // (Relative Time): showing how long ago or how far in the future an event is      [in 2 hours || 2 days ago]

// Converts a Date into a Discord timestamp token
export function toDiscordTimestamp(
    value: Date| string,
    style: DiscordTimestampStyle = 'F'
): string {
    const date = checkDate(value);
    const unixSeconds = Math.floor(date.getTime() / 1000); 
    return `<t:${unixSeconds}:${style}>`;
}

// Pick timestamp style based on if the time is gt 1 day or within 1 day
export function toAdaptiveDiscordTimestamp(value: Date|string): string {
    const date = checkDate(value);
    const diffMs = date.getTime() - Date.now();
    const style: DiscordTimestampStyle = diffMs <= ONE_DAY_MS ? "R" : "F";
    return toDiscordTimestamp(date, style);
}

// A function that accepts Date object or an ISO string and returns a valid Date.
// Used so functions can accept both an Date object or an ISO string return by express.
// Returns a valid Date, and throws error if the value is NaN
function checkDate(value: Date|string): Date {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Cannot render Discord timestamp from invalid date: ${String(value)}`);
    }
    return date;
}