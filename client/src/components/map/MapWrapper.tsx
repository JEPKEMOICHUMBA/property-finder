'use client'

import dynamic from 'next/dynamic'

interface Property {
  property_id: number
  title: string
  price: number
  location: string
  bedrooms: number
  latitude: number
  longitude: number
  description: string
}

const PropertyMap = dynamic(
  () => import('./PropertyMap'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: '600px',
        background: '#f3f4f6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '16px'
      }}>
        Loading map...
      </div>
    )
  }
)

export default function MapWrapper({ properties }: { properties: Property[] }) {
  return <PropertyMap properties={properties} />
}