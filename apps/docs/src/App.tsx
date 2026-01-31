import { BrowserRouter, Routes, Route } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/GettingStarted'
import { Installation } from './pages/Installation'
import { StylingPage } from './pages/StylingPage'
import { SSRGuide } from './pages/SSRGuide'
import { MigrationGuide } from './pages/MigrationGuide'
import { AgentSkillsGuide } from './pages/AgentSkillsGuide'
import { Placeholder } from './pages/Placeholder'
import { ButtonPage } from './pages/components/ButtonPage'
import { CalendarPage } from './pages/components/CalendarPage'
import { CheckboxPage } from './pages/components/CheckboxPage'
import { DialogPage } from './pages/components/DialogPage'
import { InputPage } from './pages/components/InputPage'
import { RadioPage } from './pages/components/RadioPage'
import { TextareaPage } from './pages/components/TextareaPage'
import { SelectPage } from './pages/components/SelectPage'
import { SwitchPage } from './pages/components/SwitchPage'
import { ConfiguratorPage } from './pages/configurator/ConfiguratorPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DocsLayout />}>
            {/* Index route - shows Getting Started */}
            <Route index element={<GettingStarted />} />

            {/* Getting Started */}
            <Route path="getting-started" element={<GettingStarted />} />

            {/* Installation */}
            <Route path="installation" element={<Installation />} />

            {/* Guides */}
            <Route path="guides/styling" element={<StylingPage />} />
            <Route path="guides/ssr" element={<SSRGuide />} />
            <Route path="guides/migration" element={<MigrationGuide />} />
            <Route path="guides/agent-skills" element={<AgentSkillsGuide />} />

            {/* Tools */}
            <Route path="configurator" element={<ConfiguratorPage />} />

            {/* Components */}
            <Route path="components/button" element={<ButtonPage />} />
            <Route path="components/calendar" element={<CalendarPage />} />
            <Route path="components/checkbox" element={<CheckboxPage />} />
            <Route path="components/dialog" element={<DialogPage />} />
            <Route path="components/input" element={<InputPage />} />
            <Route path="components/radio" element={<RadioPage />} />
            <Route path="components/textarea" element={<TextareaPage />} />
            <Route path="components/select" element={<SelectPage />} />
            <Route path="components/switch" element={<SwitchPage />} />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<Placeholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
