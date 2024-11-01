import { atom } from "jotai";
import { atomWithStorage, useAtomValue, useUpdateAtom } from "jotai/utils";
import { useMemo } from "react";

const DARKMODE_MEDIA_QUERY = window.matchMedia("(prefers-color-scheme: dark)");

export enum ThemeMode {
  LIGHT,
  DARK,
  AUTO,
}

// Tracks the device theme
const systemThemeAtom = atom<ThemeMode.LIGHT | ThemeMode.DARK>(
  DARKMODE_MEDIA_QUERY.matches ? ThemeMode.DARK : ThemeMode.LIGHT
);

// Tracks the user's selected theme mode
const themeModeAtom = atomWithStorage<ThemeMode>(
  "interface_color_theme",
  ThemeMode.AUTO
);
export function useIsDarkMode(): boolean {
  const mode = useAtomValue(themeModeAtom);
  const systemTheme = useAtomValue(systemThemeAtom);

  return (mode === ThemeMode.AUTO ? systemTheme : mode) === ThemeMode.DARK;
}

export function useDarkModeManager(): [boolean, (mode: ThemeMode) => void] {
  const isDarkMode = useIsDarkMode();
  const setMode = useUpdateAtom(themeModeAtom);

  return useMemo(() => {
    return [isDarkMode, setMode];
  }, [isDarkMode, setMode]);
}
