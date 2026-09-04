// Premiere Pro UI color palettes, used to polyfill the `--uxp-host-*` CSS
// variables that Premiere Pro does not currently provide to UXP plugins.
// Source: hyperbrew/bolt-uxp (MIT). See NOTICE.md.
type ColorPaletteTable = {
  mac: {
    darkest: Record<string, string>;
    dark: Record<string, string>;
    light: Record<string, string>;
    lightest?: Record<string, string>;
  };
  win: {
    darkest: Record<string, string>;
    dark: Record<string, string>;
    light: Record<string, string>;
    lightest?: Record<string, string>;
  };
};

export const premiereColors: ColorPaletteTable = {
  mac: {
    darkest: {
      "--uxp-host-background-color": "#1D1D1D",
      "--uxp-host-text-color": "#D0D0D0",
      "--uxp-host-border-color": "#303030",
      "--uxp-host-link-text-color": "#4096F3",
      "--uxp-host-link-hover-text-color": "#5EAAF7",
      "--uxp-host-label-text-color": "#B0B0B0",
      "--uxp-host-widget-hover-background-color": "#000000",
      "--uxp-host-widget-hover-text-color": "#D0D0D0",
      "--uxp-host-widget-hover-border-color": "#4B4B4B",
      "--uxp-host-text-color-secondary": "#B0B0B0",
    },
    dark: {
      "--uxp-host-background-color": "#323232",
      "--uxp-host-text-color": "#D1D1D1",
      "--uxp-host-border-color": "#3F3F3F",
      "--uxp-host-link-text-color": "#54A3F6",
      "--uxp-host-link-hover-text-color": "#72B7F9",
      "--uxp-host-label-text-color": "#B2B2B2",
      "--uxp-host-widget-hover-background-color": "#1D1D1D",
      "--uxp-host-widget-hover-text-color": "#D1D1D1",
      "--uxp-host-widget-hover-border-color": "#545454",
      "--uxp-host-text-color-secondary": "#B2B2B2",
    },
    light: {
      "--uxp-host-background-color": "#F8F8F8",
      "--uxp-host-text-color": "#464646",
      "--uxp-host-border-color": "#E6E6E6",
      "--uxp-host-link-text-color": "#147AF3",
      "--uxp-host-link-hover-text-color": "#0265DC",
      "--uxp-host-label-text-color": "#6D6D6D",
      "--uxp-host-widget-hover-background-color": "#FFFFFF",
      "--uxp-host-widget-hover-text-color": "#464646",
      "--uxp-host-widget-hover-border-color": "#D5D5D5",
      "--uxp-host-text-color-secondary": "#6D6D6D",
    },
  },
  win: {
    darkest: {
      "--uxp-host-background-color": "#1D1D1D",
      "--uxp-host-text-color": "#D0D0D0",
      "--uxp-host-border-color": "#303030",
      "--uxp-host-link-text-color": "#0098FA",
      "--uxp-host-link-hover-text-color": "#3DACFE",
      "--uxp-host-label-text-color": "#B0B0B0",
      "--uxp-host-widget-hover-background-color": "#000000",
      "--uxp-host-widget-hover-text-color": "#D0D0D0",
      "--uxp-host-widget-hover-border-color": "#4B4B4B",
      "--uxp-host-text-color-secondary": "#B0B0B0",
    },
    dark: {
      "--uxp-host-background-color": "#323232",
      "--uxp-host-text-color": "#D1D1D1",
      "--uxp-host-border-color": "#3F3F3F",
      "--uxp-host-link-text-color": "#2DA5FD",
      "--uxp-host-link-hover-text-color": "#57AFF0",
      "--uxp-host-label-text-color": "#B2B2B2",
      "--uxp-host-widget-hover-background-color": "#1D1D1D",
      "--uxp-host-widget-hover-text-color": "#D1D1D1",
      "--uxp-host-widget-hover-border-color": "#545454",
      "--uxp-host-text-color-secondary": "#B2B2B2",
    },
    light: {
      "--uxp-host-background-color": "#F8F8F8",
      "--uxp-host-text-color": "#464646",
      "--uxp-host-border-color": "#E6E6E6",
      "--uxp-host-link-text-color": "#0067E4",
      "--uxp-host-link-hover-text-color": "#0056BD",
      "--uxp-host-label-text-color": "#6D6D6D",
      "--uxp-host-widget-hover-background-color": "#FFFFFF",
      "--uxp-host-widget-hover-text-color": "#464646",
      "--uxp-host-widget-hover-border-color": "#D5D5D5",
      "--uxp-host-text-color-secondary": "#6D6D6D",
    },
  },
};
