# Usage Guide

Learn how to use PremiAnno to annotate your video projects in Adobe Premiere Pro.

## Overview

PremiAnno provides a streamlined interface for adding time-synchronized annotations to your video timeline. This guide covers the main features and workflows.

## Basic Workflow

### 1. Opening PremiAnno

1. Launch Adobe Premiere Pro
2. Open or create a project
3. Go to **Window > Extensions > PremiAnno**
4. The PremiAnno panel will dock in your workspace

### 2. Creating Annotations

Annotations can be added to specific points or ranges on your timeline:

1. **Position the Playhead**: Move the playhead to the desired timestamp
2. **Select Content** (optional): Select a clip or range on the timeline
3. **Add Annotation**: Use the PremiAnno panel to create a new annotation
4. **Add Details**: Fill in the annotation fields (tags, notes, metadata)

### 3. Managing Annotations

Once created, annotations can be:

- **Edited**: Modify tags, notes, or metadata
- **Moved**: Adjust timing as your edit changes
- **Deleted**: Remove annotations you no longer need
- **Filtered**: View specific types of annotations

### 4. Exporting Data

When you're ready to use your annotated data:

1. Click **Export** in the PremiAnno panel
2. Choose your format (JSON or CSV)
3. Select the output location
4. Your annotated dataset is ready for analysis

## Advanced Features

### Custom Tag Sets

Define your own annotation schema:

1. Open the **Tag Configuration** panel
2. Create custom categories (e.g., emotions, actions, objects)
3. Add specific tags under each category
4. Use these tags consistently across your project

### Timeline Synchronization

PremiAnno maintains annotation synchronization:

- Annotations move with clips when rearranged
- Timing updates when clips are trimmed
- Markers stay accurate through edits

### Batch Operations

Work efficiently with multiple annotations:

- Select multiple annotations for bulk editing
- Apply tags to ranges of content
- Export filtered subsets of your annotations

## Best Practices

### Organization

- Use consistent naming conventions for tags
- Create a schema before starting annotation
- Document your annotation categories

### Efficiency

- Use keyboard shortcuts (when available)
- Create templates for common annotation types
- Export regularly to preserve your work

### Collaboration

- Share tag schemas with team members
- Use consistent annotation formats
- Export and merge datasets from multiple editors

## Tips and Tricks

- **Save Often**: Export your annotations regularly
- **Preview Mode**: Use Premiere's playback to verify annotation timing
- **Tag Hierarchies**: Organize tags into logical categories
- **Metadata Fields**: Use custom fields for project-specific data

## Troubleshooting

### Annotations Not Saving

- Ensure the project file is writable
- Check available disk space
- Try exporting to verify data integrity

### Timing Issues

- Verify your sequence settings match source media
- Check for gaps or cuts that might affect timing
- Re-sync annotations if timeline is significantly changed

### Performance

- Close unused panels to improve performance
- Export and archive old annotations
- Restart Premiere Pro if the plugin becomes sluggish

## Next Steps

- [Development Guide](/guide/development) - Build PremiAnno from source
- [API Reference](/api/) - Integrate PremiAnno data into your tools
