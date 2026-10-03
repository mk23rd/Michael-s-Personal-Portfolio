/**
 * Gregorian → Ethiopian calendar conversion. Ethiopia keeps its own calendar: twelve 30-day
 * months plus Pagume (5 days, 6 in a leap year), with the year starting on 11 September
 * (12 September before a Gregorian leap year) and running seven to eight years behind.
 */

export type EthiopianDate = { year: number; month: number; day: number };

export const ETHIOPIAN_MONTHS = [
  { am: "መስከረም", en: "Meskerem" },
  { am: "ጥቅምት", en: "Tikimt" },
  { am: "ኅዳር", en: "Hidar" },
  { am: "ታኅሣሥ", en: "Tahsas" },
  { am: "ጥር", en: "Tir" },
  { am: "የካቲት", en: "Yekatit" },
  { am: "መጋቢት", en: "Megabit" },
  { am: "ሚያዝያ", en: "Miyazya" },
  { am: "ግንቦት", en: "Ginbot" },
  { am: "ሰኔ", en: "Sene" },
  { am: "ሐምሌ", en: "Hamle" },
  { am: "ነሐሴ", en: "Nehase" },
  { am: "ጳጉሜ", en: "Pagume" }
] as const;

/** Julian day number offset of the Amete Mihret era, as used by the standard Beyene–Kudlek conversion. */
const EPOCH = 1723856;

const gregorianToJdn = (year: number, month: number, day: number) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
};

/** Converts a Gregorian calendar date (month is 1-based) to its Ethiopian equivalent. */
export const toEthiopian = (year: number, month: number, day: number): EthiopianDate => {
  const days = gregorianToJdn(year, month, day) - EPOCH;
  const cycle = Math.floor(days / 1461);
  const r = ((days % 1461) + 1461) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  return {
    year: 4 * cycle + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: (n % 30) + 1
  };
};

/** Today's Ethiopian date as observed in the given IANA time zone. */
export const ethiopianToday = (timeZone: string, now = new Date()): EthiopianDate => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(now)
    .reduce<Record<string, number>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = Number(part.value);
      return acc;
    }, {});
  return toEthiopian(parts.year, parts.month, parts.day);
};

/** "Meskerem 23, 2019 E.C." */
export const formatEthiopian = ({ year, month, day }: EthiopianDate) =>
  `${ETHIOPIAN_MONTHS[month - 1].en} ${day}, ${year} E.C.`;

/** "መስከረም 23 ቀን 2019 ዓ.ም" */
export const formatEthiopianAmharic = ({ year, month, day }: EthiopianDate) =>
  `${ETHIOPIAN_MONTHS[month - 1].am} ${day} ቀን ${year} ዓ.ም`;
