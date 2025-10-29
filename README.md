# Premianno

A Premiere Pro UXP Plugin for Dataset Annotation

## Overview

PremiAnno is a UXP-based plugin for Adobe Premiere Pro that enables time-synchronized annotation directly on the timeline.
It is designed for AI research projects and media analysis workflows, allowing researchers and creators to add structured metadata, tags, or comments without leaving the editing environment.

By integrating annotation into Premiere Pro, PremiAnno bridges the gap between creative editing and data collection for machine learning, video understanding, and multimodal AI research.

## Features

- 🕒 Time-based annotation — attach notes, labels, or metadata to specific timestamps or clip ranges
- 💬 Custom tag sets — define your own annotation schema (e.g., emotions, actions, scenes)
- 🎞️ Seamless timeline integration — annotations follow clip movements and edits
- 📦 Export options — export annotations as JSON/CSV for downstream AI tasks

## Install Premianno

1. Download Premianno CCX file from [Release Page](https://github.com/rmuraix/premianno/releases)
2. Install [ZXP/UXP Installer](https://aescripts.com/learn/zxp-installer/)
3. Open ZXP/UXP Installer and drag and drop the CCX file

## Development

### Commands

```bash
# Install dependencies
pnpm i
# Build the plugin
pnpm lib build
# Run the plugin in hot reload mode for development with UDT
pnpm lib dev
# Build & Package the plugin as a CCX for delivery
pnpm lib ccx
# Bundles packaged ccx file
pnpm lib zip
```

### UDT Setup

The Adobe UXP Developer Tools (UDT) can be downloaded from the Adobe CC app.

#### Add Plugin

1. Open the Adobe UXP Developer Tool (2.0 or later)
2. Click the Add Plugin button in the top right corner
3. Select the manifest.json file in the dist folder

#### Load and Debug Plugin

1. Click Load button on your plugin item
2. Click Debug button on your plugin item

Note: You only need to "Load" a plugin, do not use the "Load and Watch" feature. The bulit-in UDT file watcher aka "Load and Watch" does not reliably update on changes so we recommend avoiding it. Instead, Bolt UXP comes with it's own built-in WebSocket system to trigger a reload on each update which is more consistent and less error-prone.

## Contributing

Your contribution is always welcome. Please read [Contributing Guide](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md).

<img src ="./packages/lib/src/assets/built-with-bolt-uxp/Built_With_BOLT_UXP_Logo_White_V01.svg" width="50%"/>
