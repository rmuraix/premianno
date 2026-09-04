// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { polyFillGlobalErrorHandler } from "../src/api/errors";

beforeEach(() => {
  vi.restoreAllMocks();
  // jsdom defines `onerror` on the window itself, unlike UXP.
  delete (window as { onerror?: unknown }).onerror;
});

afterEach(() => {
  delete (window as { onerror?: unknown }).onerror;
});

describe("polyFillGlobalErrorHandler", () => {
  it("installs a handler when the runtime has none", () => {
    polyFillGlobalErrorHandler();
    expect(typeof window.onerror).toBe("function");
  });

  it("logs the error and marks it handled", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    polyFillGlobalErrorHandler();

    const error = new Error("boom");
    expect(window.onerror?.(error as unknown as Event)).toBe(true);
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it("keeps a handler the runtime already provides", () => {
    const existing = vi.fn();
    window.onerror = existing;

    polyFillGlobalErrorHandler();

    expect(window.onerror).toBe(existing);
  });
});
