import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ThemeProvider } from '@/hooks/use-theme'
import App from './App.tsx'
import './index.css'

// Initialize application
const initApp = () => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

// Start the application
initApp();
