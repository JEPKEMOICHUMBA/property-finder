'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      backgroundColor: '#052112',
      color: '#ffffff',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      {/* Logo */}
      <div
        onClick={() => window.location.href = '/'}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '26px' }}></span>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>YourCityHome</div>
          <div style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>
            Nairobi Smart Property Search
          </div>
        </div>
      </div>

      {/* Desktop nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
        className="desktop-nav"
      >
        <button style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            background: '#ef4444',
            borderRadius: '50%'
          }} />
        </button>

        <button
          onClick={() => window.location.href = '/signup'}
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          Sign Up
        </button>

        <button
          onClick={() => window.location.href = '/signin'}
          style={{
            background: '#ffffff',
            border: 'none',
            color: '#052112',
            padding: '7px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Log In
        </button>

        <button
          onClick={() => window.location.href = '/account'}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Account
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-menu-btn"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '4px',
          display: 'none'
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          background: '#052112',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 999,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
          className="mobile-menu"
        >
          
          <button
  onClick={() => window.location.href = '/help'}
  style={{
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 8px'
  }}
>
  Help
</button>

<button
  onClick={() => window.location.href = '/reports'}
  style={{
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 8px'
  }}
>
  Reports
</button>

<button
  onClick={() => window.location.href = '/market-trends'}
  style={{
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 8px'
  }}
>
  Market Trends
</button>
          <button
            onClick={() => { window.location.href = '/signup'; setMenuOpen(false) }}
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => { window.location.href = '/signin'; setMenuOpen(false) }}
            style={{
              background: '#ffffff',
              border: 'none',
              color: '#052112',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { window.location.href = '/account'; setMenuOpen(false) }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
             Account
          </button>
        </div>
      )}
    </header>
  )
}