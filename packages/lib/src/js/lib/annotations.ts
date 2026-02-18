import { fs, path } from "./cep/node";
import { csi, evalTS } from "./utils/bolt";
import type {
  AnnotationSet,
  ExportFile,
  Interval,
  Sequence,
} from "../../shared/annotations";

const STORAGE_DIR = "premianno-annotations";
const SOURCE_VERSION = "1";

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
  } catch (error) {
    return null;
  }
};

export const saveAnnotationSet = (annotationSet: AnnotationSet) => {
  const filePath = getStoragePath(annotationSet.sequence);
  fs.writeFileSync(filePath, JSON.stringify(annotationSet, null, 2), "utf8");
};

export const buildAnnotationSet = (
  sequence: Sequence,
  intervals: Interval[]
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
  lines.push(`timebase = "${exportFile.sequence.timebase}"`);
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
      lines.push(`label = "${interval.label.replace(/"/g, "\\\"")}"`);
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
    "File name"
  );
  if (!result || result.err !== 0 || !result.data) return null;
  return result.data as string;
};

export const writeTomlFile = (filePath: string, toml: string) => {
  fs.writeFileSync(filePath, toml, "utf8");
};
