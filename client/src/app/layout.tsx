import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'YourCityHome',
  description: 'Find properties across Nairobi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <Header />

        <main style={{ minHeight: 'calc(100vh - 64px - 160px)' }}>
          {children}
        </main>

        <footer style={{
          backgroundColor: '#052112',
          color: '#ffffff',
          padding: '40px 24px 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto',
            paddingBottom: '32px',
            borderBottom: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}></span>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>YourCityHome</span>
              </div>
              <p style={{ fontSize: '13px', opacity: 0.7, lineHeight: '1.6' }}>
                Nairobi intelligent property search platform powered by AI and GIS.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>About</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {['About Us', 'Market Trends'].map(item => (
  <li key={item}>
    <a href={item === 'Market Trends' ? '/market-trends' : '#'} style={{ color: 'rgba(255,255,255,0.7)', 
      textDecoration: 'none', fontSize: '13px' }}>
      {item}
    </a>
  </li>
))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>Contact</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {['Contact Us', 'FAQs', 'Support', 'List Property'].map(item => (
  <li key={item}>
    <a href={item === 'FAQs' || item === 'Support' ? '/help' : '#'} style={{ color: 'rgba(255,255,255,0.7)', 
      textDecoration: 'none', fontSize: '13px' }}>
      {item}
    </a>
  </li>
))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>Address</h4>
              <p style={{ fontSize: '13px', opacity: 0.7, lineHeight: '1.7' }}>
                Karen<br />
                Nairobi, Kenya<br />
                 +254 710 000 001<br />
                 info@yourcityhome.co.ke
              </p>
            </div>
          </div>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>© 2026 Property Finder. All rights reserved.</p>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>Built with AI-powered predictions and GIS mapping</p>
          </div>
        </footer>

      </body>
    </html>
  )
}