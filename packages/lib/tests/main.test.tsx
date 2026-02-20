// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

const { mockScanCutIntervals, mockLoadAnnotationSet, mockSaveAnnotationSet,
  mockBuildAnnotationSet, mockLoadClassList, mockSaveClassList,
  mockParseClassCsv, mockPromptCsvPath, mockPromptSavePath,
  mockReadCsvFile, mockSerializeToToml, mockWriteTomlFile } = vi.hoisted(() => {
  return {
    mockScanCutIntervals: vi.fn(),
    mockLoadAnnotationSet: vi.fn(),
    mockSaveAnnotationSet: vi.fn(),
    mockBuildAnnotationSet: vi.fn(),
    mockLoadClassList: vi.fn().mockReturnValue([]),
    mockSaveClassList: vi.fn(),
    mockParseClassCsv: vi.fn(),
    mockPromptCsvPath: vi.fn(),
    mockPromptSavePath: vi.fn(),
    mockReadCsvFile: vi.fn(),
    mockSerializeToToml: vi.fn().mockReturnValue("[sequence]\nid = \"abc\""),
    mockWriteTomlFile: vi.fn(),
  };
});

vi.mock("@esTypes/js/lib/annotations", () => ({
  scanCutIntervals: mockScanCutIntervals,
  loadAnnotationSet: mockLoadAnnotationSet,
  saveAnnotationSet: mockSaveAnnotationSet,
  buildAnnotationSet: mockBuildAnnotationSet,
  loadClassList: mockLoadClassList,
  saveClassList: mockSaveClassList,
  parseClassCsv: mockParseClassCsv,
  promptCsvPath: mockPromptCsvPath,
  promptSavePath: mockPromptSavePath,
  readCsvFile: mockReadCsvFile,
  serializeToToml: mockSerializeToToml,
  writeTomlFile: mockWriteTomlFile,
}));

const { mockIntervalsAligned, mockMergeStoredLabels, mockUpdateIntervalLabel } = vi.hoisted(() => ({
  mockIntervalsAligned: vi.fn().mockReturnValue(true),
  mockMergeStoredLabels: vi.fn((current) => current),
  mockUpdateIntervalLabel: vi.fn((intervals) => intervals),
}));

vi.mock("@esTypes/js/main/annotationStore", () => ({
  intervalsAligned: mockIntervalsAligned,
  mergeStoredLabels: mockMergeStoredLabels,
  updateIntervalLabel: mockUpdateIntervalLabel,
}));

import { App } from "@esTypes/js/main/main";
import type { AnnotationSet, Interval, Sequence } from "@esTypes/shared/annotations";

const makeSequence = (overrides?: Partial<Sequence>): Sequence => ({
  id: "seq-001",
  name: "My Sequence",
  timebase: "254016000000",
  frameRate: 24,
  projectPath: "/projects/myproject.prproj",
  ...overrides,
});

const makeInterval = (overrides?: Partial<Interval>): Interval => ({
  id: "0.000000-5.000000",
  startSeconds: 0,
  endSeconds: 5,
  durationFrames: 120,
  orderIndex: 0,
  label: null,
  ...overrides,
});

const makeAnnotationSet = (overrides?: Partial<AnnotationSet>): AnnotationSet => ({
  sequence: makeSequence(),
  intervals: [],
  sourceVersion: "1",
  lastUpdatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadClassList.mockReturnValue([]);
  mockLoadAnnotationSet.mockReturnValue(null);
  mockScanCutIntervals.mockResolvedValue(null);
  mockSerializeToToml.mockReturnValue("[sequence]\nid = \"abc\"");
  mockIntervalsAligned.mockReturnValue(true);
  mockMergeStoredLabels.mockImplementation((current: Interval[]) => current);
  mockUpdateIntervalLabel.mockImplementation((intervals: Interval[]) => intervals);
  vi.stubGlobal("window", { cep: undefined });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App initial render", () => {
  it("renders heading", () => {
    render(<App />);
    expect(screen.getByText("Premiere Cut Annotations")).toBeTruthy();
  });

  it("shows 'No active sequence loaded.' summary when no annotation set", () => {
    render(<App />);
    expect(screen.getByText("No active sequence loaded.")).toBeTruthy();
  });

  it("shows 'Scan Cuts' button when not scanning", () => {
    render(<App />);
    expect(screen.getByText("Scan Cuts")).toBeTruthy();
  });

  it("shows 'Import Classes' button", () => {
    render(<App />);
    expect(screen.getByText("Import Classes")).toBeTruthy();
  });

  it("shows 'Export TOML' button disabled when no annotation set", () => {
    render(<App />);
    const exportButton = screen.getByText("Export TOML").closest("button");
    expect(exportButton?.disabled).toBe(true);
  });

  it("shows no-class-list warning when classOptions is empty", () => {
    render(<App />);
    expect(
      screen.getByText("No class list loaded. Import a CSV to enable labeling.")
    ).toBeTruthy();
  });

  it("shows empty-state message when no intervals", () => {
    render(<App />);
    expect(screen.getByText("No intervals yet. Run a scan.")).toBeTruthy();
  });

  it("shows no status message initially", () => {
    render(<App />);
    expect(screen.queryByText("Scan complete.")).toBeNull();
  });

  it("does not trigger scan when window.cep is not set", async () => {
    render(<App />);
    await act(async () => {});
    expect(mockScanCutIntervals).not.toHaveBeenCalled();
  });
});

describe("App handleScan – via button click", () => {
  it("shows error when scan returns null", async () => {
    mockScanCutIntervals.mockResolvedValue(null);
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("No active sequence found.")).toBeTruthy();
  });

  it("shows error when scan returns result without sequence", async () => {
    mockScanCutIntervals.mockResolvedValue({ sequence: null, intervals: [] });
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("No active sequence found.")).toBeTruthy();
  });

  it("shows success when scan returns valid result (no stored annotation set)", async () => {
    const seq = makeSequence();
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence: seq }));
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("Scan complete.")).toBeTruthy();
    expect(mockSaveAnnotationSet).toHaveBeenCalled();
  });

  it("shows success and no warning when stored intervals are aligned", async () => {
    const seq = makeSequence();
    const stored = makeAnnotationSet({ intervals: [makeInterval()] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [makeInterval()] });
    mockLoadAnnotationSet.mockReturnValue(stored);
    mockIntervalsAligned.mockReturnValue(true);
    mockMergeStoredLabels.mockReturnValue([makeInterval()]);
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence: seq }));
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("Scan complete.")).toBeTruthy();
    expect(screen.queryByText(/Cuts changed since last scan/)).toBeNull();
  });

  it("shows scan warning when stored intervals are not aligned", async () => {
    const seq = makeSequence();
    const stored = makeAnnotationSet({ intervals: [makeInterval()] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [makeInterval()] });
    mockLoadAnnotationSet.mockReturnValue(stored);
    mockIntervalsAligned.mockReturnValue(false);
    mockMergeStoredLabels.mockReturnValue([makeInterval()]);
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence: seq }));
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(
      screen.getByText("Cuts changed since last scan. Labels may be misaligned.")
    ).toBeTruthy();
  });

  it("shows error when scanCutIntervals throws", async () => {
    mockScanCutIntervals.mockRejectedValue(new Error("CEP error"));
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(
      screen.getByText("Scan failed. Check the console for details.")
    ).toBeTruthy();
  });

  it("disables scan button while scanning", async () => {
    let resolve!: (value: unknown) => void;
    mockScanCutIntervals.mockReturnValue(new Promise((r) => { resolve = r; }));
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("Scanning...").closest("button")?.disabled).toBe(true);
    await act(async () => { resolve(null); });
  });
});

describe("App handleExport", () => {
  it("shows error when no annotation set (button is normally disabled, but test via state)", async () => {
    // First put an annotation set in state by scanning
    const seq = makeSequence();
    const annSet = makeAnnotationSet({ sequence: seq });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptSavePath.mockReturnValue(null);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });

    // Now export with no file path
    await act(async () => { fireEvent.click(screen.getByText("Export TOML")); });
    expect(screen.getByText("Export canceled.")).toBeTruthy();
  });

  it("shows success when export succeeds", async () => {
    const seq = makeSequence();
    const annSet = makeAnnotationSet({ sequence: seq });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptSavePath.mockReturnValue("/path/to/output.toml");
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    await act(async () => { fireEvent.click(screen.getByText("Export TOML")); });
    expect(screen.getByText("Exported to /path/to/output.toml.")).toBeTruthy();
  });

  it("shows error when writeTomlFile throws", async () => {
    const seq = makeSequence();
    const annSet = makeAnnotationSet({ sequence: seq });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptSavePath.mockReturnValue("/path/to/output.toml");
    mockWriteTomlFile.mockImplementation(() => { throw new Error("write error"); });
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    await act(async () => { fireEvent.click(screen.getByText("Export TOML")); });
    expect(screen.getByText("Export failed.")).toBeTruthy();
  });

  it("uses sequence name as default export filename", async () => {
    const seq = makeSequence({ name: "My Sequence" });
    const annSet = makeAnnotationSet({ sequence: seq });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptSavePath.mockReturnValue("/path/to/output.toml");
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    await act(async () => { fireEvent.click(screen.getByText("Export TOML")); });
    expect(mockPromptSavePath).toHaveBeenCalledWith("My Sequence.toml");
  });

  it("falls back to 'annotations.toml' when sequence name is empty", async () => {
    const seq = makeSequence({ name: "" });
    const annSet = makeAnnotationSet({ sequence: seq });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptSavePath.mockReturnValue("/path/to/output.toml");
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    await act(async () => { fireEvent.click(screen.getByText("Export TOML")); });
    expect(mockPromptSavePath).toHaveBeenCalledWith("annotations.toml");
  });
});

describe("App handleImportClasses", () => {
  it("shows 'Class import canceled' when promptCsvPath returns null", async () => {
    mockPromptCsvPath.mockReturnValue(null);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    expect(screen.getByText("Class import canceled.")).toBeTruthy();
  });

  it("shows error when no classes found in CSV", async () => {
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockReturnValue("index,class\n");
    mockParseClassCsv.mockReturnValue([]);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    expect(
      screen.getByText("No classes found in CSV. Expect index,class columns.")
    ).toBeTruthy();
  });

  it("shows success when classes are imported", async () => {
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockReturnValue("index,class\n0,cat\n1,dog");
    mockParseClassCsv.mockReturnValue(["cat", "dog"]);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    expect(screen.getByText("Imported 2 classes.")).toBeTruthy();
    expect(mockSaveClassList).toHaveBeenCalledWith(["cat", "dog"]);
  });

  it("hides no-class-list warning after successful import", async () => {
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockReturnValue("index,class\n0,cat");
    mockParseClassCsv.mockReturnValue(["cat"]);
    render(<App />);
    expect(
      screen.getByText("No class list loaded. Import a CSV to enable labeling.")
    ).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    expect(
      screen.queryByText("No class list loaded. Import a CSV to enable labeling.")
    ).toBeNull();
  });

  it("shows error when readCsvFile throws", async () => {
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockImplementation(() => { throw new Error("read error"); });
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    expect(screen.getByText("Failed to import class list.")).toBeTruthy();
  });
});

describe("App label change and clear", () => {
  const setupWithInterval = async () => {
    const seq = makeSequence();
    const interval = makeInterval({ id: "0-5", label: "cat" });
    const annSet = makeAnnotationSet({ sequence: seq, intervals: [interval] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [interval] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockUpdateIntervalLabel.mockImplementation(
      (intervals: Interval[], id: string, label: string | null) =>
        intervals.map((iv) => (iv.id === id ? { ...iv, label } : iv))
    );
    // Import classes first so "dog" is an available option in the select
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockReturnValue("index,class\n0,cat\n1,dog");
    mockParseClassCsv.mockReturnValue(["cat", "dog"]);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    return { seq, interval, annSet };
  };

  it("updates label via select change", async () => {
    await setupWithInterval();
    const select = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(select, { target: { value: "dog" } });
    });
    expect(mockUpdateIntervalLabel).toHaveBeenCalledWith(
      expect.any(Array),
      "0-5",
      "dog"
    );
  });

  it("clears label via clear button", async () => {
    await setupWithInterval();
    await act(async () => {
      fireEvent.click(screen.getByTitle("Clear label"));
    });
    expect(mockUpdateIntervalLabel).toHaveBeenCalledWith(
      expect.any(Array),
      "0-5",
      ""
    );
  });
});

describe("App summary", () => {
  it("shows sequence name and interval count when annotation set is loaded", async () => {
    const seq = makeSequence({ name: "Test Sequence" });
    const intervals = [makeInterval(), makeInterval({ id: "1", startSeconds: 5, endSeconds: 10 })];
    const annSet = makeAnnotationSet({ sequence: seq, intervals });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    expect(screen.getByText("Test Sequence • 2 intervals")).toBeTruthy();
  });
});

describe("App useEffect with window.cep", () => {
  it("triggers scan on mount when window.cep is set", async () => {
    vi.stubGlobal("window", { cep: { fs: {} } });
    mockScanCutIntervals.mockResolvedValue(null);
    await act(async () => { render(<App />); });
    expect(mockScanCutIntervals).toHaveBeenCalled();
  });

  it("loads class list on mount when window.cep is set and classes exist", async () => {
    vi.stubGlobal("window", { cep: { fs: {} } });
    mockLoadClassList.mockReturnValue(["cat", "dog"]);
    mockScanCutIntervals.mockResolvedValue(null);
    await act(async () => { render(<App />); });
    expect(
      screen.queryByText("No class list loaded. Import a CSV to enable labeling.")
    ).toBeNull();
  });

  it("does not load classes when loadClassList returns empty array", async () => {
    vi.stubGlobal("window", { cep: { fs: {} } });
    mockLoadClassList.mockReturnValue([]);
    mockScanCutIntervals.mockResolvedValue(null);
    await act(async () => { render(<App />); });
    expect(
      screen.getByText("No class list loaded. Import a CSV to enable labeling.")
    ).toBeTruthy();
  });
});

describe("IntervalRow rendering (via App)", () => {
  const setupWithLabeled = async (label: string | null) => {
    const seq = makeSequence();
    const interval = makeInterval({ id: "0-5", label, startSeconds: 0, endSeconds: 5 });
    const annSet = makeAnnotationSet({ sequence: seq, intervals: [interval] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [interval] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    await act(async () => { render(<App />); });
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    return interval;
  };

  it("renders labeled interval without 'unlabeled' class", async () => {
    await setupWithLabeled("cat");
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(false);
  });

  it("renders unlabeled interval with 'unlabeled' class (null label)", async () => {
    await setupWithLabeled(null);
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(true);
  });

  it("renders unlabeled interval with 'unlabeled' class (empty label)", async () => {
    await setupWithLabeled("");
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(true);
  });

  it("renders timecodes for the interval", async () => {
    await setupWithLabeled(null);
    // startSeconds=0, endSeconds=5 → "00:00:00.000" and "00:00:05.000"
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("00:00:00.000");
    expect(timecodes[1]?.textContent).toBe("00:00:05.000");
  });

  it("renders class options in select dropdown", async () => {
    const seq = makeSequence();
    const interval = makeInterval({ id: "0-5", label: null });
    const annSet = makeAnnotationSet({ sequence: seq, intervals: [interval] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [interval] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    mockPromptCsvPath.mockReturnValue("/path/to/classes.csv");
    mockReadCsvFile.mockReturnValue("index,class\n0,cat\n1,dog");
    mockParseClassCsv.mockReturnValue(["cat", "dog"]);
    await act(async () => { render(<App />); });
    await act(async () => { fireEvent.click(screen.getByText("Import Classes")); });
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
    expect(screen.getByText("cat")).toBeTruthy();
    expect(screen.getByText("dog")).toBeTruthy();
  });
});

describe("formatTimecode (via rendered timecodes)", () => {
  const renderWithInterval = async (startSeconds: number, endSeconds: number) => {
    const seq = makeSequence();
    const interval = makeInterval({ id: "i", startSeconds, endSeconds });
    const annSet = makeAnnotationSet({ sequence: seq, intervals: [interval] });
    mockScanCutIntervals.mockResolvedValue({ sequence: seq, intervals: [interval] });
    mockLoadAnnotationSet.mockReturnValue(null);
    mockBuildAnnotationSet.mockReturnValue(annSet);
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText("Scan Cuts")); });
  };

  it("returns '--:--:--.---' for Infinity", async () => {
    await renderWithInterval(Number.POSITIVE_INFINITY, 5);
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("--:--:--.---");
  });

  it("returns '--:--:--.---' for NaN", async () => {
    await renderWithInterval(Number.NaN, 5);
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("--:--:--.---");
  });

  it("formats hours correctly (3661.5 seconds)", async () => {
    await renderWithInterval(3661.5, 5);
    const timecodes = document.querySelectorAll(".timecode");
    // 3661.5s = 1h 1m 1s 500ms
    expect(timecodes[0]?.textContent).toBe("01:01:01.500");
  });

  it("pads single-digit values with zeros", async () => {
    await renderWithInterval(65.009, 5);
    // 65.009s = 0h 1m 5s 9ms
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("00:01:05.009");
  });
});
