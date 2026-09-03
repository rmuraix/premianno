import { os } from "../globals";
import { premiereColors } from "./theme-data";

type ThemeName = "lightest" | "light" | "dark" | "darkest";

const fallbackColors: Record<ThemeName, Record<string, string>> = {
  darkest: {
    "--uxp-host-background-color": "#292929",
    "--uxp-host-text-color": "#ffffff",
    "--uxp-host-border-color": "#292929",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#3d3d3d",
    "--uxp-host-widget-hover-text-color": "#ffffff",
    "--uxp-host-widget-hover-border-color": "#3d3d3d",
    "--uxp-host-text-color-secondary": "#9b9b9b",
    "--uxp-host-link-hover-text-color": "#ffffff",
    "--uxp-host-label-text-color": "#ffffff",
  },
  dark: {
    "--uxp-host-background-color": "#535353",
    "--uxp-host-text-color": "#ffffff",
    "--uxp-host-border-color": "#454545",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#5b5b5b",
    "--uxp-host-widget-hover-text-color": "#ffffff",
    "--uxp-host-widget-hover-border-color": "#5b5b5b",
    "--uxp-host-text-color-secondary": "#e5e5e5",
    "--uxp-host-link-hover-text-color": "#ffffff",
    "--uxp-host-label-text-color": "#ffffff",
  },
  light: {
    "--uxp-host-background-color": "#b8b8b8",
    "--uxp-host-text-color": "#424242",
    "--uxp-host-border-color": "#9c9c9c",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#9d9d9d",
    "--uxp-host-widget-hover-text-color": "#424242",
    "--uxp-host-widget-hover-border-color": "#9d9d9d",
    "--uxp-host-text-color-secondary": "#424242",
    "--uxp-host-link-hover-text-color": "#424242",
    "--uxp-host-label-text-color": "#424242",
  },
  lightest: {
    "--uxp-host-background-color": "#f0f0f0",
    "--uxp-host-text-color": "#4b4b4b",
    "--uxp-host-border-color": "#d1d1d1",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#cecece",
    "--uxp-host-widget-hover-text-color": "#4b4b4b",
    "--uxp-host-widget-hover-border-color": "#cecece",
    "--uxp-host-text-color-secondary": "#606060",
    "--uxp-host-link-hover-text-color": "#4b4b4b",
    "--uxp-host-label-text-color": "#4b4b4b",
  },
};

const getCurrentTheme = (): ThemeName => {
  //@ts-expect-error `document.theme` is a UXP-only API
  const theme = document.theme?.getCurrent() as ThemeName | undefined;
  return theme ?? "darkest";
};

export const getColorScheme = () => {
  const theme = getCurrentTheme();
  const platform = os.platform ? os.platform() : "";
  const platformColors = platform.includes("win")
    ? premiereColors.win
    : premiereColors.mac;
  const colors = platformColors[theme] ?? fallbackColors[theme];
  return { theme, colors };
};

export const applyColorScheme = (scheme: {
  theme: string;
  colors: Record<string, string>;
}) => {
  const root = document.querySelector(":root") as HTMLElement | null;
  if (!root) return;
  for (const key of Object.keys(scheme.colors)) {
    root.style.setProperty(key, scheme.colors[key]);
  }
  document.documentElement.dataset.theme = scheme.theme;
};

/**
 * Premiere Pro does not populate the `--uxp-host-*` CSS variables, so the
 * panel resolves them itself and keeps them in sync with the host theme.
 */
export const initTheme = () => {
  applyColorScheme(getColorScheme());
  //@ts-expect-error `document.theme` is a UXP-only API
  document.theme?.onUpdated?.addListener(() => {
    applyColorScheme(getColorScheme());
  });
};
