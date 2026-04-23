'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MapWrapper from '@/components/map/MapWrapper'
import ImageUpload from '@/components/ImageUpload'
import SimilarProperties from '@/components/SimilarProperties'

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
  ownership_status?: string
}

interface PredictionResult {
  predicted_price: number
  currency: string
  market_context: {
    average_price_in_area: number
    min_price_in_area: number
    max_price_in_area: number
    total_listings: number
    diff_from_average_pct: number
    verdict: string
  }
}

export default function PropertyDetails() {
  const { id }     = useParams()
  const router     = useRouter()
  const [property, setProperty]   = useState<Property | null>(null)
  const [loading, setLoading]     = useState(true)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price)

useEffect(() => {
  fetch(`http://127.0.0.1:5000/api/properties/${id}`)
    .then(res => res.json())
    .then(data => {
      setProperty(data)
      setImages(data.images || [])
      setLoading(false)
      // Get user role
try {
  const stored = localStorage.getItem('user')
  if (stored) {
    const u = JSON.parse(stored)
    setUserRole(u.role)
  }
} catch {
  // not logged in
}

      // Log interaction if user is logged in
      const stored = localStorage.getItem('user')
      if (stored) {
        const user = JSON.parse(stored)
        fetch('http://127.0.0.1:5000/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:     user.user_id,
            property_id: Number(id),
            preference:  'viewed'
          })
        }).catch(() => {}) // silent fail
      }
    })
    .catch(() => setLoading(false))
}, [id])

  const handlePredict = async () => {
    if (!property) return
    setPredicting(true)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bedrooms: property.bedrooms,
          size:     property.size,
          location: property.location
        })
      })
      const data = await res.json()
      setPrediction(data)
    } catch {
      console.error('Prediction failed')
    }
    setPredicting(false)
  }

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading property...</div>
  )

  if (!property) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626' }}>Property not found.</div>
  )

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '12px 20px', fontSize: '13px', color: '#6b7280' }}>
        <span onClick={() => router.push('/')} style={{ cursor: 'pointer', color: '#052112' }}>Home</span>
        {' → '}
        <span>{property.title}</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
        <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

         {/* Image Gallery */}
<div style={{ marginBottom: '20px' }}>
  {/* Main image */}
  <div style={{
    background: images.length > 0 ? 'transparent' : 'linear-gradient(135deg, #052112, #0a4a26)',
    borderRadius: '16px',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '72px',
    overflow: 'hidden',
    marginBottom: '10px',
    position: 'relative'
  }}>
    {images.length > 0 ? (
      <>
        <img
  src={`http://127.0.0.1:5000${images[currentImage]}`}
  alt="Property"
  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
/>
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentImage(i => (i + 1) % images.length)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}
            >
              ›
            </button>
            {/* Image counter */}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
              {currentImage + 1} / {images.length}
            </div>
          </>
        )}
      </>
    ) : (
      ''
    )}
  </div>

  {/* Thumbnail strip */}
  {images.length > 1 && (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
      {images.map((img, i) => (
        <img
  key={i}
  src={`http://127.0.0.1:5000${img}`}
  alt={`Thumbnail ${i + 1}`}
  onClick={() => setCurrentImage(i)}
  style={{
    width: '72px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer',
    border: currentImage === i ? '2px solid #052112' : '2px solid transparent',
    flexShrink: 0,
    display: 'block'
  }}
/>
      ))}
    </div>
  )}

 {/* Only agents and admins can upload photos */}
{(userRole === 'agent' || userRole === 'admin') && (
  <>
    <button
      onClick={() => setShowUpload(!showUpload)}
      style={{
        marginTop: '12px',
        background: 'transparent',
        color: '#052112',
        border: '1.5px solid #052112',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
      }}
    >
      {showUpload ? '✕ Close Upload' : ' Add Photos'}
    </button>

    {showUpload && (
      <div style={{ marginTop: '16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Upload Property Photos</h3>
        <ImageUpload
          propertyId={property.property_id}
          existingImages={images}
          onUpdate={(newImages) => {
            setImages(newImages)
            setShowUpload(false)
          }}
        />
      </div>
    )}
  </>
)}
</div>

            {/* Title */}
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{property.title}</h1>
            <p style={{ fontSize: '26px', fontWeight: '800', color: '#052112', marginBottom: '16px' }}>{formatPrice(property.price)}</p>

            {/* Stats */}
            <div className="stats-row" style={{ display: 'flex', gap: '20px', padding: '18px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px', flexWrap: 'wrap' }}>
              {property.bedrooms > 0 && (
                <>
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{property.bedrooms}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Bedrooms</div>
                  </div>
                  <div style={{ width: '1px', background: '#e5e7eb' }} />
                </>
              )}
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{property.size}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Size (m²)</div>
              </div>
              <div style={{ width: '1px', background: '#e5e7eb' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{property.location}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Location</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '10px', color: '#111827' }}>Description</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.7' }}>{property.description}</p>
            </div>

            {/* Map */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '14px', color: '#111827' }}> View on Map</h3>
              <MapWrapper properties={[property]} />
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Contact Agent */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '14px', color: '#111827' }}>Contact Agent</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#052112', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}></div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Property Agent</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Licensed Agent</div>
                </div>
              </div>
              <button style={{ width: '100%', background: '#052112', color: '#ffffff', border: 'none', padding: '11px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                 Call Agent
              </button>
              <button style={{ width: '100%', background: 'transparent', color: '#052112', border: '1.5px solid #052112', padding: '11px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                 Send Message
              </button>
            </div>

            {/* AI Price */}
            <div style={{ background: 'linear-gradient(135deg, #052112, #0a4a26)', borderRadius: '12px', padding: '20px', color: '#ffffff' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}></div>
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>AI Price Analysis</h3>
              <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '14px', lineHeight: '1.6' }}>
                Get an AI-powered fair price estimate based on size, location and market data.
              </p>
              {prediction && (
  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Predicted Fair Price</div>
    <div style={{ fontSize: '20px', fontWeight: '700' }}>{formatPrice(prediction.predicted_price)}</div>
    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
      {prediction.predicted_price > property.price ? ' Below market value' : ' Above market value'}
    </div>
    {prediction.market_context && (
      <>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '10px 0' }} />
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          Area avg: {formatPrice(prediction.market_context.average_price_in_area)}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          {prediction.market_context.verdict}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
          Based on {prediction.market_context.total_listings} listings in this area
        </div>
      </>
    )}
  </div>
)}
              <button
                onClick={handlePredict}
                disabled={predicting}
                style={{ width: '100%', background: '#ffffff', color: '#052112', border: 'none', padding: '11px', borderRadius: '8px', cursor: predicting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                {predicting ? 'Analysing...' : 'Predict Price →'}
              </button>
              {/* Similar Properties */}
<SimilarProperties propertyId={property.property_id} />
            </div>

           {/* Property Info */}
<div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#6b7280' }}>
  <div style={{ marginBottom: '8px' }}>
    <strong style={{ color: '#374151' }}>Property ID:</strong> #{property.property_id}
  </div>
  <div style={{ marginBottom: '8px' }}>
    <strong style={{ color: '#374151' }}>Coordinates:</strong> {property.latitude}, {property.longitude}
  </div>
  <div style={{ marginBottom: '8px' }}>
    <strong style={{ color: '#374151' }}>Type:</strong> {property.bedrooms === 0 ? 'Land' : 'Residential'}
  </div>

  {/* Ownership Status */}
  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
    <strong style={{ color: '#374151', display: 'block', marginBottom: '8px' }}>
      Ownership Status
    </strong>
   {(() => {
  const status = property.ownership_status ?? 'Pending'
  const configMap: Record<string, { color: string; bg: string; border: string; icon: string; msg: string }> = {
    'Verified': { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '', msg: 'Title deed verified. This property has confirmed ownership.' },
    'Disputed': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '', msg: 'Ownership dispute recorded. Proceed with caution.' },
    'Pending':  { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '', msg: 'Ownership verification is in progress.' }
  }
  const config = configMap[status] || { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '', msg: 'Ownership verification is in progress.' }

      return (
        <div style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>{config.icon}</span>
            <span style={{
              fontWeight: '700',
              color: config.color,
              fontSize: '13px'
            }}>
              {status || 'Pending'}
            </span>
          </div>
          <p style={{
            fontSize: '12px',
            color: config.color,
            lineHeight: '1.5',
            margin: 0
          }}>
            {config.msg}
          </p>
        </div>
      )
    })()}
  </div>
</div>
          </div>
        </div>
      </div>
  )
}