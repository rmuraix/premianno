import type { Project, Sequence } from "@adobe/premierepro";
import { premierepro as ppro } from "../globals";
import type { Interval, Sequence as SequenceInfo } from "../shared/annotations";

const uniqueSorted = (values: number[]): number[] =>
  Array.from(new Set(values)).sort((a, b) => a - b);

type ActiveSequence = {
  project: Project;
  sequence: Sequence;
  info: SequenceInfo;
};

const fetchActiveSequence = async (): Promise<ActiveSequence | null> => {
  const project = await ppro.Project.getActiveProject();
  if (!project) return null;

  const sequence = await project.getActiveSequence();
  // Premiere Pro resolves to null when the project has no active sequence.
  if (!sequence) return null;

  const timebase = await sequence.getTimebase();
  const settings = await sequence.getSettings();
  const fps = settings.getVideoFrameRate().value;

  const info: SequenceInfo = {
    id: sequence.guid.toString(),
    name: sequence.name,
    timebase,
    frameRate: fps > 0 ? fps : undefined,
    projectPath: project.path,
  };

  return { project, sequence, info };
};

export const getActiveSequenceInfo = async (): Promise<SequenceInfo | null> => {
  const active = await fetchActiveSequence();
  return active ? active.info : null;
};

/**
 * Collects clip boundaries across every video track of the active sequence and
 * turns the gaps between them into contiguous intervals.
 */
export const scanCutIntervals = async (): Promise<{
  sequence: SequenceInfo | null;
  intervals: Interval[];
}> => {
  const active = await fetchActiveSequence();
  if (!active) {
    return { sequence: null, intervals: [] };
  }

  const { sequence, info } = active;
  const boundaries: number[] = [0];
  const trackCount = await sequence.getVideoTrackCount();

  for (let i = 0; i < trackCount; i += 1) {
    const track = await sequence.getVideoTrack(i);
    if (!track) continue;
    const items = track.getTrackItems(ppro.Constants.TrackItemType.CLIP, false);
    for (const item of items) {
      const start = await item.getStartTime();
      const end = await item.getEndTime();
      boundaries.push(start.seconds);
      boundaries.push(end.seconds);
    }
  }

  const endTime = await sequence.getEndTime();
  const endSeconds = endTime ? endTime.seconds : 0;
  if (endSeconds > 0) {
    boundaries.push(endSeconds);
  }

  const sorted = uniqueSorted(boundaries);
  const fps = info.frameRate ?? 0;
  const intervals: Interval[] = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
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

  return { sequence: info, intervals };
};
