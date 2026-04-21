'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
interface Property {
  property_id: number
  title: string
  price: number
  location: string
  bedrooms: number
  size: number
  description: string
  latitude: number
  longitude: number
  images: string[]
}

export default function PropertyCard({ property }: { property: Property }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price)

    const router = useRouter()
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
     {/* Image */}
<div style={{
  height: '180px',
  background: 'linear-gradient(135deg, #052112 0%, #0a4a26 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px',
  position: 'relative',
  overflow: 'hidden'
}}>
  {property.images && property.images.length > 0 ? (
  <Image
    src={`http://127.0.0.1:5000${property.images[0]}`}
    alt={property.title}
    fill
    unoptimized
    style={{ objectFit: 'cover' }}
  />
) : (
  ''
)}
  <span style={{
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(255,255,255,0.95)',
    color: '#052112',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  }}>
    {property.bedrooms === 0 ? 'Land' : 'House'}
  </span>
  {property.images && property.images.length > 1 && (
    <span style={{
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.6)',
      color: '#ffffff',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px'
    }}>
       {property.images.length}
    </span>
  )}
</div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '6px',
          lineHeight: '1.4'
        }}>
          {property.title}
        </h3>

        {/* Price */}
        <p style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#052112',
          marginBottom: '10px'
        }}>
          {formatPrice(property.price)}
        </p>

        {/* Details row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '10px',
          fontSize: '13px',
          color: '#6b7280'
        }}>
          {property.bedrooms > 0 && (
            <span> {property.bedrooms} beds</span>
          )}
          {property.size && (
            <span> {property.size} m²</span>
          )}
        </div>

        {/* Location */}
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
           {property.location}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
         <button
  onClick={() => router.push(`/property/${property.property_id}`)}
  style={{
    flex: 1,
    background: '#052112',
    color: '#ffffff',
    border: 'none',
    padding: '9px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  }}
>
  View Details
</button>
          <button style={{
            padding: '9px 12px',
            background: 'transparent',
            border: '1.5px solid #052112',
            color: '#052112',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}>
             Map
          </button>
        </div>
      </div>
    </div>
  )
}