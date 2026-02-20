import { vi, describe, it, expect, afterEach } from "vitest";

import {
  helloVoid,
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "@esTypes/jsx/utils/samples";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("helloVoid", () => {
  it("calls alert with 'test'", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloVoid();
    expect(mockAlert).toHaveBeenCalledWith("test");
  });
});

describe("helloError", () => {
  it("throws an error", () => {
    expect(() => helloError("any")).toThrow(Error);
  });

  it("throws with the expected message", () => {
    expect(() => helloError("any")).toThrow("We're throwing an error");
  });
});

describe("helloStr", () => {
  it("returns the input string", () => {
    vi.stubGlobal("alert", vi.fn());
    expect(helloStr("hello")).toBe("hello");
  });

  it("calls alert with the string message", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloStr("world");
    expect(mockAlert).toHaveBeenCalledWith(
      "ExtendScript received a string: world"
    );
  });
});

describe("helloNum", () => {
  it("returns the input number", () => {
    vi.stubGlobal("alert", vi.fn());
    expect(helloNum(42)).toBe(42);
  });

  it("calls alert with the number message", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloNum(7);
    expect(mockAlert).toHaveBeenCalledWith("ExtendScript received a number: 7");
  });
});

describe("helloArrayStr", () => {
  it("returns the input array", () => {
    vi.stubGlobal("alert", vi.fn());
    const arr = ["a", "b", "c"];
    expect(helloArrayStr(arr)).toBe(arr);
  });

  it("calls alert with the array message", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloArrayStr(["x", "y"]);
    expect(mockAlert).toHaveBeenCalledWith(
      "ExtendScript received an array of 2 strings: x,y"
    );
  });
});

describe("helloObj", () => {
  it("returns transformed object with x and y", () => {
    vi.stubGlobal("alert", vi.fn());
    expect(helloObj({ height: 100, width: 200 })).toEqual({ y: 100, x: 200 });
  });

  it("calls alert with JSON-stringified object", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloObj({ height: 5, width: 10 });
    expect(mockAlert).toHaveBeenCalledWith(
      `ExtendScript received an object: ${JSON.stringify({ height: 5, width: 10 })}`
    );
  });
});
