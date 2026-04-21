'use client'

import { useEffect, useState } from 'react'
import MapWrapper from '@/components/map/MapWrapper'
import PropertyCard from '@/components/PropertyCard'
import MarketTrends from '@/components/MarketTrends'
interface Property {
  property_id: number
  title: string
  price: number
  location: string
  bedrooms: number
  size: number
  latitude: number
  longitude: number
  description: string
  images: string[]
  personalized?: boolean
}

const recentSearches = [
  'Karen, Nairobi',
  '3 Bedroom House',
  'Westlands Apartment',
  'Land - Thika Road',
  'Kilimani 2 Bedroom',
]

const LOCATIONS = [
  'Karen', 'Westlands', 'Kilimani', 'Muthaiga', 'Kasarani',
  'Runda', 'Nairobi CBD', 'Thika Road', 'Lavington',
  'Kileleshwa', 'Parklands', 'Ruaka', 'Syokimau', 'Ngong Road'
]

export default function Home() {
  const [properties, setProperties]                   = useState<Property[]>([])
  const [loading, setLoading]                         = useState(true)
  const [error, setError]                             = useState('')
  const [showMap, setShowMap]                         = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [recommendations, setRecommendations]         = useState<Property[]>([])
  const [recLoading, setRecLoading]                   = useState(false)
  const [recBudget, setRecBudget]                     = useState('')
  const [recBedrooms, setRecBedrooms]                 = useState('')
  const [recLocation, setRecLocation]                 = useState('')
  const [search, setSearch]                           = useState('')
  const [location, setLocation]                       = useState('')
  const [minPrice, setMinPrice]                       = useState('')
  const [maxPrice, setMaxPrice]                       = useState('')
  const [bedrooms, setBedrooms]                       = useState('')
  const [propType, setPropType]                       = useState('')
  const [sortBy, setSortBy]                           = useState('default')
  const [activeFilters, setActiveFilters]             = useState(0)

  const fetchProperties = async (params?: {
    location?: string
    min_price?: string
    max_price?: string
    bedrooms?: string
    type?: string
  }) => {
    setLoading(true)
    setError('')
    try {
      const query = new URLSearchParams()
      if (params?.location)  query.append('location',  params.location)
      if (params?.min_price) query.append('min_price', params.min_price)
      if (params?.max_price) query.append('max_price', params.max_price)
      if (params?.bedrooms)  query.append('bedrooms',  params.bedrooms)
      if (params?.type)      query.append('type',      params.type)

      const url = query.toString()
        ? `http://127.0.0.1:5000/api/properties/search?${query}`
        : `http://127.0.0.1:5000/api/properties/map`

      const res  = await fetch(url)
      const data = await res.json()
      setProperties(data)
    } catch {
      setError('Could not load properties. Is Flask running?')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  //// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    let count = 0
    if (location)  count++
    if (minPrice)  count++
    if (maxPrice)  count++
    if (bedrooms)  count++
    if (propType)  count++
    if (search)    count++
    setActiveFilters(count)
    fetchProperties({
      location:  search || location,
      min_price: minPrice,
      max_price: maxPrice,
      bedrooms,
      type: propType
    })
  }

  const handleReset = () => {
    setSearch('')
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setPropType('')
    setSortBy('default')
    setActiveFilters(0)
    fetchProperties()
  }

  const getSortedProperties = () => {
    const list = [...properties]
    if (sortBy === 'price_asc')  return list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') return list.sort((a, b) => b.price - a.price)
    if (sortBy === 'size_desc')  return list.sort((a, b) => (b.size || 0) - (a.size || 0))
    if (sortBy === 'beds_desc')  return list.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0))
    return list
  }

 const fetchRecommendations = async () => {
  setRecLoading(true)
  try {
    const stored = localStorage.getItem('user')
    const user   = stored ? JSON.parse(stored) : null

    const res = await fetch('http://127.0.0.1:5000/api/recommend', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget:   recBudget   ? Number(recBudget)   : 5000000,
        bedrooms: recBedrooms ? Number(recBedrooms) : 2,
        location: recLocation || '',
        user_id:  user?.user_id || null
      })
    })
    const data = await res.json()
    setRecommendations(data)
  } catch {
    setError('Could not fetch recommendations')
  }
  setRecLoading(false)
}
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price)

  const sorted = getSortedProperties()

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #052112 0%, #0a4a26 60%, #1a6b3a 100%)',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <h2 className="hero-title" style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Find Your Perfect Property in Nairobi
        </h2>
        <p style={{ fontSize: '15px', opacity: 0.8, marginBottom: '28px' }}>
          AI-powered search with real-time price predictions and GIS mapping
        </p>

        {/* Search bar */}
        <div className="hero-search-bar" style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '8px',
          display: 'flex',
          gap: '8px',
          maxWidth: '860px',
          margin: '0 auto 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search by location or property name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              minWidth: '200px',
              border: 'none',
              outline: 'none',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#111827',
              borderRadius: '8px'
            }}
          />
          <select
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', background: '#f9fafb' }}
          >
            <option value="">Any Beds</option>
            <option value="0">Land only</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3 Beds</option>
            <option value="4">4 Beds</option>
            <option value="5">5+ Beds</option>
          </select>
          <select
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', background: '#f9fafb' }}
          >
            <option value="">Any Price</option>
            <option value="1000000">Up to KES 1M</option>
            <option value="3000000">Up to KES 3M</option>
            <option value="5000000">Up to KES 5M</option>
            <option value="10000000">Up to KES 10M</option>
            <option value="20000000">Up to KES 20M</option>
            <option value="50000000">Up to KES 50M</option>
          </select>
          <button
            onClick={handleSearch}
            style={{ background: '#052112', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}
          >
            Search
          </button>
        </div>

        {/* Advanced filters */}
        <div className="filter-row" style={{ display: 'flex', gap: '8px', maxWidth: '860px', margin: '0 auto 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          >
            <option value="" style={{ color: '#111' }}> All Areas</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc} style={{ color: '#111' }}>{loc}</option>
            ))}
          </select>
          <select
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          >
            <option value="" style={{ color: '#111' }}>Min Price</option>
            <option value="500000"  style={{ color: '#111' }}>KES 500K+</option>
            <option value="1000000" style={{ color: '#111' }}>KES 1M+</option>
            <option value="3000000" style={{ color: '#111' }}>KES 3M+</option>
            <option value="5000000" style={{ color: '#111' }}>KES 5M+</option>
            <option value="10000000" style={{ color: '#111' }}>KES 10M+</option>
          </select>
          <select
            value={propType}
            onChange={e => setPropType(e.target.value)}
            style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          >
            <option value=""      style={{ color: '#111' }}>All Types</option>
            <option value="house" style={{ color: '#111' }}>Houses</option>
            <option value="land"  style={{ color: '#111' }}>Land</option>
          </select>
          <button
            onClick={handleSearch}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            Apply {activeFilters > 0 && `(${activeFilters})`}
          </button>
          {activeFilters > 0 && (
            <button
              onClick={handleReset}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Market Trends Dashboard */}
<div style={{ maxWidth: '1400px', margin: '24px auto 0', padding: '0 20px' }}>
  <MarketTrends />
</div>

        {/* AI Recommendations */}
        {!showRecommendations ? (
          <button
            onClick={() => setShowRecommendations(true)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
             Get AI Recommendations
          </button>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}> AI Property Recommendations</h3>
            <div className="rec-filters" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Budget (KES)</label>
                <select value={recBudget} onChange={e => setRecBudget(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', color: '#111827', outline: 'none' }}>
                  <option value="">Any budget</option>
                  <option value="1000000">Up to KES 1M</option>
                  <option value="3000000">Up to KES 3M</option>
                  <option value="5000000">Up to KES 5M</option>
                  <option value="10000000">Up to KES 10M</option>
                  <option value="25000000">Up to KES 25M</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Bedrooms</label>
                <select value={recBedrooms} onChange={e => setRecBedrooms(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', color: '#111827', outline: 'none' }}>
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5">5 Bedrooms</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Preferred Area</label>
                <input
                  type="text"
                  value={recLocation}
                  onChange={e => setRecLocation(e.target.value)}
                  placeholder="e.g. Karen"
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchRecommendations} disabled={recLoading} style={{ background: '#ffffff', color: '#052112', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                {recLoading ? 'Finding...' : '✨ Find Matches'}
              </button>
              <button onClick={() => { setShowRecommendations(false); setRecommendations([]) }} style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    {/* Recommendations Results */}
{recommendations.length > 0 && (
  <div style={{ maxWidth: '1400px', margin: '24px auto 0', padding: '0 20px' }}>
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}> AI Recommended Properties</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{recommendations.length} properties matched your preferences</p>
        </div>
        <button onClick={() => setRecommendations([])} style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Clear</button>
      </div>
      <div className="rec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {recommendations.map((property, i) => (
          <div
            key={property.property_id}
            onClick={() => window.location.href = `/property/${property.property_id}`}
            style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ background: 'linear-gradient(135deg, #052112, #0a4a26)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '28px' }}></span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
               {property.personalized ? ' For You' : `#${i + 1} Match`}
              </span>
            </div>
            <div style={{ padding: '14px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{property.title}</h4>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#052112', marginBottom: '8px' }}>{formatPrice(property.price)}</p>
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b7280' }}>
                {property.bedrooms > 0 && <span>🛏 {property.bedrooms} beds</span>}
                <span>{property.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      {/* No recommendations */}
      {recommendations.length === 0 && !recLoading && showRecommendations && recBudget && (
        <div style={{ maxWidth: '1400px', margin: '24px auto 0', padding: '0 20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No properties found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Try a different area or adjust your budget.</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="main-grid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px' }}>

        {/* Listings */}
        <div className="listings-col">
          {/* Toolbar */}
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827' }}>
                Property Listings
                {activeFilters > 0 && (
                  <span style={{ marginLeft: '8px', background: '#052112', color: '#ffffff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px' }}>
                    {activeFilters} active
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                {loading ? 'Loading...' : `${sorted.length} properties found`}
              </p>
            </div>
            <div className="toolbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', background: '#ffffff' }}>
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="size_desc">Largest First</option>
                <option value="beds_desc">Most Bedrooms</option>
              </select>
              <button onClick={() => setShowMap(!showMap)} style={{ background: showMap ? '#052112' : 'transparent', color: showMap ? '#ffffff' : '#052112', border: '1.5px solid #052112', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {showMap ? ' List' : '🗺 Map'}
              </button>
              {activeFilters > 0 && (
                <button onClick={handleReset} style={{ background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          {/* Active filter tags */}
          {activeFilters > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {(search || location) && <span style={{ background: '#f0fdf4', color: '#052112', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}> {search || location}</span>}
              {maxPrice && <span style={{ background: '#f0fdf4', color: '#052112', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}> Max KES {Number(maxPrice).toLocaleString()}</span>}
              {minPrice && <span style={{ background: '#f0fdf4', color: '#052112', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}> Min KES {Number(minPrice).toLocaleString()}</span>}
              {bedrooms && <span style={{ background: '#f0fdf4', color: '#052112', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{bedrooms === '0' ? 'Land only' : `${bedrooms} Bedrooms`}</span>}
              {propType && <span style={{ background: '#f0fdf4', color: '#052112', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}> {propType === 'land' ? 'Land' : 'Houses'}</span>}
            </div>
          )}

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>⚠️ {error}</div>}

          {/* Map */}
          {showMap && !loading && (
            <div style={{ marginBottom: '24px' }}>
              <MapWrapper properties={sorted.filter(p => p.latitude && p.longitude)} />
            </div>
          )}

          {/* Grid */}
          {!showMap && (
            <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#ffffff', borderRadius: '12px', height: '300px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>Loading...</div>
                ))
              ) : sorted.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>No properties found</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</p>
                  <button onClick={handleReset} style={{ marginTop: '16px', background: '#052112', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Clear All Filters</button>
                </div>
              ) : (
                sorted.map(property => <PropertyCard key={property.property_id} property={property} />)
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Recent Searches */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}> Recent Searches</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => { setSearch(s); handleSearch() }} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                   {s}
                </button>
              ))}
            </div>
          </div>

          {/* Browse by Area */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}> Browse by Area</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {LOCATIONS.slice(0, 8).map(loc => (
                <button key={loc} onClick={() => { setLocation(loc); setSearch(loc); fetchProperties({ location: loc }) }} style={{ background: location === loc ? '#052112' : '#f9fafb', color: location === loc ? '#ffffff' : '#374151', border: `1px solid ${location === loc ? '#052112' : '#e5e7eb'}`, borderRadius: '8px', padding: '9px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: location === loc ? '600' : '400' }}>
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* AI box */}
          <div style={{ background: 'linear-gradient(135deg, #052112, #0a4a26)', borderRadius: '12px', padding: '20px', color: '#ffffff' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>AI Price Prediction</h4>
            <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: '1.6', marginBottom: '14px' }}>Get instant AI-powered price analysis for any property in Nairobi.</p>
            <button onClick={() => window.location.href = '/property/1'} style={{ background: '#ffffff', color: '#052112', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: '100%' }}>
              Try Price Prediction →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}