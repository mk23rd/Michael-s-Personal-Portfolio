import { useEffect, useState } from "react";
import { ethiopianToday, type EthiopianDate } from "@/lib/ethiopian-calendar";

/** Today's Ethiopian calendar date in the given IANA zone, re-checked every few minutes so it rolls over at midnight. */
export function useEthiopianDate(timeZone: string): EthiopianDate {
  const [date, setDate] = useState(() => ethiopianToday(timeZone));

  useEffect(() => {
    const tick = () =>
      setDate((prev) => {
        const next = ethiopianToday(timeZone);
        return next.year === prev.year && next.month === prev.month && next.day === prev.day ? prev : next;
      });
    tick();
    const id = window.setInterval(tick, 5 * 60_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return date;
}
