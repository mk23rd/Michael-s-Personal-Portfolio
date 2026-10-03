// Run with `npm run test:unit` (Node's built-in runner, TypeScript via type stripping).
import { test } from "node:test";
import assert from "node:assert/strict";
import { ethiopianToday, formatEthiopian, formatEthiopianAmharic, toEthiopian } from "../src/lib/ethiopian-calendar.ts";

const cases: [string, [number, number, number]][] = [
  ["2023-09-11", [2015, 13, 6]], // Pagume 6 in a leap year
  ["2023-09-12", [2016, 1, 1]], // New Year falls a day late before a Gregorian leap year
  ["2024-01-07", [2016, 4, 28]], // Genna (Ethiopian Christmas)
  ["2025-09-11", [2018, 1, 1]],
  ["2026-09-11", [2019, 1, 1]],
  ["2026-10-03", [2019, 1, 23]],
  ["2027-09-11", [2019, 13, 6]],
  ["2027-09-12", [2020, 1, 1]]
];

for (const [iso, [year, month, day]] of cases) {
  test(`${iso} is ${year}-${month}-${day} E.C.`, () => {
    const [y, m, d] = iso.split("-").map(Number);
    assert.deepEqual(toEthiopian(y, m, d), { year, month, day });
  });
}

test("formats in English and Amharic", () => {
  const date = { year: 2019, month: 1, day: 23 };
  assert.equal(formatEthiopian(date), "Meskerem 23, 2019 E.C.");
  assert.equal(formatEthiopianAmharic(date), "መስከረም 23 ቀን 2019 ዓ.ም");
});

test("today is read in the given time zone, not the machine's", () => {
  // 22:30 UTC on 10 September is already 01:30 on 11 September (New Year) in Addis Ababa.
  const instant = new Date("2026-09-10T22:30:00Z");
  assert.deepEqual(ethiopianToday("Africa/Addis_Ababa", instant), { year: 2019, month: 1, day: 1 });
  assert.deepEqual(ethiopianToday("UTC", instant), { year: 2018, month: 13, day: 5 });
});
