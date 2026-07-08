import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reps from './pages/Reps'
import Territories from './pages/Territories'
import Quotas from './pages/Quotas'
import AttainmentPage from './pages/Attainment'
import CompPlans from './pages/CompPlans'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'

const navStyle = {
  background: NAV,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  height: 56,
  gap: 32,
}

const linkStyle = ({ isActive }) => ({
  color: isActive ? GOLD : '#ccc',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
  fontSize: 14,
  letterSpacing: 0.5,
})

export default function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginRight: 16, letterSpacing: 1 }}>
          <span style={{ color: GOLD }}>M</span>arketing51
        </span>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/reps" style={linkStyle}>Reps</NavLink>
        <NavLink to="/territories" style={linkStyle}>Territories</NavLink>
        <NavLink to="/quotas" style={linkStyle}>Quotas</NavLink>
        <NavLink to="/attainment" style={linkStyle}>Attainment</NavLink>
        <NavLink to="/comp-plans" style={linkStyle}>Comp Plans</NavLink>
      </nav>
      <div style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reps" element={<Reps />} />
          <Route path="/territories" element={<Territories />} />
          <Route path="/quotas" element={<Quotas />} />
          <Route path="/attainment" element={<AttainmentPage />} />
          <Route path="/comp-plans" element={<CompPlans />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
