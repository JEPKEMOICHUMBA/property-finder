'use client'

import { useState } from 'react'
interface FaqCategory {
  category: string
  icon: string
  questions: { q: string; a: string }[]
}

const faqs: FaqCategory[] = [
  {
    category: 'Search & Listings',
    icon: '',
    questions: [
      {
        q: 'How do I search for a property?',
        a: 'Use the search bar on the home page. Type a location or property name, then use the dropdowns to filter by number of bedrooms and maximum price. Click the Search button or press Enter to see results. You can also use the advanced filters below the search bar to narrow by area, minimum price, and property type.'
      },
      {
        q: 'How do I filter properties by area?',
        a: 'Use the Area dropdown in the advanced filters section below the main search bar, or click any area name in the Browse by Area panel on the right sidebar. The listings will update instantly to show only properties in that area.'
      },
      {
        q: 'Can I search for land separately from houses?',
        a: 'Yes. Use the All Types dropdown in the advanced filters and select Land to show only land listings, or Houses to show only residential properties.'
      },
      {
        q: 'How do I sort property listings?',
        a: 'Use the Sort dropdown above the property grid. You can sort by default order, price low to high, price high to low, largest size first, or most bedrooms first.'
      },
      {
        q: 'How do I view a property on the map?',
        a: 'Click the Map button above the listings grid to switch to map view. All filtered properties will appear as pins on the Nairobi map. Click any pin to see a summary popup. You can also click View on Map on the property details page to see the exact location of a single property.'
      }
    ]
  },
  {
    category: 'AI Features',
    icon: '',
    questions: [
      {
        q: 'What is AI Price Prediction?',
        a: "The AI Price Prediction feature uses a Linear Regression machine learning model trained on Nairobi property data to estimate a fair market price for any property. It analyses the property's number of bedrooms, size in square metres, and location to generate a prediction. It also shows you how the predicted price compares to the average price for properties in the same area."
      },
      {
        q: 'How do I use AI Price Prediction?',
        a: 'Open any property detail page and scroll to the AI Price Analysis panel on the right side. Click the Predict Price button. The system will return a predicted fair value and tell you whether the listed price is above, below, or in line with the market average for that area.'
      },
      {
        q: 'What are AI Recommendations?',
        a: 'AI Recommendations suggest properties that match your preferences. Click Get AI Recommendations on the home page, set your budget, number of bedrooms, and preferred area, then click Find Matches. If you are signed in, the system also uses your property viewing history to personalise results — properties marked with a For You badge are tailored specifically to your browsing behaviour.'
      },
      {
        q: 'How does the system personalise recommendations for me?',
        a: 'When you are signed in and view a property, the system records that interaction. Over time it learns which areas and bedroom counts you prefer based on your viewing history. This data is combined with a cosine similarity algorithm that compares property features to find the best matches for your preferences.'
      },
      {
        q: 'What are Similar Properties?',
        a: "On each property detail page you will see a Similar Properties section. This uses cosine similarity — a machine learning technique — to compare the current property's features (price, size, bedrooms, location) against all other listings and return the closest matches with a percentage similarity score."
      },
      {
        q: 'What is the Market Trends dashboard?',
        a: 'The Market Trends dashboard on the home page shows live statistics computed from all property listings. It includes average, median, minimum and maximum prices overall, average prices by Nairobi area shown as bar charts, price band distribution showing how many listings fall in each price range, and a breakdown of residential properties versus land listings.'
      }
    ]
  },
  {
    category: 'Account & Security',
    icon: '',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click Sign Up in the top right corner of any page. Fill in your full name, email address, select your role (Property Buyer or Property Agent), and enter a password of at least 6 characters. Click Create Account and you will be redirected to the sign in page.'
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'On the Sign In page, click the Forgot Password link below the password field. Enter your registered email address and follow the instructions sent to your inbox to reset your password.'
      },
      {
        q: 'How do I update my profile?',
        a: 'Click Account in the top right corner. On the account page, select the Profile Info tab to edit your name, phone number, email, and bio. Click Save Changes when done. To change your password, select the Security tab.'
      },
      {
        q: 'How do I upload a profile photo?',
        a: 'Go to your Account page. Click the camera icon on your profile photo at the top of the sidebar. Select an image file from your device (under 2MB). The photo will update immediately.'
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. Your password is never stored in plain text — it is hashed using a one-way encryption algorithm before being saved to the database. Your personal information is only accessible to you when signed in and is never shared with other users.'
      },
      {
        q: 'What do the different roles mean?',
        a: 'Property Buyer accounts can search, view, and receive recommendations for properties. Property Agent accounts have the additional ability to add, edit, and manage property listings including uploading images. Administrator accounts have full system access.'
      }
    ]
  },
  {
    category: 'Property Listings',
    icon: '',
    questions: [
      {
        q: 'How do I view full property details?',
        a: 'Click the View Details button on any property card. The property detail page shows the full image gallery, price, number of bedrooms, size, location, description, an interactive map, and contact details for the agent.'
      },
      {
        q: 'How do I contact the agent for a property?',
        a: 'On the property detail page, scroll to the Contact Agent panel on the right side. Click Call Agent to initiate a phone call or Send Message to send a direct enquiry to the listing agent.'
      },
      {
        q: 'How do I add a property listing?',
        a: 'You must be signed in as a Property Agent. Use the List Property button in the top header to access the property submission form. Fill in the title, price, location, number of bedrooms, size, GPS coordinates, and description, then click Submit.'
      },
      {
        q: 'How do I add photos to a property?',
        a: 'On the property detail page, click the Add Photos button below the image gallery. Select one or more images from your device (each under 5MB). Preview them in the panel and click Upload to save them to the listing.'
      },
      {
        q: 'What does the ownership status badge mean?',
        a: 'Each property listing displays an ownership status badge: Verified means the property title deed has been confirmed, Pending means verification is in progress, and Disputed means there is a known ownership issue with the property. Always check this status before proceeding with any transaction.'
      }
    ]
  },
  {
    category: 'Maps & Location',
    icon: '',
    questions: [
      {
        q: 'How does the interactive map work?',
        a: 'The map is powered by Leaflet.js using OpenStreetMap tiles. It shows all properties matching your current search as blue pins. Use the scroll wheel or the + and - buttons to zoom. Click and drag to pan. Click any pin to see a summary of that property.'
      },
      {
        q: 'Why is a property not showing on the map?',
        a: 'A property only appears on the map if it has GPS coordinates (latitude and longitude) recorded in the system. If a listing is missing from the map, the agent may not have provided location coordinates when adding the listing.'
      },
      {
        q: 'Can I search for properties near a specific location?',
        a: 'Yes. Type the area name in the search bar or select it from the Browse by Area panel in the sidebar. The map and listings grid will update to show properties in and around that area.'
      }
    ]
  }
]

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const toggle = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q =>
        searchQuery === '' ||
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0)

  const totalResults = filteredFaqs.reduce((a, c) => a + c.questions.length, 0)

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #052112 0%, #0a4a26 60%, #1a6b3a 100%)',
        padding: '48px 24px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>❓</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Help Centre
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.85, marginBottom: '28px' }}>
          Find answers to common questions about Property Finder
        </p>

        {/* Search */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '6px 6px 6px 16px',
          display: 'flex',
          gap: '8px',
          maxWidth: '560px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#111827',
              background: 'transparent'
            }}
          />
          <button
            onClick={() => {}}
            style={{
              background: '#052112',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Search
          </button>
        </div>

        {searchQuery && (
          <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
            {totalResults} result{totalResults !== 1 ? 's' : ''} for {searchQuery}
          </p>
        )}
      </div>

      {/* Quick links */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 20px 0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {faqs.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                const el = document.getElementById(`cat-${i}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#052112'
                ;(e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'
                ;(e.currentTarget as HTMLButtonElement).style.background = '#ffffff'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{cat.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                {cat.category}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                {cat.questions.length} articles
              </div>
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        {filteredFaqs.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              No results found
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Try different keywords or browse the categories above.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '16px',
                background: '#052112',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredFaqs.map((cat, ci) => (
            <div key={ci} id={`cat-${ci}`} style={{ marginBottom: '28px' }}>
              {/* Category header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  {cat.category}
                </h2>
                <span style={{
                  background: '#f0fdf4',
                  color: '#052112',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {cat.questions.length}
                </span>
              </div>

              {/* Questions */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {cat.questions.map((item, qi) => {
                  const key     = `${ci}-${qi}`
                  const isOpen  = openItems[key]
                  const isLast  = qi === cat.questions.length - 1

                  return (
                    <div
                      key={qi}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid #f3f4f6'
                      }}
                    >
                      {/* Question */}
                      <button
                        onClick={() => toggle(key)}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          background: isOpen ? '#f0fdf4' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isOpen ? '#052112' : '#111827',
                          flex: 1
                        }}>
                          {item.q}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          color: '#052112',
                          flexShrink: 0,
                          transform: isOpen ? 'rotate(45deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}>
                          +
                        </span>
                      </button>

                      {/* Answer */}
                      {isOpen && (
                        <div style={{
                          padding: '0 20px 16px',
                          background: '#f0fdf4'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.7'
                          }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Contact support */}
        <div style={{
          background: 'linear-gradient(135deg, #052112, #0a4a26)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          color: '#ffffff',
          marginBottom: '40px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}></div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Still need help?
          </h3>
          <p style={{
            fontSize: '14px',
            opacity: 0.85,
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            Our support team is available Monday to Friday, 8am to 6pm EAT.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              background: '#ffffff',
              color: '#052112',
              border: 'none',
              padding: '11px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Email Support
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1.5px solid rgba(255,255,255,0.4)',
              padding: '11px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              +254 700 000 000
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}