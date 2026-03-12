import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock shared (imports cep.config via shared.ts)
vi.mock("@esTypes/shared/shared", () => ({
  ns: "com.rmurai.premianno",
}));

import {
  getActiveSequenceInfo,
  scanCutIntervals,
  jumpToAnnotationStart,
  helloWorld,
  qeDomFunction,
} from "@esTypes/jsx/ppro/ppro";

// ─── helpers ────────────────────────────────────────────────────────────────

const makeClip = (start: number, end: number) => ({
  start: { seconds: start },
  end: { seconds: end },
});

const makeTrack = (clips: ReturnType<typeof makeClip>[]) => ({
  clips: {
    numItems: clips.length,
    ...Object.fromEntries(clips.map((c, i) => [i, c])),
  },
});

const makeSequenceMock = (overrides: {
  id?: string;
  name?: string;
  timebase?: string | null;
  path?: string;
  frameRate?: number | null;
  tracks?: ReturnType<typeof makeTrack>[];
  endSeconds?: number;
  sequenceID?: string;
  setPlayerPosition?: ReturnType<typeof vi.fn>;
} = {}) => {
  // Use "in" check so that frameRate: null means "no getSettings"
  // while not specifying frameRate (undefined) means default 24
  const fps = "frameRate" in overrides ? overrides.frameRate : 24;
  const tracks = overrides.tracks ?? [];
  const endSeconds = overrides.endSeconds ?? 0;
  const settings =
    fps !== null
      ? {
          videoFrameRate: fps !== 0 ? { seconds: 1 / fps } : { seconds: 0 },
        }
      : null;

  return {
    sequenceID: overrides.sequenceID !== undefined ? overrides.sequenceID : "seq-id",
    name: overrides.name ?? "Test Sequence",
    timebase: overrides.timebase !== undefined ? overrides.timebase : "254016000000",
    getSettings: fps !== null ? () => settings : undefined,
    setPlayerPosition:
      overrides.setPlayerPosition !== undefined
        ? overrides.setPlayerPosition
        : vi.fn(),
    videoTracks: {
      numTracks: tracks.length,
      ...Object.fromEntries(tracks.map((t, i) => [i, t])),
    },
    end: endSeconds > 0 ? { seconds: endSeconds } : null,
  };
};

const stubApp = (sequenceMock: any, projectPath = "/test.prproj") => {
  vi.stubGlobal("app", {
    project: {
      activeSequence: sequenceMock,
      path: projectPath,
    },
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal("Time", function Time(this: { ticks: string; seconds?: number }) {
    this.ticks = "0";
    Object.defineProperty(this, "seconds", {
      get: () => parseInt(this.ticks, 10) / 10000000,
      set: (value: number) => {
        this.ticks = String(Math.round(value * 10000000));
      },
    });
  } as any);
});

// ─── getActiveSequenceInfo ────────────────────────────────────────────────────

describe("getActiveSequenceInfo", () => {
  it("returns null when app is not defined", () => {
    vi.stubGlobal("app", undefined);
    expect(getActiveSequenceInfo()).toBeNull();
  });

  it("returns null when app.project is falsy", () => {
    vi.stubGlobal("app", { project: null });
    expect(getActiveSequenceInfo()).toBeNull();
  });

  it("returns null when app.project.activeSequence is falsy", () => {
    vi.stubGlobal("app", { project: { activeSequence: null } });
    expect(getActiveSequenceInfo()).toBeNull();
  });

  it("returns SequenceInfo using sequenceID when available", () => {
    const seq = makeSequenceMock({ sequenceID: "abc-123" });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result).not.toBeNull();
    expect(result!.id).toBe("abc-123");
  });

  it("falls back to sequence.name when sequenceID is empty string", () => {
    const seq = makeSequenceMock({ sequenceID: "", name: "MySeq" });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.id).toBe("MySeq");
  });

  it("returns empty projectPath when app.project.path is falsy", () => {
    const seq = makeSequenceMock();
    stubApp(seq, "");
    const result = getActiveSequenceInfo();
    expect(result!.projectPath).toBe("");
  });

  it("returns projectPath when available", () => {
    const seq = makeSequenceMock();
    stubApp(seq, "/projects/my.prproj");
    const result = getActiveSequenceInfo();
    expect(result!.projectPath).toBe("/projects/my.prproj");
  });

  it("returns calculated frameRate when videoFrameRate.seconds > 0", () => {
    const seq = makeSequenceMock({ frameRate: 24 });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.frameRate).toBeCloseTo(24, 1);
  });

  it("returns undefined frameRate when videoFrameRate.seconds is 0", () => {
    const seq = makeSequenceMock({ frameRate: 0 });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.frameRate).toBeUndefined();
  });

  it("returns undefined frameRate when getSettings is not available", () => {
    const seq = makeSequenceMock({ frameRate: null });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.frameRate).toBeUndefined();
  });

  it("returns undefined frameRate when videoFrameRate is not in settings", () => {
    const seq = {
      ...makeSequenceMock(),
      getSettings: () => ({}),
    };
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.frameRate).toBeUndefined();
  });

  it("returns timebase as string when timebase is set", () => {
    const seq = makeSequenceMock({ timebase: "254016000000" });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.timebase).toBe("254016000000");
  });

  it("returns empty timebase when sequence.timebase is falsy", () => {
    const seq = makeSequenceMock({ timebase: null });
    stubApp(seq);
    const result = getActiveSequenceInfo();
    expect(result!.timebase).toBe("");
  });
});

// ─── scanCutIntervals ─────────────────────────────────────────────────────────

describe("scanCutIntervals", () => {
  it("returns null sequence and empty intervals when no active sequence", () => {
    vi.stubGlobal("app", { project: { activeSequence: null } });
    const result = scanCutIntervals();
    expect(result.sequence).toBeNull();
    expect(result.intervals).toEqual([]);
  });

  it("returns single interval covering 0 to endSeconds when no clips", () => {
    const seq = makeSequenceMock({ endSeconds: 10, tracks: [] });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
    expect(result.intervals[0].startSeconds).toBe(0);
    expect(result.intervals[0].endSeconds).toBe(10);
  });

  it("returns empty intervals when no clips and endSeconds is 0", () => {
    const seq = makeSequenceMock({ endSeconds: 0, tracks: [] });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals).toEqual([]);
  });

  it("returns correct intervals for a single clip", () => {
    const track = makeTrack([makeClip(0, 5)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 5, frameRate: 24 });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.sequence).not.toBeNull();
    expect(result.intervals).toHaveLength(1);
    expect(result.intervals[0].startSeconds).toBe(0);
    expect(result.intervals[0].endSeconds).toBe(5);
    expect(result.intervals[0].durationFrames).toBe(120); // 5 * 24
  });

  it("returns multiple intervals for multiple clips with gap", () => {
    const track = makeTrack([makeClip(0, 3), makeClip(5, 8)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 8, frameRate: 24 });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals.length).toBeGreaterThanOrEqual(2);
    const starts = result.intervals.map((iv) => iv.startSeconds);
    expect(starts).toContain(0);
    expect(starts).toContain(3);
  });

  it("sets durationFrames to 0 when fps is 0", () => {
    const track = makeTrack([makeClip(0, 5)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 5, frameRate: 0 });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals[0].durationFrames).toBe(0);
  });

  it("uses at least 1 frame for very short intervals when fps > 0", () => {
    const track = makeTrack([makeClip(0, 0.001)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 0.001, frameRate: 24 });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals[0].durationFrames).toBeGreaterThanOrEqual(1);
  });

  it("skips clips that have null start or end", () => {
    const badClip = { start: null, end: null };
    const track = {
      clips: { numItems: 1, 0: badClip },
    };
    const seq = makeSequenceMock({ tracks: [track as any], endSeconds: 5 });
    stubApp(seq);
    // Should still produce one interval (from 0 to end), not crash
    const result = scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
  });

  it("handles track with null clips object gracefully", () => {
    const badTrack = { clips: null };
    const seq = makeSequenceMock({
      tracks: [badTrack as any],
      endSeconds: 5,
      frameRate: 24,
    });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
  });

  it("handles sequence with no videoTracks property", () => {
    const seq: any = {
      ...makeSequenceMock({ endSeconds: 5 }),
      videoTracks: null,
    };
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
  });

  it("deduplicates boundaries and sorts intervals", () => {
    // Two clips sharing the same boundary at 5s
    const track = makeTrack([makeClip(0, 5), makeClip(5, 10)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 10, frameRate: 24 });
    stubApp(seq);
    const result = scanCutIntervals();
    const starts = result.intervals.map((iv) => iv.startSeconds);
    const uniqueStarts = [...new Set(starts)];
    expect(starts).toEqual(uniqueStarts); // no duplicate start times
    for (let i = 0; i < result.intervals.length - 1; i++) {
      expect(result.intervals[i].endSeconds).toBe(result.intervals[i + 1].startSeconds);
    }
  });

  it("sets orderIndex sequentially", () => {
    const track = makeTrack([makeClip(0, 3), makeClip(3, 6)]);
    const seq = makeSequenceMock({ tracks: [track], endSeconds: 6, frameRate: 24 });
    stubApp(seq);
    const result = scanCutIntervals();
    result.intervals.forEach((iv, i) => {
      expect(iv.orderIndex).toBe(i);
    });
  });

  it("fallback interval uses durationFrames = 0 when fps is 0", () => {
    const seq = makeSequenceMock({ endSeconds: 5, frameRate: 0, tracks: [] });
    stubApp(seq);
    const result = scanCutIntervals();
    expect(result.intervals).toHaveLength(1);
    expect(result.intervals[0].durationFrames).toBe(0);
  });
});

describe("jumpToAnnotationStart", () => {
  it("returns no-active-sequence when there is no active sequence", () => {
    vi.stubGlobal("app", { project: { activeSequence: null } });
    expect(jumpToAnnotationStart(5)).toEqual({
      ok: false,
      reason: "no-active-sequence",
    });
  });

  it("returns invalid-time when the input is NaN", () => {
    const seq = makeSequenceMock();
    stubApp(seq);
    expect(jumpToAnnotationStart(Number.NaN)).toEqual({
      ok: false,
      reason: "invalid-time",
    });
  });

  it("clamps negative seconds to zero before moving the playhead", () => {
    const setPlayerPosition = vi.fn();
    const seq = makeSequenceMock({ setPlayerPosition });
    stubApp(seq);
    const result = jumpToAnnotationStart(-3);
    expect(setPlayerPosition).toHaveBeenCalledWith("0");
    expect(result).toEqual({ ok: true, positionSeconds: 0 });
  });

  it("moves the playhead to the provided start time", () => {
    const setPlayerPosition = vi.fn();
    const seq = makeSequenceMock({ setPlayerPosition });
    stubApp(seq);
    const result = jumpToAnnotationStart(12.5);
    expect(setPlayerPosition).toHaveBeenCalledWith("125000000");
    expect(result).toEqual({ ok: true, positionSeconds: 12.5 });
  });
});

// ─── helloWorld ───────────────────────────────────────────────────────────────

describe("helloWorld", () => {
  it("calls alert with the hello message", () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    helloWorld();
    expect(mockAlert).toHaveBeenCalledWith("Hello from Premiere Pro.");
  });
});

// ─── qeDomFunction ────────────────────────────────────────────────────────────

describe("qeDomFunction", () => {
  it("calls app.enableQE when qe is undefined", () => {
    const enableQE = vi.fn();
    vi.stubGlobal("app", { project: { activeSequence: null }, enableQE });
    vi.stubGlobal("qe", undefined);
    qeDomFunction();
    expect(enableQE).toHaveBeenCalled();
  });

  it("accesses qe properties when qe is defined", () => {
    vi.stubGlobal("app", { project: { activeSequence: null }, enableQE: vi.fn() });
    const getVideoEffectByName = vi.fn();
    vi.stubGlobal("qe", {
      name: "qedom",
      project: { getVideoEffectByName },
    });
    qeDomFunction();
    expect(getVideoEffectByName).toHaveBeenCalledWith("test");
  });

  it("does not call app.enableQE when qe is already defined", () => {
    const enableQE = vi.fn();
    vi.stubGlobal("app", { enableQE });
    vi.stubGlobal("qe", {
      name: "qedom",
      project: { getVideoEffectByName: vi.fn() },
    });
    qeDomFunction();
    expect(enableQE).not.toHaveBeenCalled();
  });
});
