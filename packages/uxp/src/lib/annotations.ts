import type {
  AnnotationSet,
  ExportFile,
  Interval,
  Sequence,
} from "../shared/annotations";

export const STORAGE_DIR = "premianno-annotations";
export const SOURCE_VERSION = "1";
export const CLASS_LIST_FILE = "class-list.json";

export const sanitizeKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

export const buildAnnotationSet = (
  sequence: Sequence,
  intervals: Interval[],
): AnnotationSet => {
  return {
    sequence,
    intervals,
    lastUpdatedAt: new Date().toISOString(),
    sourceVersion: SOURCE_VERSION,
  };
};

export const serializeToToml = (exportFile: ExportFile) => {
  const lines: string[] = [];
  lines.push("[sequence]");
  lines.push(`id = "${exportFile.sequence.id}"`);
  lines.push(`name = "${exportFile.sequence.name}"`);
  lines.push(`timebase_ticks = "${exportFile.sequence.timebase}"`);
  if (exportFile.sequence.frameRate) {
    lines.push(`frame_rate = ${exportFile.sequence.frameRate}`);
  }
  if (exportFile.sequence.projectPath) {
    lines.push(`project_path = "${exportFile.sequence.projectPath}"`);
  }
  lines.push(`exported_at = "${exportFile.exportedAt}"`);
  lines.push("");

  exportFile.intervals.forEach((interval) => {
    lines.push("[[intervals]]");
    lines.push(`start_seconds = ${interval.startSeconds}`);
    lines.push(`end_seconds = ${interval.endSeconds}`);
    lines.push(`duration_frames = ${interval.durationFrames}`);
    lines.push(`order_index = ${interval.orderIndex}`);
    if (interval.label && interval.label.trim().length > 0) {
      lines.push(`label = "${interval.label.replace(/"/g, '\\"')}"`);
    }
    lines.push("");
  });

  return lines.join("\n");
};

type ClassRow = {
  index: number;
  label: string;
};

export const parseClassCsv = (csvText: string): string[] => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];

  const header = lines[0].split(",").map((value) => value.trim().toLowerCase());
  const indexIdx = header.indexOf("index");
  const classIdx = header.indexOf("class");
  const startRow = indexIdx !== -1 && classIdx !== -1 ? 1 : 0;

  const rows: ClassRow[] = [];

  for (let i = startRow; i < lines.length; i += 1) {
    const parts = lines[i].split(",").map((value) => value.trim());
    const idx = indexIdx !== -1 ? indexIdx : 0;
    const cls = classIdx !== -1 ? classIdx : 1;
    if (parts.length <= Math.max(idx, cls)) continue;
    const parsedIndex = parseInt(parts[idx], 10);
    const label = parts[cls];
    if (!label) continue;
    rows.push({ index: Number.isNaN(parsedIndex) ? i : parsedIndex, label });
  }

  rows.sort((a, b) => a.index - b.index);
  return rows.map((row) => row.label);
};
