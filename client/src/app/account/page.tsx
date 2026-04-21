'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  user_id: number
  username: string
  email: string
  role: string
  phone: string
  bio: string
  avatar: string
  created_at: string
}

export default function Account() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser]               = useState<User | null>(null)
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [bio, setBio]                 = useState('')
  const [avatar, setAvatar]           = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [activeTab, setActiveTab]     = useState('profile')

  useEffect(() => {
  const stored = localStorage.getItem('user')
  if (!stored) {
    router.push('/signin')
    return
  }
  const u = JSON.parse(stored)
  setTimeout(() => {
    setUser(u)
    setUsername(u.username || '')
    setEmail(u.email || '')
    setPhone(u.phone || '')
    setBio(u.bio || '')
    setAvatar(u.avatar || '')
  }, 0)
}, [router])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (password && password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${user?.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, bio, avatar, ...(password ? { password } : {}) })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setPassword('')
        setConfirmPassword('')
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Could not connect to server')
    }
    setLoading(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#111827',
    boxSizing: 'border-box',
    background: '#ffffff'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  if (!user) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Redirecting...</div>
  )

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>My Account</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage your profile and account settings</p>
        </div>

        <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>

          {/* Sidebar */}
          <div>
            {/* Avatar card */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: avatar ? 'transparent' : '#052112', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', overflow: 'hidden', border: '3px solid #052112', margin: '0 auto' }}>
                  {avatar
                    //? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    //: ''
                  }
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, background: '#052112', border: '2px solid #ffffff', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: '#111827' }}>{user.username}</div>
              <div style={{ display: 'inline-block', background: '#052112', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', marginTop: '6px', textTransform: 'capitalize' }}>{user.role}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>Member since {new Date(user.created_at).getFullYear()}</div>
            </div>

            {/* Tabs */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
              {[
                { id: 'profile',  label: ' Profile Info' },
                { id: 'security', label: ' Security' },
                { id: 'activity', label: ' Activity' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: '100%', padding: '12px 16px', border: 'none', borderBottom: '1px solid #f3f4f6', background: activeTab === tab.id ? '#f0fdf4' : '#ffffff', color: activeTab === tab.id ? '#052112' : '#374151', fontWeight: activeTab === tab.id ? '600' : '400', cursor: 'pointer', textAlign: 'left', fontSize: '14px', borderLeft: activeTab === tab.id ? '3px solid #052112' : '3px solid transparent' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <button onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              Sign Out
            </button>
          </div>

          {/* Content */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' }}>

            {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>✅ {success}</div>}
            {error   && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca' }}>⚠️ {error}</div>}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Profile Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" style={inputStyle} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Role</label>
                  <input type="text" value={user.role} disabled style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af' }} />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <button onClick={handleSave} disabled={loading} style={{ background: loading ? '#6b7280' : '#052112', color: '#ffffff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Security Settings</h2>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#6b7280' }}>
                   Leave password fields empty if you do not want to change your password.
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" style={inputStyle} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" style={inputStyle} onFocus={e => e.target.style.borderColor = '#052112'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <button onClick={handleSave} disabled={loading} style={{ background: loading ? '#6b7280' : '#052112', color: '#ffffff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Recent Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { icon: '', action: 'Searched for properties in Karen', time: '2 hours ago' },
                    { icon: '', action: 'Viewed 3 Bedroom House - Nairobi', time: '3 hours ago' },
                    { icon: '', action: 'Used AI Price Prediction', time: '1 day ago' },
                    { icon: '', action: 'Explored properties on map', time: '2 days ago' },
                    { icon: '', action: 'Searched for land in Thika Road', time: '3 days ago' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item.action}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}