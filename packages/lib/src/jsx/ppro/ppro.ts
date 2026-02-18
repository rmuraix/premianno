import {
  helloVoid,
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "../utils/samples";
export { helloError, helloStr, helloNum, helloArrayStr, helloObj, helloVoid };

type SequenceInfo = {
  id: string;
  name: string;
  timebase: string;
  projectPath?: string;
};

type IntervalInfo = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  durationFrames: number;
  orderIndex: number;
};

const getActiveSequence = (): SequenceInfo | null => {
  if (!app || !app.project || !app.project.activeSequence) {
    return null;
  }

  const sequence = app.project.activeSequence;
  const sequenceId = (sequence.sequenceID || sequence.name).toString();
  const projectPath = app.project.path ? app.project.path.toString() : "";

  return {
    id: sequenceId,
    name: sequence.name,
    timebase: sequence.timebase ? sequence.timebase.toString() : "",
    projectPath,
  };
};

const getTrackBoundaries = (sequence: any): number[] => {
  const boundaries: number[] = [];
  const trackCount = sequence.videoTracks ? sequence.videoTracks.numTracks : 0;
  for (var i = 0; i < trackCount; i++) {
    const track = sequence.videoTracks[i];
    if (!track || !track.clips) continue;
    const clipCount = track.clips.numItems || 0;
    for (var j = 0; j < clipCount; j++) {
      const clip = track.clips[j];
      if (!clip || !clip.start || !clip.end) continue;
      boundaries.push(clip.start.seconds);
      boundaries.push(clip.end.seconds);
    }
  }
  return boundaries;
};

const uniqueSorted = (values: number[]): number[] => {
  const map: { [key: string]: boolean } = {};
  for (var i = 0; i < values.length; i++) {
    map[String(values[i])] = true;
  }
  const keys = [];
  for (var key in map) {
    keys.push(parseFloat(key));
  }
  keys.sort(function (a, b) {
    return a - b;
  });
  return keys;
};

const getFps = (sequence: any): number => {
  if (!sequence || !sequence.timebase) return 0;
  const fps = parseFloat(sequence.timebase.toString());
  return isNaN(fps) ? 0 : fps;
};

export const getActiveSequenceInfo = (): SequenceInfo | null => {
  return getActiveSequence();
};

export const scanCutIntervals = (): {
  sequence: SequenceInfo | null;
  intervals: IntervalInfo[];
} => {
  const sequenceInfo = getActiveSequence();
  if (!sequenceInfo) {
    return { sequence: null, intervals: [] };
  }

  const sequence = app.project.activeSequence;
  const boundaries = getTrackBoundaries(sequence);
  const fps = getFps(sequence);
  const endSeconds =
    sequence && sequence.end && sequence.end.seconds
      ? sequence.end.seconds
      : 0;
  boundaries.push(0);
  if (endSeconds > 0) {
    boundaries.push(endSeconds);
  }

  const sorted = uniqueSorted(boundaries);
  const intervals: IntervalInfo[] = [];

  for (var i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (end <= start) continue;
    const durationFrames = fps > 0 ? Math.max(1, Math.round((end - start) * fps)) : 0;
    intervals.push({
      id: start.toFixed(6) + "-" + end.toFixed(6),
      startSeconds: start,
      endSeconds: end,
      durationFrames: durationFrames,
      orderIndex: intervals.length,
    });
  }

  if (!intervals.length && endSeconds > 0) {
    intervals.push({
      id: "0.000000-" + endSeconds.toFixed(6),
      startSeconds: 0,
      endSeconds: endSeconds,
      durationFrames: fps > 0 ? Math.max(1, Math.round(endSeconds * fps)) : 0,
      orderIndex: 0,
    });
  }

  return { sequence: sequenceInfo, intervals: intervals };
};

export const qeDomFunction = () => {
  if (typeof qe === "undefined") {
    app.enableQE();
  }
  if (qe) {
    qe.name;
    qe.project.getVideoEffectByName("test");
  }
};

export const helloWorld = () => {
  alert("Hello from Premiere Pro.");
};
