export const THEME_STORAGE_KEY = "atlas-theme";
export const WELCOME_COMPLETE_KEY = "atlas-welcome-complete";

export type ThemePreference = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export const THEME_COLOR: Record<ResolvedTheme, string> = {
  dark: "#060b14",
  light: "#f4f6fb",
};

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

export function loadThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore quota errors */
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return getSystemTheme();
  return preference;
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_COLOR[theme]);
  }
}

export function loadWelcomeComplete(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(WELCOME_COMPLETE_KEY) === "true";
  } catch {
    return true;
  }
}

export function saveWelcomeComplete(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WELCOME_COMPLETE_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** Inline script for layout — prevents theme flash before React hydrates. */
export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t='dark';if(s==='light'||s==='dark'){t=s;}else if(s==='system'||!s){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',t==='light'?'${THEME_COLOR.light}':'${THEME_COLOR.dark}');}}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
