import { NavLink } from 'react-router'
import type { NavItem } from '../nav'

interface NavSectionProps {
  title: string
  items: NavItem[]
}

// Icon components for each nav item type
function BookIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function ButtonIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M9 12h6" />
    </svg>
  )
}

function DialogIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  )
}

function InputIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 12h1" />
    </svg>
  )
}

function TextareaIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="6" rx="1" />
      <rect x="2" y="15" width="20" height="6" rx="1" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function MigrationIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

function StylingIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
      <path d="M7 8h2" />
      <path d="M7 12h2" />
      <path d="M15 8h2" />
      <path d="M15 12h2" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function AgentSkillsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  )
}

function CheckboxIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function RadioIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SelectIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M15 11l2 2 2-2" />
    </svg>
  )
}

function SwitchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="22" height="10" rx="5" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  )
}

function AccessibilityIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <path d="M8 11h8" />
      <path d="M12 11v4" />
      <path d="M10 19l2-4 2 4" />
    </svg>
  )
}

function FormIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h4" />
      <rect x="7" y="11" width="10" height="2.5" rx="0.5" />
      <path d="M7 17h4" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function AccordionIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="4" rx="1" />
      <path d="M15 5l-3 0" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <path d="M15 12h-3" />
      <rect x="3" y="17" width="18" height="4" rx="1" />
      <path d="M15 19h-3" />
    </svg>
  )
}

function DataTableIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
    </svg>
  )
}

function DatePickerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <rect x="10" y="14" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DateRangeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M11.5 15.5h3" />
    </svg>
  )
}

function PopoverIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="12" height="8" rx="2" />
      <rect x="10" y="4" width="12" height="8" rx="2" />
    </svg>
  )
}

function TabsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <path d="M3 8V6a2 2 0 0 1 2-2h4l2 4" />
      <path d="M11 4h4l2 4" />
    </svg>
  )
}

function TimePickerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function ToastIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 17h6" />
      <path d="M6 10l2 4" />
      <path d="M18 10l-2 4" />
      <path d="M6 10h12" />
    </svg>
  )
}

function TooltipIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5l-3 4-3-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9 9h6" />
    </svg>
  )
}

function LineChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20V4" />
      <path d="M3 20h18" />
      <path d="M3 16l4-4 4 2 4-7 4 3" />
    </svg>
  )
}

function AreaChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M3 16l4-4 4 2 4-7 4 3V20H3z" fill="currentColor" fillOpacity="0.2" stroke="none" />
      <path d="M3 16l4-4 4 2 4-7 4 3" />
    </svg>
  )
}

function BarChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <rect x="4" y="10" width="4" height="10" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="10" y="6" width="4" height="14" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="16" y="13" width="4" height="7" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PieChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9H12V3z" />
      <path d="M12 3v9h9" />
    </svg>
  )
}

function ScatterChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M3 20V4" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function HeatmapChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="12" y="3" width="9" height="7" rx="0.5" />
      <rect x="3" y="12" width="9" height="9" rx="0.5" />
      <rect x="14" y="12" width="7" height="9" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CandlestickChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="4" x2="6" y2="20" />
      <rect x="4" y="7" width="4" height="8" rx="0.5" fill="currentColor" stroke="none" />
      <line x1="12" y1="3" x2="12" y2="20" />
      <rect x="10" y="6" width="4" height="8" rx="0.5" />
      <line x1="18" y1="5" x2="18" y2="19" />
      <rect x="16" y="9" width="4" height="6" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TreemapChartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 13h11" />
      <path d="M14 3v10" />
      <path d="M14 17h7" />
    </svg>
  )
}

// Map of item titles to their icons
const iconMap: Record<string, () => JSX.Element> = {
  'Getting Started': BookIcon,
  'Installation': DownloadIcon,
  'Accessibility': AccessibilityIcon,
  'Agent Skills': AgentSkillsIcon,
  'Form Integration': FormIcon,
  'Internationalization': GlobeIcon,
  'Migration': MigrationIcon,
  'SSR Setup': ServerIcon,
  'Styling': StylingIcon,
  'Accordion': AccordionIcon,
  'Button': ButtonIcon,
  'Calendar': CalendarIcon,
  'Checkbox': CheckboxIcon,
  'Data Table': DataTableIcon,
  'Date Picker': DatePickerIcon,
  'Date Range Picker': DateRangeIcon,
  'Dialog': DialogIcon,
  'Input': InputIcon,
  'Popover': PopoverIcon,
  'Radio': RadioIcon,
  'Select': SelectIcon,
  'Switch': SwitchIcon,
  'Tabs': TabsIcon,
  'Textarea': TextareaIcon,
  'Time Picker': TimePickerIcon,
  'Toast': ToastIcon,
  'Tooltip': TooltipIcon,
  'Theme Configurator': PaletteIcon,
  'Line Chart': LineChartIcon,
  'Area Chart': AreaChartIcon,
  'Bar Chart': BarChartIcon,
  'Pie Chart': PieChartIcon,
  'Scatter Chart': ScatterChartIcon,
  'Heatmap Chart': HeatmapChartIcon,
  'Candlestick Chart': CandlestickChartIcon,
  'Treemap Chart': TreemapChartIcon,
}

export function NavSection({ title, items }: NavSectionProps) {
  return (
    <div>
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const IconComponent = iconMap[item.title]
          return (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gray-900 dark:bg-gray-100 transition-all duration-300 ${
                        isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                      }`}
                    />
                    {IconComponent && (
                      <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}>
                        <IconComponent />
                      </span>
                    )}
                    <span>{item.title}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
