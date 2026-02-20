import { describe, it, expect } from "vitest";
import {
  mergeStoredLabels,
  intervalsAligned,
  updateIntervalLabel,
} from "@esTypes/js/main/annotationStore";
import type { Interval } from "@esTypes/shared/annotations";

const makeInterval = (overrides?: Partial<Interval>): Interval => ({
  id: "0.000000-5.000000",
  startSeconds: 0,
  endSeconds: 5,
  durationFrames: 120,
  orderIndex: 0,
  label: null,
  ...overrides,
});

describe("mergeStoredLabels", () => {
  it("copies label from stored interval when times match", () => {
    const current = [makeInterval({ label: null })];
    const stored = [makeInterval({ label: "cat" })];
    const result = mergeStoredLabels(current, stored);
    expect(result[0].label).toBe("cat");
  });

  it("keeps current label when no matching stored interval", () => {
    const current = [makeInterval({ startSeconds: 10, endSeconds: 20, label: "dog" })];
    const stored = [makeInterval({ startSeconds: 0, endSeconds: 5, label: "cat" })];
    const result = mergeStoredLabels(current, stored);
    expect(result[0].label).toBe("dog");
  });

  it("sets label to null when stored label is undefined", () => {
    const current = [makeInterval({ label: "original" })];
    const storedInterval = { ...makeInterval(), label: undefined as unknown as null };
    const result = mergeStoredLabels(current, [storedInterval]);
    expect(result[0].label).toBeNull();
  });

  it("returns empty array for empty current intervals", () => {
    const result = mergeStoredLabels([], [makeInterval()]);
    expect(result).toEqual([]);
  });

  it("handles current intervals with no stored match", () => {
    const current = [
      makeInterval({ startSeconds: 0, endSeconds: 5 }),
      makeInterval({ id: "5-10", startSeconds: 5, endSeconds: 10 }),
    ];
    const stored = [makeInterval({ startSeconds: 0, endSeconds: 5, label: "intro" })];
    const result = mergeStoredLabels(current, stored);
    expect(result[0].label).toBe("intro");
    expect(result[1].label).toBeNull();
  });

  it("preserves other interval fields from current", () => {
    const current = [makeInterval({ id: "custom-id", orderIndex: 3 })];
    const stored = [makeInterval({ label: "stored-label" })];
    const result = mergeStoredLabels(current, stored);
    expect(result[0].id).toBe("custom-id");
    expect(result[0].orderIndex).toBe(3);
    expect(result[0].label).toBe("stored-label");
  });
});

describe("intervalsAligned", () => {
  it("returns true for identical intervals", () => {
    const intervals = [
      makeInterval({ startSeconds: 0, endSeconds: 5 }),
      makeInterval({ id: "5-10", startSeconds: 5, endSeconds: 10 }),
    ];
    expect(intervalsAligned(intervals, intervals)).toBe(true);
  });

  it("returns false when lengths differ", () => {
    const a = [makeInterval()];
    const b = [makeInterval(), makeInterval({ id: "5-10", startSeconds: 5, endSeconds: 10 })];
    expect(intervalsAligned(a, b)).toBe(false);
  });

  it("returns false when startSeconds differ", () => {
    const current = [makeInterval({ startSeconds: 0, endSeconds: 5 })];
    const stored = [makeInterval({ startSeconds: 1, endSeconds: 5 })];
    expect(intervalsAligned(current, stored)).toBe(false);
  });

  it("returns false when endSeconds differ", () => {
    const current = [makeInterval({ startSeconds: 0, endSeconds: 5 })];
    const stored = [makeInterval({ startSeconds: 0, endSeconds: 6 })];
    expect(intervalsAligned(current, stored)).toBe(false);
  });

  it("returns true for empty arrays", () => {
    expect(intervalsAligned([], [])).toBe(true);
  });

  it("checks all elements (stops at first mismatch)", () => {
    const current = [
      makeInterval({ startSeconds: 0, endSeconds: 5 }),
      makeInterval({ id: "5-10", startSeconds: 5, endSeconds: 10 }),
    ];
    const stored = [
      makeInterval({ startSeconds: 0, endSeconds: 5 }),
      makeInterval({ id: "5-11", startSeconds: 5, endSeconds: 11 }),
    ];
    expect(intervalsAligned(current, stored)).toBe(false);
  });
});

describe("updateIntervalLabel", () => {
  it("sets label when a non-empty value is provided", () => {
    const intervals = [makeInterval({ id: "a", label: null })];
    const result = updateIntervalLabel(intervals, "a", "cat");
    expect(result[0].label).toBe("cat");
  });

  it("sets label to null when empty string is provided", () => {
    const intervals = [makeInterval({ id: "a", label: "cat" })];
    const result = updateIntervalLabel(intervals, "a", "");
    expect(result[0].label).toBeNull();
  });

  it("sets label to null when whitespace-only string is provided", () => {
    const intervals = [makeInterval({ id: "a", label: "cat" })];
    const result = updateIntervalLabel(intervals, "a", "   ");
    expect(result[0].label).toBeNull();
  });

  it("sets label to null when null is provided", () => {
    const intervals = [makeInterval({ id: "a", label: "cat" })];
    const result = updateIntervalLabel(intervals, "a", null);
    expect(result[0].label).toBeNull();
  });

  it("does not modify other intervals", () => {
    const intervals = [
      makeInterval({ id: "a", label: "alpha" }),
      makeInterval({ id: "b", label: "beta" }),
    ];
    const result = updateIntervalLabel(intervals, "a", "new-alpha");
    expect(result[0].label).toBe("new-alpha");
    expect(result[1].label).toBe("beta");
  });

  it("returns unchanged array when id is not found", () => {
    const intervals = [makeInterval({ id: "a", label: "alpha" })];
    const result = updateIntervalLabel(intervals, "missing", "new");
    expect(result[0].label).toBe("alpha");
  });

  it("handles empty array", () => {
    const result = updateIntervalLabel([], "a", "cat");
    expect(result).toEqual([]);
  });
});
