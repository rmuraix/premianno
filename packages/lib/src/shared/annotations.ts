export type Sequence = {
  id: string;
  name: string;
  timebase: string;
  projectPath?: string;
};

export type Interval = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  durationFrames: number;
  orderIndex: number;
  label?: string | null;
};

export type AnnotationSet = {
  sequence: Sequence;
  intervals: Interval[];
  lastUpdatedAt: string;
  sourceVersion: string;
};

export type ExportFile = {
  sequence: Sequence;
  exportedAt: string;
  intervals: Interval[];
};
