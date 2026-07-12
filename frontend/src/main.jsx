import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-login for development and demo mode
const performAutoLogin = async () => {
  if (!localStorage.getItem('token')) {
    try {
      const response = await fetch('http://localhost:5555/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ecosphere.io', password: 'admin123' }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log('Logged in automatically as admin.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Auto-login check failed:', error);
    }
  }
};

performAutoLogin();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
