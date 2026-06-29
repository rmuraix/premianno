import type { Sequence as DomainSequence, Interval } from "../shared/annotations";
import { premierepro as ppro } from "../globals";

const uniqueSorted = (values: number[]): number[] => {
  const map: Record<string, boolean> = {};
  for (const v of values) {
    map[String(v)] = true;
  }
  return Object.keys(map)
    .map(parseFloat)
    .sort((a, b) => a - b);
};

export const getActiveSequenceInfo = async (): Promise<DomainSequence | null> => {
  try {
    const project = await ppro.Project.getActiveProject();
    const sequence = await project.getActiveSequence();
    if (!sequence) return null;

    const timebase = await sequence.getTimebase();
    const settings = await sequence.getSettings();
    const fpsValue = settings.getVideoFrameRate().value;
    const frameRate = fpsValue > 0 ? fpsValue : undefined;

    return {
      id: sequence.guid.toString(),
      name: sequence.name,
      timebase,
      frameRate,
      projectPath: project.path,
    };
  } catch {
    return null;
  }
};

export const scanCutIntervals = async (): Promise<{
  sequence: DomainSequence | null;
  intervals: Interval[];
}> => {
  const sequenceInfo = await getActiveSequenceInfo();
  if (!sequenceInfo) {
    return { sequence: null, intervals: [] };
  }

  try {
    const project = await ppro.Project.getActiveProject();
    const sequence = await project.getActiveSequence();

    const trackCount = await sequence.getVideoTrackCount();
    const boundaries: number[] = [];

    for (let i = 0; i < trackCount; i++) {
      const track = await sequence.getVideoTrack(i);
      const items = track.getTrackItems(ppro.Constants.TrackItemType.CLIP, false);
      for (const item of items) {
        boundaries.push((await item.getStartTime()).seconds);
        boundaries.push((await item.getEndTime()).seconds);
      }
    }

    const endTime = await sequence.getEndTime();
    const endSeconds = endTime.seconds;
    boundaries.push(0);
    if (endSeconds > 0) {
      boundaries.push(endSeconds);
    }

    const sorted = uniqueSorted(boundaries);
    const fps = sequenceInfo.frameRate ?? 0;
    const intervals: Interval[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      if (end <= start) continue;
      const durationFrames =
        fps > 0 ? Math.max(1, Math.round((end - start) * fps)) : 0;
      intervals.push({
        id: `${start.toFixed(6)}-${end.toFixed(6)}`,
        startSeconds: start,
        endSeconds: end,
        durationFrames,
        orderIndex: intervals.length,
      });
    }

    if (intervals.length === 0 && endSeconds > 0) {
      intervals.push({
        id: `0.000000-${endSeconds.toFixed(6)}`,
        startSeconds: 0,
        endSeconds,
        durationFrames: fps > 0 ? Math.max(1, Math.round(endSeconds * fps)) : 0,
        orderIndex: 0,
      });
    }

    return { sequence: sequenceInfo, intervals };
  } catch {
    return { sequence: sequenceInfo, intervals: [] };
  }
};
