# API Reference

This page documents the current data formats used by PremiAnno.

## Scope

PremiAnno currently exposes data through local files:

- Internal annotation store: JSON (`AnnotationSet`)
- Export output: TOML (`ExportFile` serialization)
- Class list: JSON array, imported from CSV

## Type Definitions

Current shared types in the codebase:

```ts
export type Sequence = {
  id: string;
  name: string;
  timebase: string;
  frameRate?: number;
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
```

## Internal JSON (AnnotationSet)

PremiAnno stores per-sequence annotations in JSON files under user data directory `premianno-annotations/`.

```json
{
  "sequence": {
    "id": "4f2e8...",
    "name": "Main Sequence",
    "timebase": "254016000000",
    "frameRate": 29.97,
    "projectPath": "/path/to/project.prproj"
  },
  "intervals": [
    {
      "id": "0.000000-3.336667",
      "startSeconds": 0,
      "endSeconds": 3.336667,
      "durationFrames": 100,
      "orderIndex": 0,
      "label": "Intro"
    }
  ],
  "lastUpdatedAt": "2026-02-19T00:00:00.000Z",
  "sourceVersion": "1"
}
```

## Export TOML Format

`Export TOML` writes sequence metadata and intervals:

```toml
[sequence]
id = "4f2e8..."
name = "Main Sequence"
timebase_ticks = "254016000000"
frame_rate = 29.97
project_path = "/path/to/project.prproj"
exported_at = "2026-02-19T00:00:00.000Z"

[[intervals]]
start_seconds = 0
end_seconds = 3.336667
duration_frames = 100
order_index = 0
label = "Intro"
```

## Class CSV Import Format

Recommended CSV:

```csv
index,class
0,Intro
1,Dialogue
2,B-roll
```

Behavior:
- If `index,class` header exists, those columns are used
- Without header, parser uses first column as index and second as class
- Rows are sorted by index
- Parsed class labels become dropdown options in UI

## Integration Example

Python (`tomllib` in Python 3.11+):

```python
import tomllib

with open("annotations.toml", "rb") as f:
    data = tomllib.load(f)

for interval in data["intervals"]:
    label = interval.get("label")
    print(interval["start_seconds"], interval["end_seconds"], label)
```
