'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PropertyFormData {
  title: string
  location: string
  price: string
  bedrooms: string
  size: string
  latitude: string
  longitude: string
  description: string
}

const LOCATIONS = [
  'Karen', 'Westlands', 'Kilimani', 'Muthaiga', 'Kasarani',
  'Runda', 'Nairobi CBD', 'Thika Road', 'Lavington',
  'Kileleshwa', 'Parklands', 'Ruaka', 'Syokimau', 'Ngong Road'
]

export default function AddPropertyWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    size: '',
    latitude: '',
    longitude: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const createProperty = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate coordinates
      const lat = parseFloat(formData.latitude)
      const lng = parseFloat(formData.longitude)

      if (isNaN(lat) || isNaN(lng)) {
        setError('Latitude and longitude must be valid numbers')
        setLoading(false)
        return
      }

      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90')
        setLoading(false)
        return
      }

      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180')
        setLoading(false)
        return
      }

      // Get logged in user
const stored = localStorage.getItem('user')
const user   = stored ? JSON.parse(stored) : null

const res = await fetch('http://127.0.0.1:5000/api/properties', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title:            formData.title,
    location:         formData.location,
    price:            parseFloat(formData.price),
    bedrooms:         parseInt(formData.bedrooms) || 0,
    size:             parseFloat(formData.size),
    latitude:         parseFloat(formData.latitude),
    longitude:        parseFloat(formData.longitude),
    description:      formData.description,
    agent_id:         user?.user_id || null
  })
})

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create property')
        return
      }

      setSuccess('Property created successfully! Redirecting...')
      // Redirect to property details page where images can be uploaded
      setTimeout(() => {
        router.push(`/property/${data.property_id}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating property')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step < 3) {
      if (validateStep(step)) {
        setStep(step + 1)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError('Property title is required')
          return false
        }
        return true
      case 2:
        if (!formData.location || !formData.price || !formData.bedrooms || !formData.size) {
          setError('All fields are required')
          return false
        }
        return true
      case 3:
        if (!formData.latitude || !formData.longitude || !formData.description.trim()) {
          setError('All fields are required')
          return false
        }
        return true
      default:
        return true
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#052112', marginBottom: '8px' }}>
            Add New Property
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Step {step} of 3 — {['Property Details', 'Pricing & Features', 'Location & Description'][step - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#e5e7eb', height: '4px', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
          <div
            style={{
              background: '#052112',
              height: '100%',
              width: `${(step / 3) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
             {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            ✓ {success}
          </div>
        )}

        {/* Form Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* Step 1: Property Details */}
          {step === 1 && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                Property Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Modern 2-Bedroom Apartment"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Step 2: Pricing & Features */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                  Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a location</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 3200000"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                  Size (m²)
                </label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g., 85"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Location & Description */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                 Tip: For Nairobi, latitude is typically between -1.2 to -1.4, and longitude between 36.7 to 36.9
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                    Latitude (e.g., -1.2921)
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="-1.2921"
                    step="0.0001"
                    min="-90"
                    max="90"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                    Longitude (e.g., 36.7624)
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="36.7624"
                    step="0.0001"
                    min="-180"
                    max="180"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111827' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property features, amenities, etc."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              onClick={handleBack}
              disabled={step === 1}
              style={{
                padding: '11px 24px',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#374151',
                borderRadius: '8px',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                opacity: step === 1 ? 0.5 : 1,
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Back
            </button>
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  padding: '11px 24px',
                  background: '#052112',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={createProperty}
                disabled={loading}
                style={{
                  padding: '11px 24px',
                  background: '#052112',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}