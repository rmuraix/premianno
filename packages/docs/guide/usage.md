# Usage Guide

Learn the current PremiAnno workflow in Adobe Premiere Pro.

## Overview

PremiAnno works on cut-based intervals. You scan the active sequence, import a class list, label each interval, then export to TOML.

## Basic Workflow

### 1. Open PremiAnno

1. Launch Adobe Premiere Pro
2. Open a project and select the target sequence
3. Go to **Window > Extensions > PremiAnno**

### 2. Scan Cuts

1. Click **Scan Cuts**
2. PremiAnno analyzes clip boundaries across video tracks
3. Intervals are generated as start/end time ranges

If the sequence changed since your last scan, PremiAnno shows a warning that labels may be misaligned.

### 3. Import Class List (CSV)

1. Click **Import Classes**
2. Select a CSV file
3. Recommended format:

```csv
index,class
0,Intro
1,Dialogue
2,B-roll
```

Notes:
- Header `index,class` is supported and recommended
- Rows are sorted by `index`
- If header is missing, the parser falls back to first and second columns

### 4. Label Intervals

1. Each interval row shows start and end timecodes
2. Choose a label from the dropdown
3. Use **Clear** to set an interval back to unlabeled

Labels are saved automatically.

### 5. Export TOML

1. Click **Export TOML**
2. Choose an output path in the save dialog
3. Use the exported TOML in downstream scripts/tools

## Local Data Behavior

- Annotation data is saved as JSON in user data directory under `premianno-annotations/`
- Data is keyed by project path + sequence id/name
- Class list is saved to `class-list.json` in the same directory

## Troubleshooting

### No active sequence found

- Open a Premiere project and make sure a sequence is active

### No class list loaded

- Import a class CSV before labeling

### No classes found in CSV

- Check CSV content and ensure class labels exist
- Prefer `index,class` header format

## Next Steps

- [API Reference](/api/) - Data format and schema details
- [Development Guide](/guide/development) - Build and maintain from source
