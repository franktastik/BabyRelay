import { relativeTime } from "./relative-time";
import assert from "node:assert/strict";

function assertEqual(actual: string, expected: string, label: string) {
  try {
    assert.equal(actual, expected);
    console.log(`  PASS  ${label}`);
  } catch {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${expected}`);
    console.error(`        actual:   ${actual}`);
    process.exitCode = 1;
  }
}

const now = Date.now();
const MS = 1;
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

assertEqual(relativeTime(new Date(now - 10 * SEC)), "just now", "less than 30 seconds");

assertEqual(relativeTime(new Date(now - 1 * MIN)), "1 minute ago", "1 minute");

assertEqual(relativeTime(new Date(now - 5 * MIN)), "5 minutes ago", "5 minutes");

assertEqual(relativeTime(new Date(now - 1 * HOUR)), "1 hour ago", "1 hour");

assertEqual(relativeTime(new Date(now - 6 * HOUR)), "6 hours ago", "6 hours");

assertEqual(relativeTime(new Date(now - 1 * DAY)), "1 day ago", "1 day");

assertEqual(relativeTime(new Date(now - 5 * DAY)), "5 days ago", "5 days");

assertEqual(relativeTime(new Date(now - 1 * MONTH)), "1 month ago", "1 month");

assertEqual(relativeTime(new Date(now - 3 * MONTH)), "3 months ago", "3 months");

assertEqual(relativeTime(new Date(now - 1 * YEAR)), "1 year ago", "1 year");

assertEqual(relativeTime(new Date(now - 5 * YEAR)), "5 years ago", "5 years");

assertEqual(relativeTime(new Date(now - 2 * MIN).toISOString()), "2 minutes ago", "string date input");

assertEqual(relativeTime(new Date(now + 10 * SEC)), "just now", "future date");

try {
  relativeTime("not-a-date");
  console.error("  FAIL  invalid date should throw");
  process.exitCode = 1;
} catch {
  console.log("  PASS  invalid date throws");
}

if (!process.exitCode) {
  console.log("\nAll tests passed.");
}
