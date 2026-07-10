import React, { useState } from 'react'
import './Onboarding.css'

interface UserProfile {
  stage?: 'idea' | 'validation' | 'prototype' | 'launching' | 'scaling'
  sectors?: string[]
  constraints?: string[]
  role?: 'student' | 'faculty' | 'community' | 'alum'
  name?: string
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({})

  const steps = [
    {
      title: "Let's find your path",
      subtitle: "Understanding your entrepreneurial journey",
      content: (
        <div className="onboard-content welcome">
          <div className="welcome-message">
            <h2>Welcome to CU's Entrepreneurship Ecosystem</h2>
            <p>
              Whether you're sketching ideas on a napkin or scaling to market,
              we'll connect you with the right resources, people, and opportunities.
            </p>
            <div className="welcome-visual">
              <div className="journey-path">
                <div className="point">💡</div>
                <div className="connector"></div>
                <div className="point">🧪</div>
                <div className="connector"></div>
                <div className="point">🚀</div>
                <div className="connector"></div>
                <div className="point">📈</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Where are you in your journey?",
      subtitle: "Help us understand your startup stage",
      content: (
        <div className="onboard-content stages">
          {[
            { id: 'idea', emoji: '💡', label: 'Have an Idea', desc: 'Just the spark' },
            { id: 'validation', emoji: '🧪', label: 'Validating', desc: 'Testing the market' },
            { id: 'prototype', emoji: '⚙️', label: 'Building MVP', desc: 'Making it real' },
            { id: 'launching', emoji: '🚀', label: 'Launching', desc: 'Going to market' },
            { id: 'scaling', emoji: '📈', label: 'Scaling', desc: 'Growing fast' }
          ].map(s => (
            <button
              key={s.id}
              className={`stage-card ${profile.stage === s.id ? 'selected' : ''}`}
              onClick={() => setProfile({ ...profile, stage: s.id as any })}
            >
              <div className="stage-emoji">{s.emoji}</div>
              <div className="stage-label">{s.label}</div>
              <div className="stage-desc">{s.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What excites you?",
      subtitle: "Select all that apply",
      content: (
        <div className="onboard-content sectors">
          {[
            'AI & Machine Learning',
            'Biotech & Life Sciences',
            'Hardware & Robotics',
            'Climate & Sustainability',
            'FinTech',
            'EdTech',
            'Aerospace',
            'Social Enterprise',
            'Not sure yet'
          ].map(sector => (
            <button
              key={sector}
              className={`sector-tag ${profile.sectors?.includes(sector) ? 'selected' : ''}`}
              onClick={() => {
                const sectors = profile.sectors || []
                if (sectors.includes(sector)) {
                  setProfile({ ...profile, sectors: sectors.filter(s => s !== sector) })
                } else {
                  setProfile({ ...profile, sectors: [...sectors, sector] })
                }
              }}
            >
              {sector}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What matters most right now?",
      subtitle: "Help us prioritize what you need",
      content: (
        <div className="onboard-content needs">
          {[
            { id: 'funding', emoji: '💰', label: 'Funding', desc: 'Money to build' },
            { id: 'mentorship', emoji: '🤝', label: 'Mentorship', desc: 'Expert guidance' },
            { id: 'space', emoji: '🏢', label: 'Workspace', desc: 'Place to build' },
            { id: 'network', emoji: '👥', label: 'Network', desc: 'Right connections' },
            { id: 'legal', emoji: '⚖️', label: 'Legal Help', desc: 'Protect my IP' },
            { id: 'validation', emoji: '📊', label: 'Customer Validation', desc: 'Find market fit' }
          ].map(need => (
            <button
              key={need.id}
              className={`need-card ${profile.constraints?.includes(need.id) ? 'selected' : ''}`}
              onClick={() => {
                const constraints = profile.constraints || []
                if (constraints.includes(need.id)) {
                  setProfile({ ...profile, constraints: constraints.filter(c => c !== need.id) })
                } else {
                  setProfile({ ...profile, constraints: [...constraints, need.id] })
                }
              }}
            >
              <div className="need-emoji">{need.emoji}</div>
              <div className="need-label">{need.label}</div>
              <div className="need-desc">{need.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Who are you?",
      subtitle: "This helps us tailor recommendations",
      content: (
        <div className="onboard-content roles">
          {[
            { id: 'student', label: 'CU Student', desc: 'Undergrad or grad' },
            { id: 'faculty', label: 'Faculty', desc: 'Professor or researcher' },
            { id: 'alum', label: 'CU Alumni', desc: 'Grad with degree' },
            { id: 'community', label: 'Community', desc: 'Boulder resident/other' }
          ].map(role => (
            <button
              key={role.id}
              className={`role-card ${profile.role === role.id ? 'selected' : ''}`}
              onClick={() => setProfile({ ...profile, role: role.id as any })}
            >
              <div className="role-label">{role.label}</div>
              <div className="role-desc">{role.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What's your name?",
      subtitle: "Nice to meet you",
      content: (
        <div className="onboard-content name-input">
          <input
            type="text"
            placeholder="First name works great"
            value={profile.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
            autoFocus
            className="name-field"
          />
          <p className="hint">We'll use this to make things personal</p>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(profile)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const canProceed = () => {
    if (step === 0) return true
    if (step === 1) return !!profile.stage
    if (step === 2) return (profile.sectors?.length ?? 0) > 0
    if (step === 3) return (profile.constraints?.length ?? 0) > 0
    if (step === 4) return !!profile.role
    if (step === 5) return (profile.name?.trim().length ?? 0) > 0
    return false
  }

  const currentStep = steps[step]

  return (
    <div className="onboarding-container">
      <div className="onboarding-background"></div>

      <div className="onboarding-content">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
        </div>

        <div className="step-container">
          <div className="step-header">
            <h1>{currentStep.title}</h1>
            <p>{currentStep.subtitle}</p>
          </div>

          <div className="step-body">
            {currentStep.content}
          </div>

          <div className="step-footer">
            <button
              className="btn-secondary"
              onClick={handleBack}
              disabled={step === 0}
            >
              ← Back
            </button>

            <div className="step-indicator">
              {step + 1} of {steps.length}
            </div>

            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === steps.length - 1 ? 'Start Exploring →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
