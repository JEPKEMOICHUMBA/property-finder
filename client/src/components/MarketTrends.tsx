'use client'

import { useEffect, useState } from 'react'

interface LocationStat {
  location: string
  count: number
  avg_price: number
  min_price: number
  max_price: number
  median_price: number
}

interface MarketData {
  overall: {
    total_listings: number
    avg_price: number
    median_price: number
    min_price: number
    max_price: number
    std_deviation: number
  }
  by_location: LocationStat[]
  by_bedrooms: Record<string, number>
  by_type: { house: number; land: number }
  price_bands: Record<string, number>
}

export default function MarketTrends() {
  const [data, setData]       = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'locations' | 'bands' | 'types'>('locations')

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/market-trends')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 0,
      notation: n >= 1_000_000 ? 'compact' : 'standard'
    }).format(n)

  const maxAvg = data
    ? Math.max(...data.by_location.map(l => l.avg_price))
    : 1

  if (loading) return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
      Loading market trends...
    </div>
  )
  if (!data) return null

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #052112, #0a4a26)',
        padding: '20px 24px',
        color: '#ffffff'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
           Nairobi Property Market Trends
        </h3>
        <p style={{ fontSize: '13px', opacity: 0.8 }}>
          Live analysis from {data.overall.total_listings} property listings
        </p>
      </div>

      {/* Overall stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { label: 'Total Listings',   value: data.overall.total_listings.toString(), icon: '' },
          { label: 'Average Price',    value: fmt(data.overall.avg_price),             icon: '' },
          { label: 'Median Price',     value: fmt(data.overall.median_price),          icon: '' },
          { label: 'Price Range',      value: `${fmt(data.overall.min_price)} – ${fmt(data.overall.max_price)}`, icon: '' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '16px',
            borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#052112' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { id: 'locations', label: ' By Area' },
          { id: 'bands',     label: ' Price Bands' },
          { id: 'types',     label: ' Property Types' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#052112' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #052112' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 24px' }}>

        {/* By Location */}
        {activeTab === 'locations' && (
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Average property price by Nairobi area — sorted highest to lowest
            </p>
            {data.by_location.slice(0, 10).map((loc, i) => {
              const barWidth = (loc.avg_price / maxAvg) * 100
              return (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                      {loc.location}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#052112' }}>
                        {fmt(loc.avg_price)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>
                        avg · {loc.count} listing{loc.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{
                    height: '8px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, #052112, #1a6b3a)`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  {/* Min-max range */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                      Min: {fmt(loc.min_price)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                      Max: {fmt(loc.max_price)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Price Bands */}
        {activeTab === 'bands' && (
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Distribution of listings across price ranges
            </p>
            {Object.entries(data.price_bands).map(([band, count], i) => {
              const total = Object.values(data.price_bands).reduce((a,b) => a+b, 0)
              const pct   = total > 0 ? (count / total) * 100 : 0
              const colors = ['#052112','#0a4a26','#1a6b3a','#2d9e5f','#52c99e']
              return (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                      KES {band}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#052112' }}>
                      {count} listings ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '24px',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: colors[i] || '#052112',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      transition: 'width 0.5s ease'
                    }}>
                      {pct > 10 && (
                        <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: '600' }}>
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Property Types */}
        {activeTab === 'types' && (
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              Breakdown of listing types and bedroom distribution
            </p>

            {/* House vs Land */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {[
                { label: 'Residential Properties', count: data.by_type.house, icon: '', color: '#052112' },
                { label: 'Land Listings',          count: data.by_type.land,  icon: '', color: '#0a4a26' }
              ].map((t,i) => (
                <div key={i} style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{t.icon}</div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: t.color,
                    marginBottom: '4px'
                  }}>
                    {t.count}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.label}</div>
                </div>
              ))}
            </div>

            {/* Bedroom distribution */}
            <h4 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Listings by bedroom count
            </h4>
            {Object.entries(data.by_bedrooms)
              .sort((a,b) => a[0].localeCompare(b[0]))
              .map(([beds, count], i) => {
                const total = Object.values(data.by_bedrooms).reduce((a,b)=>a+b,0)
                const pct   = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#374151',
                      width: '70px',
                      flexShrink: 0
                    }}>
                      {beds}
                    </span>
                    <div style={{
                      flex: 1,
                      height: '16px',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #052112, #1a6b3a)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#052112',
                      width: '60px',
                      textAlign: 'right'
                    }}>
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}