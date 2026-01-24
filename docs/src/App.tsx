import { BrowserRouter } from 'react-router'

function App() {
  return (
    <BrowserRouter basename="/docs">
      <div className="min-h-screen font-sans">
        <main className="flex items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-foreground">
            lit-ui Documentation
          </h1>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
