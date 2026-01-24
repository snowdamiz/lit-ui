import { BrowserRouter, Routes, Route } from 'react-router'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/GettingStarted'
import { Placeholder } from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DocsLayout />}>
          {/* Index route - shows Getting Started */}
          <Route index element={<GettingStarted />} />

          {/* Getting Started */}
          <Route path="getting-started" element={<GettingStarted />} />

          {/* Components */}
          <Route path="components/button" element={<Placeholder />} />
          <Route path="components/dialog" element={<Placeholder />} />

          {/* Guides */}
          <Route path="guides/react" element={<Placeholder />} />
          <Route path="guides/vue" element={<Placeholder />} />
          <Route path="guides/svelte" element={<Placeholder />} />
          <Route path="guides/theming" element={<Placeholder />} />
          <Route path="guides/accessibility" element={<Placeholder />} />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
