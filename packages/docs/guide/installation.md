# Installation

This guide provides detailed instructions for installing PremiAnno in Adobe Premiere Pro.

## System Requirements

- **Adobe Premiere Pro**: 25.6 or later (the first version with official UXP support)
- **Operating System**: Windows 10/11 or macOS 12+

## Installation Steps

### Method 1: Using the CCX installer (Recommended)

1. **Download PremiAnno**
   - Visit the [Release Page](https://github.com/rmuraix/premianno/releases)
   - Download the latest `.ccx` file

2. **Install PremiAnno**
   - Double-click the downloaded `.ccx` file to launch the Creative Cloud plugin installer
   - Alternatively, open [ZXP/UXP Installer](https://aescripts.com/learn/zxp-installer/) and drag and drop the `.ccx` file into it
   - Wait for the installation to complete

3. **Restart Premiere Pro**
   - Close Adobe Premiere Pro if it's running
   - Launch Premiere Pro

4. **Access PremiAnno**
   - In Premiere Pro, go to **Window > UXP Plugins > PremiAnno**
   - The PremiAnno panel will appear

### Method 2: Loading from source (Advanced)

For developers or advanced users who want to run the plugin from source:

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
   pnpm uxp build
   ```

4. **Load the Plugin**
   - Enable **Developer Mode** in Premiere Pro's Plugins preferences
   - Open [UXP Developer Tool (UDT)](https://developer.adobe.com/premiere-pro/uxp/introduction/essentials/dev-tools/)
   - Add the plugin by selecting `packages/uxp/dist/manifest.json`
   - Click **Load** and open the panel from **Window > UXP Plugins > PremiAnno**

For more details on development setup, see the [Development Guide](/guide/development).

## Verification

After installation, verify that PremiAnno is working:

1. Open Adobe Premiere Pro
2. Create or open a project
3. Go to **Window > UXP Plugins > PremiAnno**
4. The PremiAnno panel should appear and be functional

## Troubleshooting

### Plugin Not Appearing

- Ensure you've restarted Premiere Pro after installation
- Check that you're running Premiere Pro 25.6 or later
- Try reinstalling the plugin

### Installation Fails

- Check that you downloaded the correct CCX release asset
- Ensure you have run Premiere Pro at least once before installing
- Ensure you have administrator privileges on your system

### Plugin Crashes

- Report issues on [GitHub Issues](https://github.com/rmuraix/premianno/issues)

## Next Steps

- [Usage Guide](/guide/usage) - Learn how to use PremiAnno
- [Getting Started](/guide/getting-started) - Quick start guide
