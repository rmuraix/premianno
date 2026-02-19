# Premianno

A Premiere Pro UXP Plugin for Dataset Annotation

## Overview

PremiAnno is a UXP-based plugin for Adobe Premiere Pro that enables time-synchronized annotation directly on the timeline.
It is designed for AI research projects and media analysis workflows, allowing researchers and creators to label timeline intervals without leaving the editing environment.

By integrating annotation into Premiere Pro, PremiAnno bridges the gap between creative editing and data collection for machine learning, video understanding, and multimodal AI research.

![PremiAnnoのUI](packages/docs/images/overview.png)

## Features

- ✂️ Cut-based interval scan — detect interval boundaries from timeline cuts
- 🏷️ CSV class import — import class labels from `index,class` CSV
- 📦 TOML export — export sequence and interval labels as TOML

## Install Premianno

1. Download the latest PremiAnno ZXP asset from the [Release Page](https://github.com/rmuraix/premianno/releases)
2. Install [ZXP/UXP Installer](https://aescripts.com/learn/zxp-installer/)
3. Open ZXP/UXP Installer and drag and drop the downloaded ZXP file

## Development

### Commands

```bash
# Install dependencies
pnpm i
# Build the plugin
pnpm lib build
# Run the plugin in hot reload mode for development with UDT
pnpm lib dev
# Build & package the plugin as ZXP
pnpm lib zxp
```

## Contributing

Your contribution is always welcome. Please read [Contributing Guide](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md).