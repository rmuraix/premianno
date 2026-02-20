import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Use vi.hoisted to define mocks so they are available in the hoisted vi.mock factories
const { mockFs, mockPath, mockCsi, mockEvalTS } = vi.hoisted(() => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
  const mockPath = {
    join: (...args: string[]) => args.join("/"),
  };
  const mockCsi = {
    getSystemPath: vi.fn().mockReturnValue("/mock/userdata"),
  };
  const mockEvalTS = vi.fn();
  return { mockFs, mockPath, mockCsi, mockEvalTS };
});

// Mock cep/node before importing annotations
vi.mock("@esTypes/js/lib/cep/node", () => ({
  fs: mockFs,
  path: mockPath,
}));

// Mock bolt (csi, evalTS)
vi.mock("@esTypes/js/lib/utils/bolt", () => ({
  csi: mockCsi,
  evalTS: mockEvalTS,
}));

import {
  buildAnnotationSet,
  serializeToToml,
  parseClassCsv,
  loadAnnotationSet,
  saveAnnotationSet,
  loadClassList,
  saveClassList,
  promptSavePath,
  promptCsvPath,
  writeTomlFile,
  readCsvFile,
  getActiveSequenceInfo,
  scanCutIntervals,
} from "@esTypes/js/lib/annotations";

import type { Sequence, Interval, AnnotationSet, ExportFile } from "@esTypes/shared/annotations";

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
  label: "intro",
  ...overrides,
});

describe("buildAnnotationSet", () => {
  it("builds an annotation set with correct fields", () => {
    const seq = makeSequence();
    const intervals = [makeInterval()];
    const result = buildAnnotationSet(seq, intervals);

    expect(result.sequence).toBe(seq);
    expect(result.intervals).toBe(intervals);
    expect(result.sourceVersion).toBe("1");
    expect(typeof result.lastUpdatedAt).toBe("string");
    expect(new Date(result.lastUpdatedAt).toISOString()).toBe(result.lastUpdatedAt);
  });

  it("builds an annotation set with empty intervals", () => {
    const seq = makeSequence();
    const result = buildAnnotationSet(seq, []);
    expect(result.intervals).toHaveLength(0);
  });
});

describe("serializeToToml", () => {
  const baseExport = (): ExportFile => ({
    sequence: makeSequence(),
    exportedAt: "2024-01-01T00:00:00.000Z",
    intervals: [makeInterval()],
  });

  it("includes [sequence] section with all fields", () => {
    const file = baseExport();
    const toml = serializeToToml(file);
    expect(toml).toContain("[sequence]");
    expect(toml).toContain(`id = "${file.sequence.id}"`);
    expect(toml).toContain(`name = "${file.sequence.name}"`);
    expect(toml).toContain(`timebase_ticks = "${file.sequence.timebase}"`);
    expect(toml).toContain(`frame_rate = ${file.sequence.frameRate}`);
    expect(toml).toContain(`project_path = "${file.sequence.projectPath}"`);
    expect(toml).toContain(`exported_at = "${file.exportedAt}"`);
  });

  it("omits frame_rate when not present", () => {
    const file = baseExport();
    file.sequence = makeSequence({ frameRate: undefined });
    const toml = serializeToToml(file);
    expect(toml).not.toContain("frame_rate");
  });

  it("omits project_path when not present", () => {
    const file = baseExport();
    file.sequence = makeSequence({ projectPath: undefined });
    const toml = serializeToToml(file);
    expect(toml).not.toContain("project_path");
  });

  it("includes [[intervals]] section with label", () => {
    const file = baseExport();
    const toml = serializeToToml(file);
    expect(toml).toContain("[[intervals]]");
    expect(toml).toContain(`start_seconds = 0`);
    expect(toml).toContain(`end_seconds = 5`);
    expect(toml).toContain(`duration_frames = 120`);
    expect(toml).toContain(`order_index = 0`);
    expect(toml).toContain(`label = "intro"`);
  });

  it("omits label when label is null", () => {
    const file = baseExport();
    file.intervals = [makeInterval({ label: null })];
    const toml = serializeToToml(file);
    expect(toml).not.toContain("label");
  });

  it("omits label when label is empty string", () => {
    const file = baseExport();
    file.intervals = [makeInterval({ label: "" })];
    const toml = serializeToToml(file);
    expect(toml).not.toContain("label");
  });

  it("omits label when label is whitespace only", () => {
    const file = baseExport();
    file.intervals = [makeInterval({ label: "   " })];
    const toml = serializeToToml(file);
    expect(toml).not.toContain("label");
  });

  it("escapes double quotes in label", () => {
    const file = baseExport();
    file.intervals = [makeInterval({ label: 'say "hello"' })];
    const toml = serializeToToml(file);
    expect(toml).toContain(`label = "say \\"hello\\""`);
  });

  it("handles multiple intervals", () => {
    const file = baseExport();
    file.intervals = [makeInterval(), makeInterval({ id: "5-10", startSeconds: 5, endSeconds: 10, orderIndex: 1 })];
    const toml = serializeToToml(file);
    const count = (toml.match(/\[\[intervals\]\]/g) || []).length;
    expect(count).toBe(2);
  });

  it("handles empty intervals array", () => {
    const file = baseExport();
    file.intervals = [];
    const toml = serializeToToml(file);
    expect(toml).not.toContain("[[intervals]]");
  });
});

describe("parseClassCsv", () => {
  it("returns empty array for empty string", () => {
    expect(parseClassCsv("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(parseClassCsv("   \n  \n  ")).toEqual([]);
  });

  it("parses CSV with index/class header in order", () => {
    const csv = "index,class\n0,cat\n1,dog\n2,bird";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog", "bird"]);
  });

  it("sorts rows by index when header is present", () => {
    const csv = "index,class\n2,bird\n0,cat\n1,dog";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog", "bird"]);
  });

  it("parses CSV without header (no index/class columns)", () => {
    const csv = "0,cat\n1,dog\n2,bird";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog", "bird"]);
  });

  it("handles class column appearing before index column", () => {
    const csv = "class,index\ncat,0\ndog,1";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog"]);
  });

  it("skips rows with too few columns when header is present", () => {
    const csv = "index,class\n0,cat\n1\n2,bird";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "bird"]);
  });

  it("skips rows with empty label when header is present", () => {
    const csv = "index,class\n0,\n1,dog";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["dog"]);
  });

  it("uses row position as index when index column is not a number", () => {
    const csv = "index,class\nabc,cat\ndef,dog";
    const result = parseClassCsv(csv);
    // NaN index -> uses row number (i=1,2)
    expect(result).toEqual(["cat", "dog"]);
  });

  it("handles CRLF line endings", () => {
    const csv = "index,class\r\n0,cat\r\n1,dog";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog"]);
  });

  it("trims whitespace from values", () => {
    const csv = " index , class \n 0 , cat \n 1 , dog ";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "dog"]);
  });

  it("skips rows with too few columns (no header)", () => {
    const csv = "0,cat\n1\n2,bird";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat", "bird"]);
  });

  it("handles single row without header", () => {
    const csv = "0,cat";
    const result = parseClassCsv(csv);
    expect(result).toEqual(["cat"]);
  });
});

describe("loadAnnotationSet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCsi.getSystemPath.mockReturnValue("/mock/userdata");
    mockFs.existsSync.mockReturnValue(false);
  });

  it("returns null when file does not exist", () => {
    mockFs.existsSync.mockImplementation((p: string) => {
      if (p.endsWith(".json")) return false;
      return true; // dir exists
    });
    const result = loadAnnotationSet(makeSequence());
    expect(result).toBeNull();
  });

  it("returns parsed annotation set when file exists", () => {
    const seq = makeSequence();
    const ann: AnnotationSet = buildAnnotationSet(seq, [makeInterval()]);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(ann));

    const result = loadAnnotationSet(seq);
    expect(result).toEqual(ann);
  });

  it("returns null when file contains invalid JSON", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("not-json{{");

    const result = loadAnnotationSet(makeSequence());
    expect(result).toBeNull();
  });

  it("creates storage dir when it does not exist", () => {
    mockFs.existsSync.mockImplementation((p: string) => {
      // dir does not exist, file does not exist
      return false;
    });
    loadAnnotationSet(makeSequence());
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("premianno-annotations"),
      { recursive: true }
    );
  });

  it("handles sequences without projectPath (falls back to unknown_project)", () => {
    const seq = makeSequence({ projectPath: undefined });
    mockFs.existsSync.mockReturnValue(true);
    const ann = buildAnnotationSet(seq, []);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(ann));

    const result = loadAnnotationSet(seq);
    expect(result).toEqual(ann);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining("unknown_project"),
      "utf8"
    );
  });

  it("handles sequences using name as key when id is missing", () => {
    const seq = makeSequence({ id: "", name: "NameSeq" });
    mockFs.existsSync.mockReturnValue(true);
    const ann = buildAnnotationSet(seq, []);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(ann));

    loadAnnotationSet(seq);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining("NameSeq"),
      "utf8"
    );
  });

  it("falls back to 'sequence' key when both id and name are empty", () => {
    const seq = makeSequence({ id: "", name: "" });
    mockFs.existsSync.mockReturnValue(true);
    const ann = buildAnnotationSet(seq, []);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(ann));

    loadAnnotationSet(seq);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining("sequence"),
      "utf8"
    );
  });
});

describe("saveAnnotationSet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCsi.getSystemPath.mockReturnValue("/mock/userdata");
    mockFs.existsSync.mockReturnValue(true);
  });

  it("writes the annotation set to disk as JSON", () => {
    const seq = makeSequence();
    const ann = buildAnnotationSet(seq, [makeInterval()]);
    saveAnnotationSet(ann);
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(".json"),
      expect.stringContaining('"seq-001"'),
      "utf8"
    );
  });
});

describe("writeTomlFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the TOML content to the given path", () => {
    writeTomlFile("/some/path/output.toml", "[sequence]\nid = \"abc\"");
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/some/path/output.toml",
      "[sequence]\nid = \"abc\"",
      "utf8"
    );
  });
});

describe("readCsvFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and returns file content as utf8 string", () => {
    mockFs.readFileSync.mockReturnValue("index,class\n0,cat");
    const result = readCsvFile("/some/file.csv");
    expect(result).toBe("index,class\n0,cat");
    expect(mockFs.readFileSync).toHaveBeenCalledWith("/some/file.csv", "utf8");
  });
});

describe("loadClassList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCsi.getSystemPath.mockReturnValue("/mock/userdata");
  });

  it("returns empty array when class-list.json does not exist", () => {
    mockFs.existsSync.mockReturnValue(false);
    const result = loadClassList();
    expect(result).toEqual([]);
  });

  it("returns parsed array when class-list.json exists and is valid", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(["cat", "dog"]));
    const result = loadClassList();
    expect(result).toEqual(["cat", "dog"]);
  });

  it("returns empty array when class-list.json contains invalid JSON", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("{invalid}");
    const result = loadClassList();
    expect(result).toEqual([]);
  });

  it("returns empty array when parsed JSON is not an array", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ not: "array" }));
    const result = loadClassList();
    expect(result).toEqual([]);
  });
});

describe("saveClassList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCsi.getSystemPath.mockReturnValue("/mock/userdata");
    mockFs.existsSync.mockReturnValue(true);
  });

  it("writes the class list as JSON to the storage dir", () => {
    saveClassList(["cat", "dog", "bird"]);
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("class-list.json"),
      JSON.stringify(["cat", "dog", "bird"], null, 2),
      "utf8"
    );
  });
});

describe("promptSavePath", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when window.cep is not available", () => {
    vi.stubGlobal("window", {});
    const result = promptSavePath("output.toml");
    expect(result).toBeNull();
  });

  it("returns null when cepFs does not have showSaveDialogEx", () => {
    vi.stubGlobal("window", { cep: { fs: {} } });
    const result = promptSavePath("output.toml");
    expect(result).toBeNull();
  });

  it("returns null when dialog result has error", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showSaveDialogEx: vi.fn().mockReturnValue({ err: 1, data: null }),
        },
      },
    });
    const result = promptSavePath("output.toml");
    expect(result).toBeNull();
  });

  it("returns null when result is null", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showSaveDialogEx: vi.fn().mockReturnValue(null),
        },
      },
    });
    const result = promptSavePath("output.toml");
    expect(result).toBeNull();
  });

  it("returns null when result data is empty", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showSaveDialogEx: vi.fn().mockReturnValue({ err: 0, data: null }),
        },
      },
    });
    const result = promptSavePath("output.toml");
    expect(result).toBeNull();
  });

  it("returns the file path when dialog succeeds", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showSaveDialogEx: vi.fn().mockReturnValue({ err: 0, data: "/path/to/output.toml" }),
        },
      },
    });
    const result = promptSavePath("output.toml");
    expect(result).toBe("/path/to/output.toml");
  });
});

describe("promptCsvPath", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when window.cep is not available", () => {
    vi.stubGlobal("window", {});
    const result = promptCsvPath();
    expect(result).toBeNull();
  });

  it("returns null when cepFs does not have showOpenDialogEx", () => {
    vi.stubGlobal("window", { cep: { fs: {} } });
    const result = promptCsvPath();
    expect(result).toBeNull();
  });

  it("returns null when dialog result has error", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showOpenDialogEx: vi.fn().mockReturnValue({ err: 1, data: [] }),
        },
      },
    });
    const result = promptCsvPath();
    expect(result).toBeNull();
  });

  it("returns null when result is null", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showOpenDialogEx: vi.fn().mockReturnValue(null),
        },
      },
    });
    const result = promptCsvPath();
    expect(result).toBeNull();
  });

  it("returns null when data array is empty", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showOpenDialogEx: vi.fn().mockReturnValue({ err: 0, data: [] }),
        },
      },
    });
    const result = promptCsvPath();
    expect(result).toBeNull();
  });

  it("returns the file path when dialog succeeds", () => {
    vi.stubGlobal("window", {
      cep: {
        fs: {
          showOpenDialogEx: vi.fn().mockReturnValue({ err: 0, data: ["/path/to/classes.csv"] }),
        },
      },
    });
    const result = promptCsvPath();
    expect(result).toBe("/path/to/classes.csv");
  });
});

describe("getActiveSequenceInfo", () => {
  it("calls evalTS with 'getActiveSequenceInfo'", async () => {
    mockEvalTS.mockResolvedValue({ id: "seq1", name: "Test" });
    await getActiveSequenceInfo();
    expect(mockEvalTS).toHaveBeenCalledWith("getActiveSequenceInfo");
  });
});

describe("scanCutIntervals", () => {
  it("calls evalTS with 'scanCutIntervals'", async () => {
    mockEvalTS.mockResolvedValue({ sequence: null, intervals: [] });
    await scanCutIntervals();
    expect(mockEvalTS).toHaveBeenCalledWith("scanCutIntervals");
  });
});
