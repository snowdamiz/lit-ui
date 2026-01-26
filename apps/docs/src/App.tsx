import { BrowserRouter, Routes, Route } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/GettingStarted'
import { Installation } from './pages/Installation'
import { StylingPage } from './pages/StylingPage'
import { SSRGuide } from './pages/SSRGuide'
import { MigrationGuide } from './pages/MigrationGuide'
import { Placeholder } from './pages/Placeholder'
import { ButtonPage } from './pages/components/ButtonPage'
import { DialogPage } from './pages/components/DialogPage'
import { InputPage } from './pages/components/InputPage'
import { TextareaPage } from './pages/components/TextareaPage'
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

            {/* Tools */}
            <Route path="configurator" element={<ConfiguratorPage />} />

            {/* Components */}
            <Route path="components/button" element={<ButtonPage />} />
            <Route path="components/dialog" element={<DialogPage />} />
            <Route path="components/input" element={<InputPage />} />
            <Route path="components/textarea" element={<TextareaPage />} />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<Placeholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
