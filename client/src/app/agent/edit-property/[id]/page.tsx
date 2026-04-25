'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface PropertyFormData {
  title: string
  location: string
  price: string
  bedrooms: string
  size: string
  latitude: string
  longitude: string
  description: string
  ownership_status: string
}

const LOCATIONS = [
  'Karen', 'Westlands', 'Kilimani', 'Muthaiga', 'Kasarani',
  'Runda', 'Nairobi CBD', 'Thika Road', 'Lavington',
  'Kileleshwa', 'Parklands', 'Ruaka', 'Syokimau', 'Ngong Road'
]

export default function EditPropertyWizard() {
  const { id }  = useParams()
  const router  = useRouter()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<PropertyFormData>({
    title:            '',
    location:         '',
    price:            '',
    bedrooms:         '',
    size:             '',
    latitude:         '',
    longitude:        '',
    description:      '',
    ownership_status: 'Pending'
  })

  // Load existing property data
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { router.push('/signin'); return }
    const u = JSON.parse(stored)
    if (u.role === 'buyer') { router.push('/'); return }

    fetch(`http://127.0.0.1:5000/api/properties/${id}`)
      .then(r => r.json())
      .then(data => {
        setFormData({
          title:            data.title || '',
          location:         data.location?.split(',')[0].trim() || '',
          price:            data.price?.toString() || '',
          bedrooms:         data.bedrooms?.toString() || '',
          size:             data.size?.toString() || '',
          latitude:         data.latitude?.toString() || '',
          longitude:        data.longitude?.toString() || '',
          description:      data.description || '',
          ownership_status: data.ownership_status || 'Pending'
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load property data.')
        setLoading(false)
      })
  }, [id, router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateStep = (currentStep: number): boolean => {
    setError('')
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError('Property title is required')
          return false
        }
        return true
      case 2:
        if (!formData.location || !formData.price || !formData.size) {
          setError('Location, price and size are required')
          return false
        }
        return true
      case 3:
        if (!formData.latitude || !formData.longitude || !formData.description.trim()) {
          setError('Coordinates and description are required')
          return false
        }
        const lat = parseFloat(formData.latitude)
        const lng = parseFloat(formData.longitude)
        if (isNaN(lat) || lat < -90 || lat > 90) {
          setError('Latitude must be between -90 and 90')
          return false
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          setError('Longitude must be between -180 and 180')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(s => s - 1)
  }

  const handleSave = async () => {
    if (!validateStep(3)) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:            formData.title,
          price:            parseFloat(formData.price),
          location:         formData.location,
          bedrooms:         parseInt(formData.bedrooms) || 0,
          size:             parseFloat(formData.size),
          latitude:         parseFloat(formData.latitude),
          longitude:        parseFloat(formData.longitude),
          description:      formData.description,
          ownership_status: formData.ownership_status
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update property')
      } else {
        setSuccess('Property updated successfully! Redirecting...')
        setTimeout(() => router.push(`/property/${id}`), 1500)
      }
    } catch {
      setError('Could not connect to server. Is Flask running?')
    }

    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width:         '100%',
    padding:       '10px',
    border:        '1px solid #d1d5db',
    borderRadius:  '8px',
    fontSize:      '14px',
    boxSizing:     'border-box',
    outline:       'none',
    color:         '#111827'
  }

  const labelStyle: React.CSSProperties = {
    display:      'block',
    marginBottom: '8px',
    fontWeight:   '600',
    color:        '#111827',
    fontSize:     '14px'
  }

  const stepTitles = [
    'Property Title',
    'Pricing & Features',
    'Location & Description'
  ]

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
      Loading property details...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push(`/property/${id}`)}
            style={{ background: 'transparent', border: 'none', color: '#052112', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0, marginBottom: '12px' }}
          >
            ← Back to Property
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#052112', marginBottom: '4px' }}>
            Edit Property Listing
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Step {step} of 3 — {stepTitles[step - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#e5e7eb', height: '4px', borderRadius: '2px', marginBottom: '28px', overflow: 'hidden' }}>
          <div style={{
            background:  '#052112',
            height:      '100%',
            width:       `${(step / 3) * 100}%`,
            transition:  'width 0.3s ease'
          }} />
        </div>

        {/* Messages */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fecaca' }}>
             {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #bbf7d0' }}>
             {success}
          </div>
        )}

        {/* Form Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

          {/* Step 1 — Title */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. 3 Bedroom House - Karen"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#052112'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Ownership Status</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'Verified', label: ' Verified',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    { value: 'Pending',  label: ' Pending',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                    { value: 'Disputed', label: ' Disputed',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                  ].map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFormData(prev => ({ ...prev, ownership_status: s.value }))}
                      style={{
                        flex:       1,
                        padding:    '9px',
                        border:     `2px solid ${formData.ownership_status === s.value ? s.border : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: formData.ownership_status === s.value ? s.bg : '#ffffff',
                        color:      formData.ownership_status === s.value ? s.color : '#6b7280',
                        cursor:     'pointer',
                        fontSize:   '12px',
                        fontWeight: formData.ownership_status === s.value ? '700' : '400'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Pricing & Features */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Location *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#052112'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Select a location</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Price (KES) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 4500000"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#052112'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                  {formData.price && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(Number(formData.price))}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#052112'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="0">Land (0)</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5 Bedrooms</option>
                    <option value="6">6+ Bedrooms</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Size (m²) *</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g. 120"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#052112'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Location & Description */}
          {step === 3 && (
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#166534' }}>
                For Nairobi: Latitude is between -1.2 to -1.4 · Longitude is between 36.7 to 36.9
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Latitude *</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="-1.2921"
                    step="0.0001"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#052112'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Longitude *</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="36.7624"
                    step="0.0001"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#052112'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                
                 <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', marginBottom: '16px', fontSize: '12px', color: '#052112', textDecoration: 'underline' }}
              >
                ↗ Verify on Google Maps
              </a>
              )}

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property — features, condition, nearby amenities..."
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#052112'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {formData.description.length} characters
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              onClick={handleBack}
              disabled={step === 1}
              style={{
                padding:      '11px 24px',
                border:       '1.5px solid #d1d5db',
                background:   '#ffffff',
                color:        '#374151',
                borderRadius: '8px',
                cursor:       step === 1 ? 'not-allowed' : 'pointer',
                opacity:      step === 1 ? 0.5 : 1,
                fontWeight:   '600',
                fontSize:     '14px'
              }}
            >
              ← Back
            </button>

            <div style={{ flex: 1 }} />

            {step < 3 ? (
              <button
                onClick={handleNext}
                style={{
                  padding:      '11px 28px',
                  background:   '#052112',
                  color:        '#ffffff',
                  border:       'none',
                  borderRadius: '8px',
                  cursor:       'pointer',
                  fontWeight:   '600',
                  fontSize:     '14px'
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding:      '11px 28px',
                  background:   saving ? '#6b7280' : '#052112',
                  color:        '#ffffff',
                  border:       'none',
                  borderRadius: '8px',
                  cursor:       saving ? 'not-allowed' : 'pointer',
                  fontWeight:   '600',
                  fontSize:     '14px'
                }}
              >
                {saving ? 'Saving...' : ' Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}