import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * ThemeToggle - Button to switch between light and dark mode
 *
 * Displays sun icon in dark mode (clicking will switch to light)
 * Displays moon icon in light mode (clicking will switch to dark)
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Dark mode' : 'Light mode'}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-all duration-200 focus-ring overflow-hidden"
    >
      <Sun
        size={20}
        className={`absolute inset-0 m-auto transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      />
      <Moon
        size={20}
        className={`transition-all duration-300 ${
          isDark
            ? '-rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </button>
  )
}
