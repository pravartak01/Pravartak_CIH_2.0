
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root with error boundary
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(<App />);
