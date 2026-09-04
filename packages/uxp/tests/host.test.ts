import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPpro } = vi.hoisted(() => ({
  mockPpro: {
    Project: {
      getActiveProject: vi.fn(),
    },
    Constants: {
      TrackItemType: { EMPTY: 0, CLIP: 1, TRANSITION: 2 },
    },
  },
}));

vi.mock("../src/globals", () => ({
  premierepro: mockPpro,
  uxp: { storage: { localFileSystem: {} } },
  os: { platform: () => "darwin" },
}));

import { getActiveSequenceInfo, scanCutIntervals } from "../src/lib/host";

type ClipSpec = [start: number, end: number];

const makeClip = ([start, end]: ClipSpec) => ({
  getStartTime: vi.fn(async () => ({ seconds: start })),
  getEndTime: vi.fn(async () => ({ seconds: end })),
});

const makeSequence = (
  options: {
    tracks?: ClipSpec[][];
    endSeconds?: number;
    frameRate?: number;
    name?: string;
    guid?: string;
    timebase?: string;
  } = {},
) => {
  const tracks = options.tracks ?? [];
  const endSeconds = options.endSeconds ?? 0;
  const frameRate = options.frameRate ?? 24;

  return {
    guid: { toString: () => options.guid ?? "seq-guid" },
    name: options.name ?? "Test Sequence",
    getTimebase: vi.fn(async () => options.timebase ?? "254016000000"),
    getSettings: vi.fn(async () => ({
      getVideoFrameRate: () => ({ value: frameRate }),
    })),
    getVideoTrackCount: vi.fn(async () => tracks.length),
    getVideoTrack: vi.fn(async (index: number) => ({
      getTrackItems: vi.fn(() => tracks[index].map(makeClip)),
    })),
    getEndTime: vi.fn(async () => ({ seconds: endSeconds })),
  };
};

const stubProject = (
  sequence: ReturnType<typeof makeSequence> | null,
  path = "/projects/test.prproj",
) => {
  mockPpro.Project.getActiveProject.mockResolvedValue({
    path,
    getActiveSequence: vi.fn(async () => sequence),
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getActiveSequenceInfo", () => {
  it("returns null when there is no active project", async () => {
    mockPpro.Project.getActiveProject.mockResolvedValue(null);
    await expect(getActiveSequenceInfo()).resolves.toBeNull();
  });

  it("returns null when the project has no active sequence", async () => {
    stubProject(null);
    await expect(getActiveSequenceInfo()).resolves.toBeNull();
  });

  it("maps the host sequence onto the shared Sequence type", async () => {
    stubProject(
      makeSequence({ name: "Main", guid: "abc", frameRate: 29.97 }),
      "/projects/demo.prproj",
    );

    await expect(getActiveSequenceInfo()).resolves.toEqual({
      id: "abc",
      name: "Main",
      timebase: "254016000000",
      frameRate: 29.97,
      projectPath: "/projects/demo.prproj",
    });
  });

  it("omits the frame rate when the host reports zero", async () => {
    stubProject(makeSequence({ frameRate: 0 }));
    const info = await getActiveSequenceInfo();
    expect(info?.frameRate).toBeUndefined();
  });

  it("propagates host errors", async () => {
    mockPpro.Project.getActiveProject.mockRejectedValue(new Error("boom"));
    await expect(getActiveSequenceInfo()).rejects.toThrow("boom");
  });
});

describe("scanCutIntervals", () => {
  it("returns an empty result when no sequence is active", async () => {
    stubProject(null);
    await expect(scanCutIntervals()).resolves.toEqual({
      sequence: null,
      intervals: [],
    });
  });

  it("builds contiguous intervals from clip boundaries", async () => {
    stubProject(
      makeSequence({
        tracks: [
          [
            [0, 2],
            [2, 5],
          ],
        ],
        endSeconds: 5,
      }),
    );

    const result = await scanCutIntervals();
    expect(result.intervals).toHaveLength(2);
    expect(result.intervals[0]).toMatchObject({
      startSeconds: 0,
      endSeconds: 2,
      durationFrames: 48,
      orderIndex: 0,
      id: "0.000000-2.000000",
    });
    expect(result.intervals[1]).toMatchObject({
      startSeconds: 2,
      endSeconds: 5,
      durationFrames: 72,
      orderIndex: 1,
    });
  });

  it("merges boundaries across multiple video tracks", async () => {
    stubProject(
      makeSequence({
        tracks: [[[0, 4]], [[1, 3]]],
        endSeconds: 4,
      }),
    );

    const result = await scanCutIntervals();
    expect(
      result.intervals.map((interval) => [
        interval.startSeconds,
        interval.endSeconds,
      ]),
    ).toEqual([
      [0, 1],
      [1, 3],
      [3, 4],
    ]);
  });

  it("deduplicates identical boundaries", async () => {
    stubProject(
      makeSequence({
        tracks: [[[0, 2]], [[0, 2]]],
        endSeconds: 2,
      }),
    );

    const result = await scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
  });

  it("falls back to a single interval when there are no clips", async () => {
    stubProject(makeSequence({ tracks: [], endSeconds: 10 }));

    const result = await scanCutIntervals();
    expect(result.intervals).toEqual([
      {
        id: "0.000000-10.000000",
        startSeconds: 0,
        endSeconds: 10,
        durationFrames: 240,
        orderIndex: 0,
      },
    ]);
  });

  it("returns no intervals for an empty sequence", async () => {
    stubProject(makeSequence({ tracks: [], endSeconds: 0 }));

    const result = await scanCutIntervals();
    expect(result.intervals).toEqual([]);
    expect(result.sequence).not.toBeNull();
  });

  it("reports zero duration frames when the frame rate is unknown", async () => {
    stubProject(makeSequence({ tracks: [[[0, 3]]], frameRate: 0 }));

    const result = await scanCutIntervals();
    expect(result.intervals[0].durationFrames).toBe(0);
  });

  it("rounds sub-frame intervals up to a single frame", async () => {
    stubProject(
      makeSequence({
        tracks: [[[0, 0.001]]],
        frameRate: 24,
        endSeconds: 0.001,
      }),
    );

    const result = await scanCutIntervals();
    expect(result.intervals[0].durationFrames).toBe(1);
  });

  it("handles timelines larger than one clip batch", async () => {
    // 150 back-to-back clips exercise the batched (parallel) time lookup.
    const clips: ClipSpec[] = Array.from(
      { length: 150 },
      (_, i) => [i, i + 1] as ClipSpec,
    );
    stubProject(makeSequence({ tracks: [clips], endSeconds: 150 }));

    const result = await scanCutIntervals();
    expect(result.intervals).toHaveLength(150);
    expect(result.intervals[0].startSeconds).toBe(0);
    expect(result.intervals.at(-1)?.endSeconds).toBe(150);
    expect(
      result.intervals.every(
        (interval, index) => interval.orderIndex === index,
      ),
    ).toBe(true);
  });

  it("skips tracks the host cannot resolve", async () => {
    const sequence = makeSequence({ tracks: [[[0, 2]]], endSeconds: 2 });
    sequence.getVideoTrackCount = vi.fn(async () => 2);
    sequence.getVideoTrack = vi.fn(async (index: number) =>
      index === 0
        ? { getTrackItems: vi.fn(() => [makeClip([0, 2])]) }
        : (null as never),
    );
    stubProject(sequence);

    const result = await scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
  });
});
