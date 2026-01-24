import { createContext, useContext, useState, ReactNode } from 'react';

export type Framework = 'html' | 'react' | 'vue' | 'svelte';

interface FrameworkContextValue {
  framework: Framework;
  setFramework: (fw: Framework) => void;
}

const FrameworkContext = createContext<FrameworkContextValue | undefined>(undefined);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, setFramework] = useState<Framework>('html');
  return (
    <FrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within FrameworkProvider');
  }
  return context;
}
