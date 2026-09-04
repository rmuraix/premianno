import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFileSystem, mockFolder, makeFile } = vi.hoisted(() => {
  const makeFile = (content = "") => ({
    content,
    nativePath: "/mock/data/file.json",
    name: "file.json",
    read: vi.fn(async () => content),
    write: vi.fn(async (_data: string) => undefined),
  });
  const mockFolder = {
    getEntry: vi.fn(),
    createFile: vi.fn(),
  };
  const mockFileSystem = {
    getDataFolder: vi.fn(async () => mockFolder),
    getFileForSaving: vi.fn(),
    getFileForOpening: vi.fn(),
  };
  return { mockFileSystem, mockFolder, makeFile };
});

vi.mock("../src/globals", () => ({
  uxp: { storage: { localFileSystem: mockFileSystem } },
  os: { platform: () => "darwin" },
  premierepro: {},
}));

import {
  getStorageFileName,
  loadAnnotationSet,
  loadClassList,
  readCsvFile,
  sanitizeKey,
  saveAnnotationSet,
  saveClassList,
  writeTomlFile,
} from "../src/lib/storage";
import type { AnnotationSet, Sequence } from "../src/shared/annotations";

const makeSequence = (overrides?: Partial<Sequence>): Sequence => ({
  id: "seq-001",
  name: "My Sequence",
  timebase: "254016000000",
  frameRate: 24,
  projectPath: "/projects/myproject.prproj",
  ...overrides,
});

const makeAnnotationSet = (sequence: Sequence): AnnotationSet => ({
  sequence,
  intervals: [
    {
      id: "0.000000-5.000000",
      startSeconds: 0,
      endSeconds: 5,
      durationFrames: 120,
      orderIndex: 0,
      label: "intro",
    },
  ],
  lastUpdatedAt: "2024-01-01T00:00:00.000Z",
  sourceVersion: "1",
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFileSystem.getDataFolder.mockResolvedValue(mockFolder);
});

describe("sanitizeKey", () => {
  it("replaces characters outside of the safe set", () => {
    expect(sanitizeKey("/projects/my project.prproj")).toBe(
      "_projects_my_project_prproj",
    );
  });

  it("truncates long values to 80 characters", () => {
    expect(sanitizeKey("a".repeat(200))).toHaveLength(80);
  });
});

describe("getStorageFileName", () => {
  it("combines the project path and the sequence id", () => {
    const name = getStorageFileName(makeSequence());
    expect(name).toBe("_projects_myproject_prproj__seq-001.json");
  });

  it("falls back to unknown_project when projectPath is missing", () => {
    const name = getStorageFileName(makeSequence({ projectPath: undefined }));
    expect(name).toContain("unknown_project");
  });

  it("falls back to the sequence name when the id is missing", () => {
    const name = getStorageFileName(makeSequence({ id: "", name: "NameSeq" }));
    expect(name).toContain("NameSeq");
  });

  it("falls back to 'sequence' when both id and name are missing", () => {
    const name = getStorageFileName(makeSequence({ id: "", name: "" }));
    expect(name).toContain("__sequence.json");
  });
});

describe("loadAnnotationSet", () => {
  it("returns null when the entry does not exist", async () => {
    mockFolder.getEntry.mockRejectedValue(new Error("no such entry"));
    await expect(loadAnnotationSet(makeSequence())).resolves.toBeNull();
  });

  it("returns null when the entry resolves to nothing", async () => {
    mockFolder.getEntry.mockResolvedValue(null);
    await expect(loadAnnotationSet(makeSequence())).resolves.toBeNull();
  });

  it("returns the parsed annotation set", async () => {
    const sequence = makeSequence();
    const stored = makeAnnotationSet(sequence);
    mockFolder.getEntry.mockResolvedValue(makeFile(JSON.stringify(stored)));

    await expect(loadAnnotationSet(sequence)).resolves.toEqual(stored);
    expect(mockFolder.getEntry).toHaveBeenCalledWith(
      getStorageFileName(sequence),
    );
  });

  it("returns null when the stored file is not valid JSON", async () => {
    mockFolder.getEntry.mockResolvedValue(makeFile("not-json{{"));
    await expect(loadAnnotationSet(makeSequence())).resolves.toBeNull();
  });
});

describe("saveAnnotationSet", () => {
  it("writes the annotation set as pretty printed JSON", async () => {
    const file = makeFile();
    mockFolder.createFile.mockResolvedValue(file);
    const sequence = makeSequence();
    const annotationSet = makeAnnotationSet(sequence);

    await saveAnnotationSet(annotationSet);

    expect(mockFolder.createFile).toHaveBeenCalledWith(
      getStorageFileName(sequence),
      { overwrite: true },
    );
    expect(file.write).toHaveBeenCalledWith(
      JSON.stringify(annotationSet, null, 2),
    );
  });
});

describe("loadClassList", () => {
  it("returns an empty array when nothing is stored", async () => {
    mockFolder.getEntry.mockRejectedValue(new Error("no such entry"));
    await expect(loadClassList()).resolves.toEqual([]);
  });

  it("returns the stored class list", async () => {
    mockFolder.getEntry.mockResolvedValue(
      makeFile(JSON.stringify(["cat", "dog"])),
    );
    await expect(loadClassList()).resolves.toEqual(["cat", "dog"]);
    expect(mockFolder.getEntry).toHaveBeenCalledWith("class-list.json");
  });

  it("returns an empty array when the stored JSON is not an array", async () => {
    mockFolder.getEntry.mockResolvedValue(
      makeFile(JSON.stringify({ not: "array" })),
    );
    await expect(loadClassList()).resolves.toEqual([]);
  });

  it("returns an empty array when the stored JSON is invalid", async () => {
    mockFolder.getEntry.mockResolvedValue(makeFile("{invalid}"));
    await expect(loadClassList()).resolves.toEqual([]);
  });
});

describe("saveClassList", () => {
  it("writes the class list to class-list.json", async () => {
    const file = makeFile();
    mockFolder.createFile.mockResolvedValue(file);

    await saveClassList(["cat", "dog", "bird"]);

    expect(mockFolder.createFile).toHaveBeenCalledWith("class-list.json", {
      overwrite: true,
    });
    expect(file.write).toHaveBeenCalledWith(
      JSON.stringify(["cat", "dog", "bird"], null, 2),
    );
  });
});

describe("writeTomlFile", () => {
  it("returns null when the save dialog is canceled", async () => {
    mockFileSystem.getFileForSaving.mockResolvedValue(null);
    await expect(writeTomlFile("out.toml", "[sequence]")).resolves.toBeNull();
  });

  it("writes the TOML and returns the native path", async () => {
    const file = makeFile();
    file.nativePath = "/exports/out.toml";
    mockFileSystem.getFileForSaving.mockResolvedValue(file);

    await expect(writeTomlFile("out.toml", "[sequence]")).resolves.toBe(
      "/exports/out.toml",
    );
    expect(mockFileSystem.getFileForSaving).toHaveBeenCalledWith("out.toml", {
      types: ["toml"],
    });
    expect(file.write).toHaveBeenCalledWith("[sequence]");
  });

  it("falls back to the file name when no native path is exposed", async () => {
    const file = makeFile();
    file.nativePath = undefined as unknown as string;
    file.name = "out.toml";
    mockFileSystem.getFileForSaving.mockResolvedValue(file);

    await expect(writeTomlFile("out.toml", "[sequence]")).resolves.toBe(
      "out.toml",
    );
  });
});

describe("readCsvFile", () => {
  it("returns null when the picker is canceled", async () => {
    mockFileSystem.getFileForOpening.mockResolvedValue(null);
    await expect(readCsvFile()).resolves.toBeNull();
  });

  it("returns null when the picker returns an empty selection", async () => {
    mockFileSystem.getFileForOpening.mockResolvedValue([]);
    await expect(readCsvFile()).resolves.toBeNull();
  });

  it("reads the selected file", async () => {
    mockFileSystem.getFileForOpening.mockResolvedValue(
      makeFile("index,class\n0,cat"),
    );
    await expect(readCsvFile()).resolves.toBe("index,class\n0,cat");
    expect(mockFileSystem.getFileForOpening).toHaveBeenCalledWith({
      types: ["csv"],
      allowMultiple: false,
    });
  });

  it("reads the first entry when the picker returns an array", async () => {
    mockFileSystem.getFileForOpening.mockResolvedValue([
      makeFile("index,class\n0,dog"),
    ]);
    await expect(readCsvFile()).resolves.toBe("index,class\n0,dog");
  });
});

describe("write serialization", () => {
  it("keeps concurrent writes in the order they were requested", async () => {
    const completed: string[] = [];
    const makeSlowFile = (label: string, delayMs: number) => ({
      write: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              completed.push(label);
              resolve();
            }, delayMs);
          }),
      ),
    });

    // The first write is the slow one: without a queue it would finish last.
    mockFolder.createFile
      .mockResolvedValueOnce(makeSlowFile("first", 20))
      .mockResolvedValueOnce(makeSlowFile("second", 0));

    const sequence = makeSequence();
    await Promise.all([
      saveAnnotationSet(makeAnnotationSet(sequence)),
      saveAnnotationSet(makeAnnotationSet(sequence)),
    ]);

    expect(completed).toEqual(["first", "second"]);
  });

  it("keeps draining the queue after a failed write", async () => {
    const file = makeFile();
    mockFolder.createFile
      .mockRejectedValueOnce(new Error("disk error"))
      .mockResolvedValueOnce(file);

    const sequence = makeSequence();
    await expect(
      saveAnnotationSet(makeAnnotationSet(sequence)),
    ).rejects.toThrow("disk error");
    await expect(saveClassList(["cat"])).resolves.toBeUndefined();
    expect(file.write).toHaveBeenCalled();
  });
});
