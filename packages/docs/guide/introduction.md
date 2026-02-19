# What is PremiAnno?

PremiAnno is a UXP-based plugin for Adobe Premiere Pro that creates cut-based timeline intervals and lets you assign class labels to each interval.

![PremiAnno UI](../images/overview.png)

## Why PremiAnno?

PremiAnno is focused on turning edit timelines into structured interval-label datasets. It keeps the workflow inside Premiere Pro and exports data in a machine-readable format.

### Use Cases

- **Dataset labeling**: Label timeline segments for training/evaluation datasets
- **Media analysis**: Annotate edit intervals consistently with predefined classes
- **Research workflows**: Export interval annotations to TOML for downstream tooling

## Key Features

- **Cut-based scan**: Detect interval boundaries from timeline cuts
- **Class CSV import**: Import labels from a CSV (`index,class`)
- **Label persistence**: Save and reload annotations per project/sequence
- **TOML export**: Export sequence metadata and interval labels

## How It Works

1. Open PremiAnno in Premiere Pro
2. Click **Scan Cuts** to generate intervals
3. Click **Import Classes** and load a class CSV
4. Assign labels from the class dropdown for each interval
5. Click **Export TOML** to save the result

## Next Steps

- [Getting Started](/guide/getting-started) - Install and configure PremiAnno
- [Installation Guide](/guide/installation) - Detailed installation instructions
- [Usage Guide](/guide/usage) - Learn the full workflow
