import React, { useState, useEffect } from 'react'
import './CUEntrepreneurshipAgent.css'
import InteractiveJourney from './InteractiveJourney'
import InteractiveGraph from './InteractiveGraph'
import Onboarding from './Onboarding'
import { useSemanticSearch } from './useSemanticSearch'
import { CorpusLoader } from './CorpusLoader'

interface UserProfile {
  stage?: 'idea' | 'validation' | 'prototype' | 'launching' | 'scaling'
  sectors?: string[]
  constraints?: string[]
  role?: 'student' | 'faculty' | 'community' | 'alum'
  name?: string
}

const CUEntrepreneurshipAgent = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Welcome to the CU Boulder Entrepreneurship Navigator! I can help you find programs, funding, mentorship, and resources to bring your startup idea to life. What would you like to explore?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'chat' | 'browse' | 'staff' | 'journey' | 'explore'>('explore')
  const { search, addDocuments, initialized } = useSemanticSearch()

  // Initialize embeddings with default corpus
  useEffect(() => {
    if (initialized) {
      addDocuments(CorpusLoader.getDefaultDocuments()).catch(err => {
        console.error('Failed to load corpus:', err)
      })
    }
  }, [initialized, addDocuments])

  const handleSend = async () => {
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setLoading(true)
    setInput('')

    try {
      // Perform semantic search for relevant programs
      let searchContext = ''
      try {
        const searchResults = await search(input, 5)
        if (searchResults.length > 0) {
          const programs = searchResults.map(result => result.document.metadata.name).join(', ')
          searchContext = `Relevant programs: ${programs}. `
        }
      } catch (searchErr) {
        console.warn('Semantic search failed, continuing without context:', searchErr)
      }

      // Determine API endpoint based on environment
      let API_URL: string
      if (window.location.hostname === 'localhost') {
        // Local dev: use wrangler dev server
        API_URL = 'http://localhost:8787'
      } else if (window.location.hostname.includes('pages.dev')) {
        // Deployed on Cloudflare Pages: use the production Worker
        API_URL = 'https://cu-entrepreneurship-agent-production.ryan-c9e.workers.dev'
      } else {
        // Fallback
        API_URL = 'https://cu-entrepreneurship-agent-production.ryan-c9e.workers.dev'
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          context: searchContext,
          userProfile: userProfile
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to agent. Make sure the worker is running.' }])
    }
    setLoading(false)
  }

  if (!userProfile) {
    return <Onboarding onComplete={setUserProfile} />
  }

  return (
    <div className="cu-agent-container">
      {/* Header */}
      <header className="cu-header">
        <div className="cu-header-content">
          <div className="cu-logo">
            <h1>🏔️ CU Boulder</h1>
            <p>Entrepreneurship Navigator</p>
            {userProfile.name && <p className="greeting">Welcome, {userProfile.name}!</p>}
          </div>
          <nav className="cu-nav">
            <button
              className={`nav-btn ${view === 'explore' ? 'active' : ''}`}
              onClick={() => setView('explore')}
            >
              🌐 Explore
            </button>
            <button
              className={`nav-btn ${view === 'chat' ? 'active' : ''}`}
              onClick={() => setView('chat')}
            >
              💬 Ask
            </button>
            <button
              className={`nav-btn ${view === 'browse' ? 'active' : ''}`}
              onClick={() => setView('browse')}
            >
              📚 Browse
            </button>
            <button
              className={`nav-btn ${view === 'staff' ? 'active' : ''}`}
              onClick={() => setView('staff')}
            >
              📊 Staff
            </button>
            <button
              className={`nav-btn ${view === 'journey' ? 'active' : ''}`}
              onClick={() => setView('journey')}
            >
              🏔️ Journey
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="cu-main">
        {view === 'chat' && (
          <div className="chat-view">
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {loading && <div className="message assistant"><div className="message-content">Thinking...</div></div>}
            </div>

            <div className="input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about CU startup resources..."
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading}>
                Send
              </button>
            </div>

            <div className="example-prompts">
              <p>Try asking:</p>
              <button onClick={() => { setInput('I want to build an AI startup. What programs can help?'); }}>
                AI Startup Help
              </button>
              <button onClick={() => { setInput('I need funding for my biotech idea'); }}>
                Biotech Funding
              </button>
              <button onClick={() => { setInput('What mentors are available in hardware?'); }}>
                Hardware Mentorship
              </button>
              <button onClick={() => { setInput('Where can I prototype my idea?'); }}>
                Prototyping Spaces
              </button>
            </div>
          </div>
        )}

        {view === 'browse' && (
          <div className="browse-view">
            <h2>Browse All Programs</h2>
            <div className="filters">
              <div className="filter-group">
                <label>Opportunity Type</label>
                <select>
                  <option>All</option>
                  <option>Funding & Financing</option>
                  <option>Mentorship & Advising</option>
                  <option>Entrepreneurial Training</option>
                  <option>IP Support</option>
                  <option>Prototyping</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sector</label>
                <select>
                  <option>All</option>
                  <option>AI & Machine Learning</option>
                  <option>Biotech</option>
                  <option>Hardware</option>
                  <option>Aerospace</option>
                  <option>Fintech</option>
                  <option>EdTech</option>
                </select>
              </div>
            </div>

            <div className="programs-grid">
              {[
                { name: 'New Venture Challenge', desc: '$325K+ in prizes', icon: '🏆' },
                { name: 'Deming Center', desc: 'One-stop entrepreneurship hub', icon: '🎯' },
                { name: 'Catalyze CU', desc: 'Summer accelerator', icon: '🚀' },
                { name: 'Venture Partners', desc: 'University startups support', icon: '🤝' },
                { name: 'ATLAS Institute', desc: 'Design & tech programs', icon: '🛠️' },
                { name: 'Idea Forge', desc: 'Prototyping space', icon: '⚙️' }
              ].map(prog => (
                <div key={prog.name} className="program-card">
                  <div className="card-icon">{prog.icon}</div>
                  <h3>{prog.name}</h3>
                  <p>{prog.desc}</p>
                  <a href="#">Learn more →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'staff' && (
          <div className="staff-view">
            <h2>Coordinator Dashboard</h2>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-number">80+</div>
                <div className="stat-label">Programs & Resources</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">$325K+</div>
                <div className="stat-label">Annual Prize Money</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">20+</div>
                <div className="stat-label">Sectors Covered</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5 Colleges</div>
                <div className="stat-label">Engaged</div>
              </div>
            </div>

            <div className="coverage-section">
              <h3>Coverage by College</h3>
              <div className="college-coverage">
                <div className="coverage-bar">
                  <div className="bar-fill" style={{ width: '95%' }}></div>
                  <span>Leeds School of Business</span>
                </div>
                <div className="coverage-bar">
                  <div className="bar-fill" style={{ width: '85%' }}></div>
                  <span>College of Engineering</span>
                </div>
                <div className="coverage-bar">
                  <div className="bar-fill" style={{ width: '60%' }}></div>
                  <span>College of Music</span>
                </div>
                <div className="coverage-bar">
                  <div className="bar-fill" style={{ width: '55%' }}></div>
                  <span>College of Arts & Sciences</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'journey' && (
          <InteractiveJourney />
        )}

        {view === 'explore' && (
          <InteractiveGraph userProfile={userProfile} />
        )}
      </main>
    </div>
  )
}

export default CUEntrepreneurshipAgent
