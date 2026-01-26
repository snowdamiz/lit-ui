/**
 * ThemeContext - Docs Site Dark Mode State Management
 *
 * Provides React context for managing the docs site theme (light/dark):
 * - Global theme state accessible throughout the app
 * - localStorage persistence for user preference
 * - DOM class toggling for CSS variable cascading
 * - Initializes from FOUC prevention script (inline in index.html)
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

/**
 * Theme value type - only light and dark, no system option.
 */
export type Theme = "light" | "dark";

/**
 * Context value shape exposed to consumers.
 */
interface ThemeContextValue {
  /** Current theme */
  theme: Theme;
  /** Set the theme (updates state, localStorage, and DOM) */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize state by reading the current dark class on document.documentElement
  // This class is set by the FOUC prevention script in index.html before React hydrates
  const [theme, setThemeState] = useState<Theme>(() => {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const setTheme = useCallback((newTheme: Theme) => {
    // Update React state
    setThemeState(newTheme);

    // Persist to localStorage (wrapped in try-catch for private browsing compatibility)
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // localStorage unavailable (private browsing, storage quota, etc.)
    }

    // Toggle dark class on document.documentElement for CSS variable cascading
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access theme state and actions.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
