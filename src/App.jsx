import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './components/Home'
import ClaimPage from './components/ClaimPage'
import HowItWorks from './pages/HowItWorks'
import Security from './pages/Security'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function MainApp() {
  const [page, setPage] = useState('home')
  if (page === 'claim') return <ClaimPage onBack={() => setPage('home')} />
  return <Home onScan={() => setPage('claim')} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/security" element={<Security />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}
