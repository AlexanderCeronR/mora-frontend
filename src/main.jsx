import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ToastContainer from './components/ui/Toast.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <App />
            <ToastContainer />
        </ThemeProvider>
    </StrictMode>
)
