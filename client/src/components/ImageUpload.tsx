'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  propertyId: number
  existingImages: string[]
  onUpdate: (images: string[]) => void
}

export default function ImageUpload({ propertyId, existingImages, onUpdate }: ImageUploadProps) {
  const fileRef              = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]    = useState('')
  const [success, setSuccess] = useState('')
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const oversized = files.filter(f => f.size > 5 * 1024 * 1024)
    if (oversized.length > 0) {
      setError('Each image must be under 5MB')
      return
    }

    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readers).then(results => {
      setPreviews(results)
    })
  }

  const handleUpload = async () => {
    if (previews.length === 0) {
      setError('Please select images first')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/properties/${propertyId}/images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: previews })
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setSuccess(`${previews.length} image(s) uploaded successfully!`)
        setPreviews([])
        onUpdate(data.images)
        if (fileRef.current) fileRef.current.value = ''
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Upload failed. Is Flask running?')
    }
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/properties/${propertyId}/images`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        }
      )
      const data = await res.json()
      if (res.ok) {
        onUpdate(data.images)
      }
    } catch {
      setError('Delete failed')
    }
  }

  return (
    <div>
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
            Current Images ({existingImages.length})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {existingImages.map((url, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <img
                  src={`http://127.0.0.1:5000${url}`}
                  alt={`Property ${i + 1}`}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  onClick={() => handleDelete(url)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(220,38,38,0.9)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
            Preview ({previews.length} selected)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #052112' }}>
                <img src={src} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f9fafb',
          transition: 'border-color 0.2s ease',
          marginBottom: '14px'
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#052112')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#d1d5db')}
      >
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
          Click to select images
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          JPG, PNG up to 5MB each — multiple files supported
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Messages */}
      {error   && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid #fecaca' }}>⚠️ {error}</div>}
      {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>✅ {success}</div>}

      {/* Upload button */}
      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              background: uploading ? '#6b7280' : '#052112',
              color: '#ffffff',
              border: 'none',
              padding: '11px 24px',
              borderRadius: '8px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Image(s)`}
          </button>
          <button
            onClick={() => { setPreviews([]); if (fileRef.current) fileRef.current.value = '' }}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1.5px solid #e5e7eb',
              padding: '11px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}