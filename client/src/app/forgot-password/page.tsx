'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [tempPass, setTempPass] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    setTempPass('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const res  = await fetch('http://127.0.0.1:5000/api/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setMessage(data.message)
        setTempPass(data.reset_link || data.temp_password || '')
        setDone(true)
      }
    } catch {
      setError('Could not connect to server. Is Flask running?')
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}></div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#052112', marginBottom: '6px' }}>
            Forgot Password
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
            Enter your registered email and we will generate a temporary password for you.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success state */}
        {done ? (
  <div>
    <div style={{
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
      <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600', marginBottom: '6px' }}>
        {message}
      </p>

      {/* Show reset link when email is not configured */}
      {tempPass && (
        <div style={{ marginTop: '14px', textAlign: 'left' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Click the link below to reset your password:
          </p>
          <a
            href={tempPass}
            style={{
              display: 'block',
              background: '#052112',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
             Click Here to Reset Password
          </a>
          <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
            This link expires in 1 hour
          </p>
        </div>
      )}
    </div>

    <button
      onClick={() => router.push('/signin')}
      style={{
        width: '100%',
        background: '#052112',
        color: '#ffffff',
        border: 'none',
        padding: '13px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        marginBottom: '12px'
      }}
    >
      Go to Sign In →
    </button>
  </div>
) : (
          <div>
            {/* Email input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#052112'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6b7280' : '#052112',
                color: '#ffffff',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>
        )}

        {/* Back to sign in */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          Remember your password?{' '}
          <span
            onClick={() => router.push('/signin')}
            style={{ color: '#052112', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}