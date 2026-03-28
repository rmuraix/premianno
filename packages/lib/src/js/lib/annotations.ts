import type {
  AnnotationSet,
  ExportFile,
  Interval,
  Sequence,
} from "../../shared/annotations";
import { fs, path } from "./cep/node";
import { csi, evalTS } from "./utils/bolt";

const STORAGE_DIR = "premianno-annotations";
const SOURCE_VERSION = "1";
const CLASS_LIST_FILE = "class-list.json";

const sanitizeKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

const getStorageDir = () => {
  const base = csi.getSystemPath("userData");
  const dir = path.join(base, STORAGE_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getStoragePath = (sequence: Sequence) => {
  const projectKey = sanitizeKey(sequence.projectPath || "unknown_project");
  const sequenceKey = sanitizeKey(sequence.id || sequence.name || "sequence");
  return path.join(getStorageDir(), `${projectKey}__${sequenceKey}.json`);
};

export const getActiveSequenceInfo = async () => {
  return evalTS("getActiveSequenceInfo");
};

export const scanCutIntervals = async () => {
  return evalTS("scanCutIntervals");
};

export const loadAnnotationSet = (sequence: Sequence): AnnotationSet | null => {
  const filePath = getStoragePath(sequence);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as AnnotationSet;
  } catch (_error) {
    return null;
  }
};

export const saveAnnotationSet = (annotationSet: AnnotationSet) => {
  const filePath = getStoragePath(annotationSet.sequence);
  fs.writeFileSync(filePath, JSON.stringify(annotationSet, null, 2), "utf8");
};

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

export const promptSavePath = (defaultName: string) => {
  const cepFs = (window as any)?.cep?.fs;
  if (!cepFs || !cepFs.showSaveDialogEx) return null;
  const result = cepFs.showSaveDialogEx(
    "Export annotations",
    "",
    ["toml"],
    defaultName,
    "TOML",
    "Save",
    "File name",
  );
  if (!result || result.err !== 0 || !result.data) return null;
  return result.data as string;
};

export const writeTomlFile = (filePath: string, toml: string) => {
  fs.writeFileSync(filePath, toml, "utf8");
};

export const loadClassList = (): string[] => {
  const filePath = path.join(getStorageDir(), CLASS_LIST_FILE);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

export const saveClassList = (classes: string[]) => {
  const filePath = path.join(getStorageDir(), CLASS_LIST_FILE);
  fs.writeFileSync(filePath, JSON.stringify(classes, null, 2), "utf8");
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

export const promptCsvPath = () => {
  const cepFs = (window as any)?.cep?.fs;
  if (!cepFs || !cepFs.showOpenDialogEx) return null;
  const result = cepFs.showOpenDialogEx(
    false,
    false,
    "Import class list CSV",
    "",
    ["csv"],
  );
  if (!result || result.err !== 0 || !result.data || !result.data[0]) {
    return null;
  }
  return result.data[0] as string;
};

export const readCsvFile = (filePath: string) => {
  return fs.readFileSync(filePath, "utf8");
};
