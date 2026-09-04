import { uxp } from "../globals";
import type { AnnotationSet, Sequence } from "../shared/annotations";

const CLASS_LIST_FILE = "class-list.json";

type UxpFile = {
  name?: string;
  nativePath?: string;
  read: () => Promise<string>;
  write: (data: string) => Promise<void>;
};

type UxpFolder = {
  getEntry: (name: string) => Promise<UxpFile | null>;
  createFile: (
    name: string,
    options?: { overwrite?: boolean },
  ) => Promise<UxpFile>;
};

type UxpFileSystem = {
  getDataFolder: () => Promise<UxpFolder>;
  getFileForSaving: (
    suggestedName: string,
    options: { types?: string[] },
  ) => Promise<UxpFile | null>;
  getFileForOpening: (options: {
    types?: string[];
    allowMultiple?: boolean;
  }) => Promise<UxpFile | UxpFile[] | null>;
};

// `localFileSystem` is provided by the UXP runtime but is missing from the
// published type definitions.
const getFileSystem = () =>
  (uxp.storage as unknown as { localFileSystem: UxpFileSystem })
    .localFileSystem;

/**
 * Annotations live in the plugin data folder, which UXP keeps per plugin and
 * preserves across host application upgrades.
 */
const getDataFolder = (): Promise<UxpFolder> => getFileSystem().getDataFolder();

export const sanitizeKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

export const getStorageFileName = (sequence: Sequence) => {
  const projectKey = sanitizeKey(sequence.projectPath || "unknown_project");
  const sequenceKey = sanitizeKey(sequence.id || sequence.name || "sequence");
  return `${projectKey}__${sequenceKey}.json`;
};

const readJsonFile = async <T>(fileName: string): Promise<T | null> => {
  try {
    const folder = await getDataFolder();
    const file = await folder.getEntry(fileName);
    if (!file) return null;
    const raw = await file.read();
    return JSON.parse(raw) as T;
  } catch (_error) {
    // Missing entries reject in UXP, which simply means "nothing stored yet".
    return null;
  }
};

// UXP writes are asynchronous, so concurrent saves of the same file (rapid
// label changes, for instance) would race. Every write goes through one queue
// to keep the last change on disk the last one requested.
let writeQueue: Promise<unknown> = Promise.resolve();

const enqueueWrite = <T>(task: () => Promise<T>): Promise<T> => {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
};

const writeJsonFile = (fileName: string, data: unknown) =>
  enqueueWrite(async () => {
    const folder = await getDataFolder();
    const file = await folder.createFile(fileName, { overwrite: true });
    await file.write(JSON.stringify(data, null, 2));
  });

export const loadAnnotationSet = async (
  sequence: Sequence,
): Promise<AnnotationSet | null> =>
  readJsonFile<AnnotationSet>(getStorageFileName(sequence));

export const saveAnnotationSet = async (annotationSet: AnnotationSet) => {
  await writeJsonFile(
    getStorageFileName(annotationSet.sequence),
    annotationSet,
  );
};

export const loadClassList = async (): Promise<string[]> => {
  const parsed = await readJsonFile<string[]>(CLASS_LIST_FILE);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveClassList = async (classes: string[]) => {
  await writeJsonFile(CLASS_LIST_FILE, classes);
};

/**
 * Opens the host save dialog and writes the TOML export, returning the path of
 * the written file, or null when the user cancels.
 */
export const writeTomlFile = async (defaultName: string, toml: string) => {
  const file = await getFileSystem().getFileForSaving(defaultName, {
    types: ["toml"],
  });
  if (!file) return null;
  await file.write(toml);
  return file.nativePath ?? file.name ?? defaultName;
};

/**
 * Opens the host file picker for a class list CSV and returns its contents,
 * or null when the user cancels.
 */
export const readCsvFile = async (): Promise<string | null> => {
  const selection = await getFileSystem().getFileForOpening({
    types: ["csv"],
    allowMultiple: false,
  });
  const file = Array.isArray(selection) ? selection[0] : selection;
  if (!file) return null;
  return await file.read();
};
