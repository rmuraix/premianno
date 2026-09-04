import { describe, expect, it } from "vitest";

import {
  buildAnnotationSet,
  parseClassCsv,
  serializeToToml,
} from "../src/lib/annotations";
import type { ExportFile, Interval, Sequence } from "../src/shared/annotations";

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
    expect(new Date(result.lastUpdatedAt).toISOString()).toBe(
      result.lastUpdatedAt,
    );
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
    file.intervals = [
      makeInterval(),
      makeInterval({
        id: "5-10",
        startSeconds: 5,
        endSeconds: 10,
        orderIndex: 1,
      }),
    ];
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
