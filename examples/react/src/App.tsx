import LitDemo from './components/LitDemo';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Lit UI + React Example</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        This example demonstrates using Lit UI components with React 19 and Vite.
      </p>
      <LitDemo />
    </div>
  );
}

export default App;
