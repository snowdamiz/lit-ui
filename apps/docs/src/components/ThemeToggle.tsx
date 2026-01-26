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
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
