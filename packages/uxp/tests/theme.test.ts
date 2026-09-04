// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockOs } = vi.hoisted(() => ({
  mockOs: { platform: vi.fn(() => "darwin") },
}));

vi.mock("../src/globals", () => ({
  os: mockOs,
  uxp: { storage: { localFileSystem: {} } },
  premierepro: {},
}));

import { applyColorScheme, getColorScheme, initTheme } from "../src/api/theme";

type ThemeDocument = Document & {
  theme?: { getCurrent: () => string; onUpdated?: { addListener: unknown } };
};

const themeDocument = document as ThemeDocument;

const stubHostTheme = (
  theme: string,
  addListener?: (callback: () => void) => void,
) => {
  themeDocument.theme = {
    getCurrent: () => theme,
    onUpdated: addListener ? { addListener } : undefined,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  mockOs.platform.mockReturnValue("darwin");
  themeDocument.theme = undefined;
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-theme");
});

describe("getColorScheme", () => {
  it("falls back to the darkest theme when the host exposes none", () => {
    const scheme = getColorScheme();
    expect(scheme.theme).toBe("darkest");
    expect(scheme.colors["--uxp-host-background-color"]).toMatch(/^#/);
  });

  it("follows the host theme", () => {
    stubHostTheme("light");
    expect(getColorScheme().theme).toBe("light");
  });

  it("uses a different palette per platform", () => {
    stubHostTheme("dark");
    const mac = getColorScheme().colors;
    mockOs.platform.mockReturnValue("win32");
    const win = getColorScheme().colors;
    expect(win).not.toEqual(mac);
  });

  it("treats darwin as macOS, not Windows", () => {
    stubHostTheme("dark");
    mockOs.platform.mockReturnValue("darwin");
    const darwin = getColorScheme().colors;
    mockOs.platform.mockReturnValue("win32");
    const win = getColorScheme().colors;
    expect(darwin).not.toEqual(win);
  });

  it("falls back to the macOS palette on an unknown platform", () => {
    stubHostTheme("dark");
    mockOs.platform.mockReturnValue("darwin");
    const darwin = getColorScheme().colors;
    mockOs.platform.mockReturnValue("linux");
    expect(getColorScheme().colors).toEqual(darwin);
  });

  it("returns a full palette for every host theme", () => {
    for (const theme of ["lightest", "light", "dark", "darkest"]) {
      stubHostTheme(theme);
      const { colors } = getColorScheme();
      expect(colors["--uxp-host-background-color"]).toBeTruthy();
      expect(colors["--uxp-host-text-color"]).toBeTruthy();
    }
  });
});

describe("applyColorScheme", () => {
  it("writes the palette onto the root element", () => {
    applyColorScheme({
      theme: "dark",
      colors: { "--uxp-host-background-color": "#123456" },
    });

    expect(
      document.documentElement.style.getPropertyValue(
        "--uxp-host-background-color",
      ),
    ).toBe("#123456");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("initTheme", () => {
  it("applies the current scheme", () => {
    stubHostTheme("light");
    initTheme();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("re-applies the scheme when the host theme changes", () => {
    let listener: (() => void) | undefined;
    stubHostTheme("light", (callback) => {
      listener = callback;
    });

    initTheme();
    expect(document.documentElement.dataset.theme).toBe("light");

    stubHostTheme("darkest", () => undefined);
    listener?.();
    expect(document.documentElement.dataset.theme).toBe("darkest");
  });

  it("does not throw when the host exposes no theme API", () => {
    expect(() => initTheme()).not.toThrow();
  });
});
