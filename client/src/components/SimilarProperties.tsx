'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Property {
  property_id: number
  title: string
  price: number
  location: string
  bedrooms: number
  size: number
  similarity_score: number
  images: string[]
}

export default function SimilarProperties({ propertyId }: { propertyId: number }) {
  const router = useRouter()
  const [similar, setSimilar]   = useState<Property[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/similar/${propertyId}`)
      .then(r => r.json())
      .then(d => { setSimilar(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [propertyId])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 0
    }).format(n)

  if (loading) return (
    <div style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>
      Finding similar properties...
    </div>
  )

  if (similar.length === 0) return null

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
           Similar Properties
        </h3>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          Matched using cosine similarity on price, size, bedrooms and location
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {similar.map((prop, i) => (
          <div
            key={prop.property_id}
            onClick={() => router.push(`/property/${prop.property_id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#052112'
              ;(e.currentTarget as HTMLDivElement).style.background = '#f0fdf4'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
              ;(e.currentTarget as HTMLDivElement).style.background = '#f9fafb'
            }}
          >
            {/* Thumbnail */}
            <div style={{
              width: '60px',
              height: '52px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #052112, #0a4a26)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {prop.images && prop.images.length > 0
                ? <img
                    src={`http://127.0.0.1:5000${prop.images[0]}`}
                    alt={prop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                : ''
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {prop.title}
              </p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#052112', marginBottom: '2px' }}>
                {fmt(prop.price)}
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>
                 {prop.location}
                {prop.bedrooms > 0 && ` · 🛏 ${prop.bedrooms} beds`}
              </p>
            </div>

            {/* Similarity score */}
            <div style={{
              textAlign: 'center',
              flexShrink: 0,
              background: '#052112',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px 10px',
              minWidth: '52px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>
                {prop.similarity_score}%
              </div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>match</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '11px',
        color: '#9ca3af',
        marginTop: '12px',
        textAlign: 'center'
      }}>
        Similarity calculated using cosine distance across price, size, bedrooms and location vectors
      </p>
    </div>
  )
}