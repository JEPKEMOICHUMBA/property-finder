'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

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

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const nairobiCenter: [number, number] = [-1.2864, 36.8172]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <MapContainer
      center={nairobiCenter}
      zoom={12}
      style={{ height: '600px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <Marker
          key={property.property_id}
          position={[property.latitude, property.longitude]}
          icon={icon}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                {property.title}
              </h3>
              <p style={{ color: '#16a34a', fontWeight: 'bold', marginBottom: '4px' }}>
                {formatPrice(property.price)}
              </p>
              <p style={{ marginBottom: '4px' }}>📍 {property.location}</p>
              {property.bedrooms > 0 && (
                <p style={{ marginBottom: '4px' }}>🛏 {property.bedrooms} Bedrooms</p>
              )}
              <p style={{ fontSize: '12px', color: '#666' }}>
                {property.description}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}