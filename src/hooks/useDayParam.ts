import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback, useEffect } from "react";
import { formatLocalDayKey, parseLocalDayKey } from "../lib/dateUtils";

/**
 * Selected calendar day for Home + sidebar calendar, synced to `?day=YYYY-MM-DD`.
 */
export function useDayParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("day");

  const dayKey = useMemo(() => {
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return formatLocalDayKey(new Date());
  }, [raw]);

  useEffect(() => {
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      setSearchParams({ day: formatLocalDayKey(new Date()) }, { replace: true });
    }
  }, [raw, setSearchParams]);

  const setDayFromDate = useCallback(
    (d: Date) => {
      setSearchParams({ day: formatLocalDayKey(d) }, { replace: true });
    },
    [setSearchParams],
  );

  const selectedDate = useMemo(() => parseLocalDayKey(dayKey), [dayKey]);

  return { dayKey, selectedDate, setDayFromDate };
}
