# API Reference

The PremiAnno API provides programmatic access to annotation data and functionality.

## Overview

PremiAnno exposes its data through standard export formats that can be consumed by external tools and scripts. This section documents the data structures and export formats.

## Export Formats

### JSON Format

The JSON export provides a structured representation of all annotations:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "My Project",
    "sequence": "Main Sequence",
    "duration": 120.5
  },
  "annotations": [
    {
      "id": "unique-id",
      "timestamp": 10.5,
      "duration": 5.0,
      "tags": ["action", "important"],
      "notes": "Key scene begins",
      "metadata": {
        "custom_field": "value"
      }
    }
  ]
}
```

### CSV Format

The CSV export provides a flat representation suitable for spreadsheet applications:

```csv
id,timestamp,duration,tags,notes
unique-id,10.5,5.0,"action,important","Key scene begins"
```

## Data Structures

### Annotation Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the annotation |
| `timestamp` | number | Start time in seconds |
| `duration` | number | Duration in seconds (0 for point annotations) |
| `tags` | string[] | Array of tag labels |
| `notes` | string | Free-form notes |
| `metadata` | object | Custom metadata fields |

### Project Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Project name |
| `sequence` | string | Active sequence name |
| `duration` | number | Total duration in seconds |

## Integration Examples

### Python

```python
import json

# Load annotations
with open('annotations.json', 'r') as f:
    data = json.load(f)

# Process annotations
for annotation in data['annotations']:
    timestamp = annotation['timestamp']
    tags = annotation['tags']
    print(f"Annotation at {timestamp}s: {tags}")
```

### JavaScript/Node.js

```javascript
import fs from 'fs'

// Load annotations
const data = JSON.parse(fs.readFileSync('annotations.json', 'utf8'))

// Filter by tag
const actionAnnotations = data.annotations.filter(a => 
  a.tags.includes('action')
)

console.log(`Found ${actionAnnotations.length} action annotations`)
```

### pandas (Python)

```python
import pandas as pd

# Load CSV
df = pd.read_csv('annotations.csv')

# Analyze timing
print(f"Total annotations: {len(df)}")
print(f"Average duration: {df['duration'].mean()}")

# Filter by time range
early_annotations = df[df['timestamp'] < 60]
```

## Use Cases

### Machine Learning Pipeline

1. **Export** annotations from PremiAnno
2. **Parse** JSON data in your pipeline
3. **Extract** video frames at annotated timestamps
4. **Train** models using labeled data

### Video Analysis

1. **Export** to CSV for analysis
2. **Import** into spreadsheet or database
3. **Visualize** annotation patterns
4. **Generate** reports and statistics

### Custom Tooling

1. **Parse** JSON export
2. **Transform** data for your use case
3. **Integrate** with existing workflows
4. **Automate** processing pipelines

## Future API Plans

::: warning Work in Progress
The following features are planned for future releases:
:::

- REST API for real-time annotation access
- WebSocket support for live updates
- Plugin SDK for custom extensions
- Bulk import functionality

## Contributing

If you need additional API features or have suggestions:

- [Open an issue](https://github.com/rmuraix/premianno/issues)
- [Submit a pull request](https://github.com/rmuraix/premianno/pulls)
- Review the [Development Guide](/guide/development)
