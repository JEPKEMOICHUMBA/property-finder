'use client'

import { useEffect, useState, useRef } from 'react'

interface Property {
  property_id: number
  title: string
  price: number
  location: string
  bedrooms: number
  size: number
  description: string
  ownership_status: string
  created_at: string
  latitude: number
  longitude: number
}

interface MarketData {
  overall: {
    total_listings: number
    avg_price: number
    median_price: number
    min_price: number
    max_price: number
  }
  by_location: { location: string; count: number; avg_price: number }[]
  by_type: { house: number; land: number }
  price_bands: Record<string, number>
}

export default function ReportsPage() {
  const printRef                    = useRef<HTMLDivElement>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [market, setMarket]         = useState<MarketData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [reportType, setReportType] = useState<'full' | 'summary' | 'verified'>('full')

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 0
    }).format(n)

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/api/properties/map').then(r => r.json()),
      fetch('http://127.0.0.1:5000/api/market-trends').then(r => r.json())
    ]).then(([props, mkt]) => {
      setProperties(props)
      setMarket(mkt)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Price (KES)', 'Location', 'Bedrooms', 'Size (m²)', 'Ownership Status', 'Listed Date']
    const rows = filtered.map(p => [
      p.property_id,
      `"${p.title}"`,
      p.price,
      `"${p.location}"`,
      p.bedrooms,
      p.size,
      p.ownership_status,
      new Date(p.created_at).toLocaleDateString('en-KE')
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `property-finder-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = properties.filter(p => {
    const matchStatus   = !filterStatus   || p.ownership_status === filterStatus
    const matchLocation = !filterLocation || p.location.toLowerCase().includes(filterLocation.toLowerCase())
    const matchType     = reportType === 'verified'
      ? p.ownership_status === 'Verified'
      : true
    return matchStatus && matchLocation && matchType
  })

  const verifiedCount = filtered.filter(p => p.ownership_status === 'Verified').length
  const pendingCount  = filtered.filter(p => p.ownership_status === 'Pending').length
  const disputedCount = filtered.filter(p => p.ownership_status === 'Disputed').length
  const avgPrice      = filtered.length
    ? filtered.reduce((s, p) => s + p.price, 0) / filtered.length
    : 0

  const ownershipColor = (s: string) => ({
    'Verified': { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '' },
    'Disputed': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '' },
    'Pending':  { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '' }
  }[s] || { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '' })

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
      Loading report data...
    </div>
  )

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .report-container { padding: 0 !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="report-container" style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                 Property Listings Report
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Generated on {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Action buttons */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCSV}
                style={{ background: '#ffffff', color: '#052112', border: '1.5px solid #052112', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                ⬇ Export CSV
              </button>
              <button
                onClick={handlePrint}
                style={{ background: '#052112', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                 Print Report
              </button>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="no-print" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Report Type:</span>
            {[
              { id: 'full',     label: 'Full Report' },
              { id: 'summary',  label: 'Summary Only' },
              { id: 'verified', label: ' Verified Properties' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as 'full' | 'summary' | 'verified')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${reportType === t.id ? '#052112' : '#e5e7eb'}`,
                  background: reportType === t.id ? '#052112' : '#ffffff',
                  color: reportType === t.id ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {t.label}
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '160px' }}
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#ffffff' }}
              >
                <option value="">All Status</option>
                <option value="Verified"> Verified</option>
                <option value="Pending"> Pending</option>
                <option value="Disputed"> Disputed</option>
              </select>
            </div>
          </div>

          {/* Report content — this section prints */}
          <div ref={printRef}>

            {/* Print header — only shows when printing */}
            <div className="print-only" style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #052112' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#052112' }}> Property Finder</h1>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>Property Listings Report</h2>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Generated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Summary Statistics */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Executive Summary
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Total Listings',    value: filtered.length.toString(),  icon: '', color: '#052112' },
                  { label: 'Average Price',      value: fmt(avgPrice),               icon: '', color: '#0a4a26' },
                  { label: 'Verified',           value: verifiedCount.toString(),    icon: '', color: '#16a34a' },
                  { label: 'Disputed',           value: disputedCount.toString(),    icon: '', color: '#dc2626' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Ownership breakdown bar */}
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Ownership Status Distribution
                </p>
                <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
                  {[
                    { count: verifiedCount, color: '#16a34a', label: 'Verified' },
                    { count: pendingCount,  color: '#d97706', label: 'Pending'  },
                    { count: disputedCount, color: '#dc2626', label: 'Disputed' },
                  ].map((seg, i) => {
                    const pct = filtered.length > 0 ? (seg.count / filtered.length) * 100 : 0
                    return pct > 0 ? (
                      <div key={i} style={{ width: `${pct}%`, background: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#fff', fontWeight: '700' }}>
                          {pct > 8 ? `${pct.toFixed(0)}%` : ''}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  {[
                    { label: 'Verified',  count: verifiedCount, color: '#16a34a' },
                    { label: 'Pending',   count: pendingCount,  color: '#d97706' },
                    { label: 'Disputed',  count: disputedCount, color: '#dc2626' },
                  ].map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
                      <span style={{ fontSize: '12px', color: '#374151' }}>{l.label}: {l.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Overview — only in full and summary */}
            {market && reportType !== 'verified' && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                  Market Overview
                </h2>
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#052112', color: '#ffffff' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '600' }}>Area</th>
                        <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '600' }}>Listings</th>
                        <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '600' }}>Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {market.by_location.slice(0, 8).map((loc, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 16px', color: '#374151', fontWeight: '500' }}>{loc.location}</td>
                          <td style={{ padding: '10px 16px', color: '#6b7280', textAlign: 'right' }}>{loc.count}</td>
                          <td style={{ padding: '10px 16px', color: '#052112', fontWeight: '700', textAlign: 'right' }}>{fmt(loc.avg_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Property Listings Table — only in full and verified */}
            {reportType !== 'summary' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                    Property Listings ({filtered.length})
                  </h2>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#052112', color: '#ffffff' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Property</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Location</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Beds</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Size m²</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>Ownership</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => {
                        const cfg = ownershipColor(p.ownership_status)
                        return (
                          <tr
                            key={p.property_id}
                            style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                            onClick={() => window.location.href = `/property/${p.property_id}`}
                          >
                            <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '12px' }}>#{p.property_id}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', fontWeight: '500', maxWidth: '200px' }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                {p.bedrooms === 0 ? 'Land' : 'Residential'}
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#374151' }}>
                              {p.location?.split(',')[0]}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>
                              {p.bedrooms === 0 ? '—' : p.bedrooms}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>
                              {p.size}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#052112', fontWeight: '700', textAlign: 'right' }}>
                              {fmt(p.price)}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{
                                background: cfg.bg,
                                color: cfg.color,
                                border: `1px solid ${cfg.border}`,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}>
                                {cfg.icon} {p.ownership_status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {filtered.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                      <p>No properties match the selected filters.</p>
                    </div>
                  )}
                </div>

                {/* Report footer */}
                <div style={{ marginTop: '20px', padding: '16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                  <span> Property Finder — Nairobi Property Market Report</span>
                  <span>Total: {filtered.length} listings · Avg: {fmt(avgPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}