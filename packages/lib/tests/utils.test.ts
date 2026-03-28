import { describe, expect, it, vi } from "vitest";

// Mock shared (which imports cep.config)
vi.mock("@esTypes/shared/shared", () => ({
  ns: "com.rmurai.premianno",
}));

import {
  dispatchTS,
  filter,
  forEach,
  includes,
  indexOf,
  join,
  map,
} from "@esTypes/jsx/utils/utils";

describe("forEach", () => {
  it("calls callback for each element", () => {
    const items = [1, 2, 3];
    const received: [number, number][] = [];
    forEach(items, (item, i) => received.push([item, i]));
    expect(received).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
  });

  it("does not call callback for empty array", () => {
    const cb = vi.fn();
    forEach([], cb);
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("map", () => {
  it("maps each element with callback", () => {
    const result = map([1, 2, 3], (x) => x * 2);
    expect(result).toEqual([2, 4, 6]);
  });

  it("passes correct index to callback", () => {
    const indices: number[] = [];
    map(["a", "b", "c"], (_, i) => {
      indices.push(i);
      return i;
    });
    expect(indices).toEqual([0, 1, 2]);
  });

  it("returns empty array for empty input", () => {
    expect(map([], (x) => x)).toEqual([]);
  });
});

describe("filter", () => {
  it("returns only elements for which predicate is true", () => {
    const result = filter([1, 2, 3, 4, 5], (x) => x % 2 === 0);
    expect(result).toEqual([2, 4]);
  });

  it("returns empty array when no elements pass predicate", () => {
    const result = filter([1, 3, 5], (x) => x % 2 === 0);
    expect(result).toEqual([]);
  });

  it("returns all elements when all pass predicate", () => {
    const result = filter([2, 4, 6], (x) => x % 2 === 0);
    expect(result).toEqual([2, 4, 6]);
  });

  it("returns empty array for empty input", () => {
    expect(filter([], () => true)).toEqual([]);
  });

  it("passes index to predicate", () => {
    const indices: number[] = [];
    filter([10, 20, 30], (_, i) => {
      indices.push(i);
      return true;
    });
    expect(indices).toEqual([0, 1, 2]);
  });
});

describe("includes", () => {
  it("returns true when value is in array", () => {
    expect(includes(["a", "b", "c"], "b")).toBe(true);
  });

  it("returns false when value is not in array", () => {
    expect(includes(["a", "b", "c"], "z")).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(includes([], "a")).toBe(false);
  });

  it("works with number values", () => {
    expect(includes([1, 2, 3], 2)).toBe(true);
    expect(includes([1, 2, 3], 9)).toBe(false);
  });

  it("returns true for the first element", () => {
    expect(includes(["x", "y"], "x")).toBe(true);
  });

  it("returns true for the last element", () => {
    expect(includes(["x", "y", "z"], "z")).toBe(true);
  });
});

describe("indexOf", () => {
  it("returns correct index for string value", () => {
    expect(indexOf(["a", "b", "c"], "b")).toBe(1);
  });

  it("returns -1 when value is not found", () => {
    expect(indexOf(["a", "b", "c"], "z")).toBe(-1);
  });

  it("returns -1 for empty array", () => {
    expect(indexOf([], "a")).toBe(-1);
  });

  it("returns 0 for first element", () => {
    expect(indexOf(["x", "y", "z"], "x")).toBe(0);
  });

  it("returns last index for last element", () => {
    expect(indexOf(["x", "y", "z"], "z")).toBe(2);
  });

  it("works with number values", () => {
    expect(indexOf([10, 20, 30], 20)).toBe(1);
    expect(indexOf([10, 20, 30], 99)).toBe(-1);
  });
});

describe("join", () => {
  it("joins paths with '/' separator on non-Windows", () => {
    vi.stubGlobal("$", { os: "Mac OS X" });
    const result = join("a", "b", "c");
    expect(result).toBe("a/b/c");
    vi.unstubAllGlobals();
  });

  it("joins paths with '\\' separator on Windows", () => {
    vi.stubGlobal("$", { os: "Windows" });
    const result = join("a", "b", "c");
    expect(result).toBe("a\\b\\c");
    vi.unstubAllGlobals();
  });

  it("returns single arg when only one arg given", () => {
    vi.stubGlobal("$", { os: "Mac OS X" });
    const result = join("only");
    expect(result).toBe("only");
    vi.unstubAllGlobals();
  });
});

describe("dispatchTS", () => {
  it("dispatches event using CSXSEvent when ExternalObject is available", () => {
    const mockDispatch = vi.fn();
    const mockEventObj = { type: "", data: "", dispatch: mockDispatch };
    // Must use function constructors (not arrow functions) since code calls `new`
    function MockCSXSEvent() {
      return mockEventObj;
    }
    function MockExternalObject() {
      return {};
    }

    vi.stubGlobal("ExternalObject", MockExternalObject);
    vi.stubGlobal("CSXSEvent", MockCSXSEvent);

    dispatchTS("myCustomEvent", { oneValue: "test", anotherValue: 42 });

    expect(mockEventObj.type).toBe("com.rmurai.premianno.myCustomEvent");
    expect(mockEventObj.data).toBe(
      JSON.stringify({ oneValue: "test", anotherValue: 42 }),
    );
    expect(mockDispatch).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
