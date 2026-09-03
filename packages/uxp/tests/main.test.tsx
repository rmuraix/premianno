// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockScanCutIntervals } = vi.hoisted(() => ({
  mockScanCutIntervals: vi.fn(),
}));

vi.mock("../src/lib/host", () => ({
  scanCutIntervals: mockScanCutIntervals,
  getActiveSequenceInfo: vi.fn(),
}));

const {
  mockLoadAnnotationSet,
  mockSaveAnnotationSet,
  mockLoadClassList,
  mockSaveClassList,
  mockReadCsvFile,
  mockWriteTomlFile,
} = vi.hoisted(() => ({
  mockLoadAnnotationSet: vi.fn(),
  mockSaveAnnotationSet: vi.fn(),
  mockLoadClassList: vi.fn(),
  mockSaveClassList: vi.fn(),
  mockReadCsvFile: vi.fn(),
  mockWriteTomlFile: vi.fn(),
}));

vi.mock("../src/lib/storage", () => ({
  loadAnnotationSet: mockLoadAnnotationSet,
  saveAnnotationSet: mockSaveAnnotationSet,
  loadClassList: mockLoadClassList,
  saveClassList: mockSaveClassList,
  readCsvFile: mockReadCsvFile,
  writeTomlFile: mockWriteTomlFile,
}));

const { mockBuildAnnotationSet, mockParseClassCsv, mockSerializeToToml } =
  vi.hoisted(() => ({
    mockBuildAnnotationSet: vi.fn(),
    mockParseClassCsv: vi.fn(),
    mockSerializeToToml: vi.fn(),
  }));

vi.mock("../src/lib/annotations", () => ({
  buildAnnotationSet: mockBuildAnnotationSet,
  parseClassCsv: mockParseClassCsv,
  serializeToToml: mockSerializeToToml,
}));

const { mockIntervalsAligned, mockMergeStoredLabels, mockUpdateIntervalLabel } =
  vi.hoisted(() => ({
    mockIntervalsAligned: vi.fn(),
    mockMergeStoredLabels: vi.fn(),
    mockUpdateIntervalLabel: vi.fn(),
  }));

vi.mock("../src/lib/annotationStore", () => ({
  intervalsAligned: mockIntervalsAligned,
  mergeStoredLabels: mockMergeStoredLabels,
  updateIntervalLabel: mockUpdateIntervalLabel,
}));

import { App } from "../src/main";
import type {
  AnnotationSet,
  Interval,
  Sequence,
} from "../src/shared/annotations";

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

const makeAnnotationSet = (
  overrides?: Partial<AnnotationSet>,
): AnnotationSet => ({
  sequence: makeSequence(),
  intervals: [],
  sourceVersion: "1",
  lastUpdatedAt: new Date().toISOString(),
  ...overrides,
});

/** Renders the panel and lets the mount-time scan settle. */
const renderApp = async () => {
  await act(async () => {
    render(<App />);
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockScanCutIntervals.mockResolvedValue(null);
  mockLoadAnnotationSet.mockResolvedValue(null);
  mockSaveAnnotationSet.mockResolvedValue(undefined);
  mockLoadClassList.mockResolvedValue([]);
  mockSaveClassList.mockResolvedValue(undefined);
  mockReadCsvFile.mockResolvedValue(null);
  mockWriteTomlFile.mockResolvedValue(null);
  mockSerializeToToml.mockReturnValue('[sequence]\nid = "abc"');
  mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet());
  mockParseClassCsv.mockReturnValue([]);
  mockIntervalsAligned.mockReturnValue(true);
  mockMergeStoredLabels.mockImplementation((current: Interval[]) => current);
  mockUpdateIntervalLabel.mockImplementation(
    (intervals: Interval[]) => intervals,
  );
});

describe("App initial render", () => {
  it("renders heading", async () => {
    await renderApp();
    expect(screen.getByText("Premiere Cut Annotations")).toBeTruthy();
  });

  it("shows 'No active sequence loaded.' summary when no annotation set", async () => {
    await renderApp();
    expect(screen.getByText("No active sequence loaded.")).toBeTruthy();
  });

  it("shows the action buttons", async () => {
    await renderApp();
    expect(screen.getByText("Scan Cuts")).toBeTruthy();
    expect(screen.getByText("Import Classes")).toBeTruthy();
  });

  it("shows 'Export TOML' disabled when no annotation set", async () => {
    await renderApp();
    const exportButton = screen.getByText("Export TOML").closest("button");
    expect(exportButton?.disabled).toBe(true);
  });

  it("shows no-class-list warning when no classes are stored", async () => {
    await renderApp();
    expect(
      screen.getByText(
        "No class list loaded. Import a CSV to enable labeling.",
      ),
    ).toBeTruthy();
  });

  it("shows empty-state message when no intervals", async () => {
    await renderApp();
    expect(screen.getByText("No intervals yet. Run a scan.")).toBeTruthy();
  });

  it("scans on mount", async () => {
    await renderApp();
    expect(mockScanCutIntervals).toHaveBeenCalled();
  });

  it("loads the stored class list on mount", async () => {
    mockLoadClassList.mockResolvedValue(["cat", "dog"]);
    await renderApp();
    expect(
      screen.queryByText(
        "No class list loaded. Import a CSV to enable labeling.",
      ),
    ).toBeNull();
  });

  it("keeps the warning when the stored class list is empty", async () => {
    mockLoadClassList.mockResolvedValue([]);
    await renderApp();
    expect(
      screen.getByText(
        "No class list loaded. Import a CSV to enable labeling.",
      ),
    ).toBeTruthy();
  });

  it("survives a failing class list read", async () => {
    mockLoadClassList.mockRejectedValue(new Error("read error"));
    await renderApp();
    expect(
      screen.getByText(
        "No class list loaded. Import a CSV to enable labeling.",
      ),
    ).toBeTruthy();
  });
});

describe("App scan", () => {
  it("shows an error when the scan returns nothing", async () => {
    mockScanCutIntervals.mockResolvedValue(null);
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("No active sequence found.")).toBeTruthy();
  });

  it("shows an error when the scan returns no sequence", async () => {
    mockScanCutIntervals.mockResolvedValue({ sequence: null, intervals: [] });
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Scan Cuts"));
    });
    expect(screen.getByText("No active sequence found.")).toBeTruthy();
  });

  it("stores the scan result when nothing was saved before", async () => {
    const sequence = makeSequence();
    mockScanCutIntervals.mockResolvedValue({ sequence, intervals: [] });
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence }));

    await renderApp();

    expect(screen.getByText("Scan complete.")).toBeTruthy();
    expect(mockSaveAnnotationSet).toHaveBeenCalled();
  });

  it("merges stored labels without a warning when the cuts still line up", async () => {
    const sequence = makeSequence();
    const stored = makeAnnotationSet({ intervals: [makeInterval()] });
    mockScanCutIntervals.mockResolvedValue({
      sequence,
      intervals: [makeInterval()],
    });
    mockLoadAnnotationSet.mockResolvedValue(stored);
    mockIntervalsAligned.mockReturnValue(true);
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence }));

    await renderApp();

    expect(mockMergeStoredLabels).toHaveBeenCalled();
    expect(screen.queryByText(/Cuts changed since last scan/)).toBeNull();
  });

  it("warns when the cuts changed since the last scan", async () => {
    const sequence = makeSequence();
    mockScanCutIntervals.mockResolvedValue({
      sequence,
      intervals: [makeInterval()],
    });
    mockLoadAnnotationSet.mockResolvedValue(
      makeAnnotationSet({ intervals: [makeInterval()] }),
    );
    mockIntervalsAligned.mockReturnValue(false);
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence }));

    await renderApp();

    expect(
      screen.getByText(
        "Cuts changed since last scan. Labels may be misaligned.",
      ),
    ).toBeTruthy();
  });

  it("shows an error and the detail when the host call fails", async () => {
    mockScanCutIntervals.mockRejectedValue(new Error("host error"));
    await renderApp();
    expect(
      screen.getByText("Scan failed. Check the console for details."),
    ).toBeTruthy();
    expect(screen.getByText("Error | host error")).toBeTruthy();
  });

  it("shows an error when saving the scan result fails", async () => {
    const sequence = makeSequence();
    mockScanCutIntervals.mockResolvedValue({ sequence, intervals: [] });
    mockSaveAnnotationSet.mockRejectedValue(new Error("write error"));
    await renderApp();
    expect(
      screen.getByText("Scan failed. Check the console for details."),
    ).toBeTruthy();
  });

  it("disables the scan button while scanning", async () => {
    let resolve!: (value: unknown) => void;
    mockScanCutIntervals.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<App />);
    expect(screen.getByText("Scanning...").closest("button")?.disabled).toBe(
      true,
    );
    await act(async () => {
      resolve(null);
    });
  });
});

describe("App export", () => {
  const setupScanned = async (sequence = makeSequence()) => {
    mockScanCutIntervals.mockResolvedValue({ sequence, intervals: [] });
    mockBuildAnnotationSet.mockReturnValue(makeAnnotationSet({ sequence }));
    await renderApp();
  };

  it("reports a canceled export", async () => {
    await setupScanned();
    mockWriteTomlFile.mockResolvedValue(null);
    await act(async () => {
      fireEvent.click(screen.getByText("Export TOML"));
    });
    expect(screen.getByText("Export canceled.")).toBeTruthy();
  });

  it("reports the written path", async () => {
    await setupScanned();
    mockWriteTomlFile.mockResolvedValue("/path/to/output.toml");
    await act(async () => {
      fireEvent.click(screen.getByText("Export TOML"));
    });
    expect(screen.getByText("Exported to /path/to/output.toml.")).toBeTruthy();
  });

  it("reports a failed write", async () => {
    await setupScanned();
    mockWriteTomlFile.mockRejectedValue(new Error("write error"));
    await act(async () => {
      fireEvent.click(screen.getByText("Export TOML"));
    });
    expect(screen.getByText("Export failed.")).toBeTruthy();
  });

  it("suggests the sequence name as the file name", async () => {
    await setupScanned(makeSequence({ name: "My Sequence" }));
    mockWriteTomlFile.mockResolvedValue("/path/to/output.toml");
    await act(async () => {
      fireEvent.click(screen.getByText("Export TOML"));
    });
    expect(mockWriteTomlFile).toHaveBeenCalledWith(
      "My Sequence.toml",
      '[sequence]\nid = "abc"',
    );
  });

  it("falls back to annotations.toml for an unnamed sequence", async () => {
    await setupScanned(makeSequence({ name: "" }));
    mockWriteTomlFile.mockResolvedValue("/path/to/output.toml");
    await act(async () => {
      fireEvent.click(screen.getByText("Export TOML"));
    });
    expect(mockWriteTomlFile).toHaveBeenCalledWith(
      "annotations.toml",
      expect.any(String),
    );
  });
});

describe("App class import", () => {
  it("reports a canceled import", async () => {
    mockReadCsvFile.mockResolvedValue(null);
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Import Classes"));
    });
    expect(screen.getByText("Class import canceled.")).toBeTruthy();
  });

  it("reports a CSV without usable rows", async () => {
    mockReadCsvFile.mockResolvedValue("index,class\n");
    mockParseClassCsv.mockReturnValue([]);
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Import Classes"));
    });
    expect(
      screen.getByText("No classes found in CSV. Expect index,class columns."),
    ).toBeTruthy();
  });

  it("stores the imported classes", async () => {
    mockReadCsvFile.mockResolvedValue("index,class\n0,cat\n1,dog");
    mockParseClassCsv.mockReturnValue(["cat", "dog"]);
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Import Classes"));
    });
    expect(screen.getByText("Imported 2 classes.")).toBeTruthy();
    expect(mockSaveClassList).toHaveBeenCalledWith(["cat", "dog"]);
  });

  it("hides the no-class-list warning after an import", async () => {
    mockReadCsvFile.mockResolvedValue("index,class\n0,cat");
    mockParseClassCsv.mockReturnValue(["cat"]);
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Import Classes"));
    });
    expect(
      screen.queryByText(
        "No class list loaded. Import a CSV to enable labeling.",
      ),
    ).toBeNull();
  });

  it("reports a failed read", async () => {
    mockReadCsvFile.mockRejectedValue(new Error("read error"));
    await renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Import Classes"));
    });
    expect(screen.getByText("Failed to import class list.")).toBeTruthy();
  });
});

describe("App labeling", () => {
  const setupWithInterval = async () => {
    const sequence = makeSequence();
    const interval = makeInterval({ id: "0-5", label: "cat" });
    mockScanCutIntervals.mockResolvedValue({
      sequence,
      intervals: [interval],
    });
    mockBuildAnnotationSet.mockReturnValue(
      makeAnnotationSet({ sequence, intervals: [interval] }),
    );
    mockUpdateIntervalLabel.mockImplementation(
      (intervals: Interval[], id: string, label: string | null) =>
        intervals.map((iv) => (iv.id === id ? { ...iv, label } : iv)),
    );
    mockLoadClassList.mockResolvedValue(["cat", "dog"]);
    await renderApp();
  };

  it("updates the label from the dropdown", async () => {
    await setupWithInterval();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "dog" },
      });
    });
    expect(mockUpdateIntervalLabel).toHaveBeenCalledWith(
      expect.any(Array),
      "0-5",
      "dog",
    );
    expect(mockSaveAnnotationSet).toHaveBeenCalled();
  });

  it("clears the label from the clear button", async () => {
    await setupWithInterval();
    await act(async () => {
      fireEvent.click(screen.getByTitle("Clear label"));
    });
    expect(mockUpdateIntervalLabel).toHaveBeenCalledWith(
      expect.any(Array),
      "0-5",
      "",
    );
  });

  it("keeps working when persisting a label fails", async () => {
    await setupWithInterval();
    mockSaveAnnotationSet.mockRejectedValue(new Error("write error"));
    await act(async () => {
      fireEvent.click(screen.getByTitle("Clear label"));
    });
    expect(screen.getByTitle("Clear label")).toBeTruthy();
  });

  it("renders the class options in the dropdown", async () => {
    await setupWithInterval();
    expect(screen.getByText("cat")).toBeTruthy();
    expect(screen.getByText("dog")).toBeTruthy();
  });
});

describe("App summary", () => {
  it("shows the sequence name and interval count", async () => {
    const sequence = makeSequence({ name: "Test Sequence" });
    const intervals = [
      makeInterval(),
      makeInterval({ id: "1", startSeconds: 5, endSeconds: 10 }),
    ];
    mockScanCutIntervals.mockResolvedValue({ sequence, intervals });
    mockBuildAnnotationSet.mockReturnValue(
      makeAnnotationSet({ sequence, intervals }),
    );
    await renderApp();
    expect(screen.getByText("Test Sequence • 2 intervals")).toBeTruthy();
  });
});

describe("Interval rows", () => {
  const renderWithInterval = async (overrides: Partial<Interval>) => {
    const sequence = makeSequence();
    const interval = makeInterval({ id: "0-5", ...overrides });
    mockScanCutIntervals.mockResolvedValue({
      sequence,
      intervals: [interval],
    });
    mockBuildAnnotationSet.mockReturnValue(
      makeAnnotationSet({ sequence, intervals: [interval] }),
    );
    await renderApp();
  };

  it("marks labeled rows as labeled", async () => {
    await renderWithInterval({ label: "cat" });
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(false);
  });

  it("marks rows without a label as unlabeled", async () => {
    await renderWithInterval({ label: null });
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(true);
  });

  it("marks rows with an empty label as unlabeled", async () => {
    await renderWithInterval({ label: "" });
    const row = document.querySelector(".interval-row");
    expect(row?.classList.contains("unlabeled")).toBe(true);
  });

  it("renders start and end timecodes", async () => {
    await renderWithInterval({ startSeconds: 0, endSeconds: 5 });
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("00:00:00.000");
    expect(timecodes[1]?.textContent).toBe("00:00:05.000");
  });

  it("renders a placeholder for non-finite times", async () => {
    await renderWithInterval({ startSeconds: Number.POSITIVE_INFINITY });
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("--:--:--.---");
  });

  it("renders a placeholder for NaN times", async () => {
    await renderWithInterval({ startSeconds: Number.NaN });
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("--:--:--.---");
  });

  it("formats hours", async () => {
    await renderWithInterval({ startSeconds: 3661.5 });
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("01:01:01.500");
  });

  it("pads single digit values", async () => {
    await renderWithInterval({ startSeconds: 65.009 });
    const timecodes = document.querySelectorAll(".timecode");
    expect(timecodes[0]?.textContent).toBe("00:01:05.009");
  });
});
