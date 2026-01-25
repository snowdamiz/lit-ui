import { BrowserRouter, Routes, Route } from 'react-router'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/GettingStarted'
import { Installation } from './pages/Installation'
import { SSRGuide } from './pages/SSRGuide'
import { Placeholder } from './pages/Placeholder'
import { ButtonPage } from './pages/components/ButtonPage'
import { DialogPage } from './pages/components/DialogPage'

export default function App() {
  return (
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
          <Route path="guides/ssr" element={<SSRGuide />} />
          <Route path="guides/migration" element={<Placeholder />} />

          {/* Components */}
          <Route path="components/button" element={<ButtonPage />} />
          <Route path="components/dialog" element={<DialogPage />} />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
