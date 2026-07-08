import React, { useEffect, useState } from 'react'
import axios from 'axios'

const GOLD = '#C9A84C'
const NAV = '#1C2B35'

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)', minWidth: 160, flex: 1
    }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: NAV }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: GOLD, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('/api/dashboard/summary').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <p>Loading dashboard...</p>

  return (
    <div>
      <h2 style={{ color: NAV, marginBottom: 20 }}>Dashboard</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Active Reps" value={data.active_reps} />
        <StatCard label="Territories" value={data.total_territories} />
        <StatCard label="Quota Periods" value={data.quota_periods} />
        <StatCard
          label="Total Quota"
          value={`$${Number(data.total_quota).toLocaleString()}`}
        />
        <StatCard
          label="Total Attainment"
          value={`$${Number(data.total_attainment).toLocaleString()}`}
          sub={`${data.overall_attainment_pct}% of quota`}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <h3 style={{ color: NAV, marginBottom: 12 }}>Overall Attainment</h3>
        <div style={{ background: '#eee', borderRadius: 8, height: 24, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(data.overall_attainment_pct, 100)}%`,
            background: GOLD,
            height: '100%',
            borderRadius: 8,
            transition: 'width 0.6s ease'
          }} />
        </div>
        <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
          {data.overall_attainment_pct}% attained across all reps and periods
        </div>
      </div>
    </div>
  )
}
