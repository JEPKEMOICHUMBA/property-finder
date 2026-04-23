'use client'

import MarketTrends from '@/components/MarketTrends'

export default function MarketTrendsPage() {
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
             Market Trends
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Live property market analysis across Nairobi based on current listings
          </p>
        </div>

        <MarketTrends />

      </div>
    </div>
  )
}