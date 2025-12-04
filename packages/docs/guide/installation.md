# Installation

This guide provides detailed instructions for installing PremiAnno in Adobe Premiere Pro.

## System Requirements

- **Adobe Premiere Pro**: 2024 or later (recommended)
- **Operating System**: Windows 10/11 or macOS 12+
- **ZXP/UXP Installer**: Required for plugin installation

## Installation Steps

### Method 1: Using ZXP/UXP Installer (Recommended)

1. **Download PremiAnno**
   - Visit the [Release Page](https://github.com/rmuraix/premianno/releases)
   - Download the latest `.ccx` file

2. **Install ZXP/UXP Installer**
   - Download from [aescripts.com](https://aescripts.com/learn/zxp-installer/)
   - Install the application on your system

3. **Install PremiAnno Plugin**
   - Open ZXP/UXP Installer
   - Drag and drop the PremiAnno `.ccx` file into the installer window
   - Wait for the installation to complete

4. **Restart Premiere Pro**
   - Close Adobe Premiere Pro if it's running
   - Launch Premiere Pro

5. **Access PremiAnno**
   - In Premiere Pro, go to **Window > Extensions > PremiAnno**
   - The PremiAnno panel will appear

### Method 2: Manual Installation (Advanced)

For developers or advanced users who want to install from source:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rmuraix/premianno.git
   cd premianno
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build the Plugin**
   ```bash
   pnpm lib build
   ```

4. **Load in Adobe UXP Developer Tool**
   - Download and install Adobe UXP Developer Tool from Adobe CC
   - Open UXP Developer Tool
   - Click "Add Plugin" and select `packages/lib/dist/manifest.json`
   - Click "Load" to load the plugin

For more details on development setup, see the [Development Guide](/guide/development).

## Verification

After installation, verify that PremiAnno is working:

1. Open Adobe Premiere Pro
2. Create or open a project
3. Go to **Window > Extensions > PremiAnno**
4. The PremiAnno panel should appear and be functional

## Troubleshooting

### Plugin Not Appearing

- Ensure you've restarted Premiere Pro after installation
- Check that you're using a compatible version of Premiere Pro
- Try reinstalling the plugin

### Installation Fails

- Verify that ZXP/UXP Installer is up to date
- Check that you have the correct CCX file for your OS
- Ensure you have administrator privileges on your system

### Plugin Crashes

- Check the Adobe UXP logs for error messages
- Report issues on [GitHub Issues](https://github.com/rmuraix/premianno/issues)

## Next Steps

- [Usage Guide](/guide/usage) - Learn how to use PremiAnno
- [Getting Started](/guide/getting-started) - Quick start guide
