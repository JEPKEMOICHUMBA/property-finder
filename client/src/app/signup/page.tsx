'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!username || !email || !password || !confirm) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setSuccess('Account created! Redirecting to sign in...')
        setTimeout(() => router.push('/signin'), 2000)
      }
    } catch {
      setError('Could not connect to server. Is Flask running?')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#111827',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s ease'
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '13px',
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: '6px'
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
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}> </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#052112',
            marginBottom: '4px'
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Join YourCityHome today
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
             {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            color: '#16a34a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
             {success}
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#052112'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@gmail.com"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#052112'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Role */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>I am a</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { value: 'buyer', label: ' Property Buyer' },
              { value: 'agent', label: ' Property Agent' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setRole(option.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `2px solid ${role === option.value ? '#052112' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: role === option.value ? '#052112' : '#ffffff',
                  color: role === option.value ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.15s ease'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#052112'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#052112'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
            marginBottom: '20px'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          Already have an account?{' '}
          <span
            onClick={() => router.push('/signin')}
            style={{
              color: '#052112',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}