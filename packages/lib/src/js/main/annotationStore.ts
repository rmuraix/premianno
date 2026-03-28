import type { Interval } from "../../shared/annotations";

export const mergeStoredLabels = (
  current: Interval[],
  stored: Interval[],
): Interval[] => {
  const map = new Map<string, Interval>();
  stored.forEach((interval) => {
    const key = `${interval.startSeconds}-${interval.endSeconds}`;
    map.set(key, interval);
  });

  return current.map((interval) => {
    const key = `${interval.startSeconds}-${interval.endSeconds}`;
    const storedInterval = map.get(key);
    return {
      ...interval,
      label: storedInterval
        ? (storedInterval.label ?? null)
        : (interval.label ?? null),
    };
  });
};

export const intervalsAligned = (
  current: Interval[],
  stored: Interval[],
): boolean => {
  if (current.length !== stored.length) return false;
  for (let i = 0; i < current.length; i += 1) {
    if (
      current[i].startSeconds !== stored[i].startSeconds ||
      current[i].endSeconds !== stored[i].endSeconds
    ) {
      return false;
    }
  }
  return true;
};

export const updateIntervalLabel = (
  intervals: Interval[],
  intervalId: string,
  label: string | null,
) => {
  return intervals.map((interval) =>
    interval.id === intervalId
      ? {
          ...interval,
          label: label && label.trim().length > 0 ? label : null,
        }
      : interval,
  );
};
