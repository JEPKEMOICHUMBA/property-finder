'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [token])

  const handleReset = async () => {
    setError('')
    setSuccess('')

    if (!password || !confirm) {
      setError('Please fill in both fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('http://127.0.0.1:5000/api/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setSuccess(data.message)
        setTimeout(() => router.push('/signin'), 2500)
      }
    } catch {
      setError('Could not connect to server.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '11px 14px',
    border:       '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize:     '14px',
    outline:      'none',
    color:        '#111827',
    boxSizing:    'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔑</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#052112', marginBottom: '6px' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>
            ✅ {success} Redirecting to sign in...
          </div>
        )}

        {!success && token && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#052112'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#052112'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
              />
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              style={{ width: '100%', background: loading ? '#6b7280' : '#052112', color: '#ffffff', border: 'none', padding: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <span
            onClick={() => router.push('/forgot-password')}
            style={{ color: '#052112', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Request a new reset link
          </span>
        </p>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}