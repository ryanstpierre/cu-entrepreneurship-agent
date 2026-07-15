import React, { useState } from 'react'
import { useWebLLM } from './useWebLLM'

interface ExplanationResult {
  program: string
  explanation: string
  timestamp: number
}

export const RelevanceExplainer: React.FC = () => {
  const { isLoading, isModelReady, error, progress, generate } = useWebLLM()
  const [programName, setProgramName] = useState('')
  const [userGoal, setUserGoal] = useState('')
  const [explanations, setExplanations] = useState<ExplanationResult[]>([])
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const handleExplain = async () => {
    if (!programName.trim() || !userGoal.trim()) {
      setGenerationError('Please enter both a program name and your goal')
      return
    }

    setGenerating(true)
    setGenerationError(null)

    try {
      const prompt = `Explain briefly (2-3 sentences) why the "${programName}" program would be relevant for someone who wants to: ${userGoal}`

      const systemContext =
        'You are a helpful advisor for CU Boulder entrepreneurship students. Explain program relevance clearly and concisely.'

      const explanation = await generate(prompt, systemContext)

      const result: ExplanationResult = {
        program: programName,
        explanation: explanation.trim(),
        timestamp: Date.now()
      }

      setExplanations(prev => [result, ...prev])
      setProgramName('')
      setUserGoal('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      // Check if it's a model loading error and provide helpful message
      if (errorMessage.includes('Model not loaded') || errorMessage.includes('not found')) {
        setGenerationError('Model is downloading for the first time. This may take 1-2 minutes. Please try again.')
      } else {
        setGenerationError(errorMessage)
      }
      console.error('Generation failed:', errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Program Relevance Explainer</h2>
        <p style={styles.subtitle}>
          Test WebLLM in-browser LLM inference to explain why programs match your goals
        </p>

        {/* Status Section */}
        <div style={styles.statusSection}>
          <h3 style={styles.statusTitle}>Engine Status</h3>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Model Loading:</span>
              {isLoading ? (
                <span style={styles.statusValue}>
                  Loading... {progress}%
                </span>
              ) : isModelReady ? (
                <span style={{ ...styles.statusValue, color: '#22c55e' }}>Ready</span>
              ) : (
                <span style={{ ...styles.statusValue, color: '#ef4444' }}>Failed</span>
              )}
            </div>
            {error && (
              <div style={styles.statusItem}>
                <span style={styles.errorText}>Error: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <h3 style={styles.inputTitle}>Generate Explanation</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Program Name</label>
            <input
              type="text"
              value={programName}
              onChange={e => setProgramName(e.target.value)}
              placeholder="e.g., New Venture Challenge, Catalyze CU, Deming Center"
              disabled={isLoading || generating}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Entrepreneurial Goal</label>
            <textarea
              value={userGoal}
              onChange={e => setUserGoal(e.target.value)}
              placeholder="e.g., Build an AI startup, Get funding for my biotech idea, Find hardware mentorship"
              disabled={isLoading || generating}
              style={{ ...styles.input, minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <button
            onClick={handleExplain}
            disabled={isLoading || !isModelReady || generating}
            style={{
              ...styles.button,
              opacity: isLoading || !isModelReady || generating ? 0.5 : 1,
              cursor: isLoading || !isModelReady || generating ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? 'Generating...' : 'Generate Explanation'}
          </button>

          {generationError && (
            <div style={styles.errorMessage}>
              Error: {generationError}
            </div>
          )}
        </div>

        {/* Results Section */}
        {explanations.length > 0 && (
          <div style={styles.resultsSection}>
            <h3 style={styles.resultsTitle}>Generated Explanations</h3>
            <div style={styles.explanationsList}>
              {explanations.map((result, idx) => (
                <div key={result.timestamp} style={styles.explanationCard}>
                  <div style={styles.explanationHeader}>
                    <h4 style={styles.explanationProgram}>{result.program}</h4>
                    <span style={styles.explanationTime}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={styles.explanationText}>{result.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={styles.infoSection}>
          <h3 style={styles.infoTitle}>How This Works</h3>
          <ul style={styles.infoList}>
            <li>
              The Phi-2 model ({progress}% loaded) runs entirely in your browser
            </li>
            <li>
              No data is sent to external servers - inference happens locally
            </li>
            <li>
              First load will cache the model (50-100MB depending on your device)
            </li>
            <li>
              Subsequent generations are fast and private
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 24px 0'
  },
  statusSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  statusTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#374151'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px'
  },
  statusLabel: {
    fontWeight: '500',
    color: '#4b5563'
  },
  statusValue: {
    fontWeight: '600',
    color: '#1f2937'
  },
  errorText: {
    color: '#dc2626',
    fontSize: '13px'
  },
  inputSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  inputTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#374151'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  } as React.CSSProperties,
  errorMessage: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '13px'
  },
  resultsSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  resultsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#374151'
  },
  explanationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  explanationCard: {
    padding: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #dcfce7',
    borderRadius: '6px'
  },
  explanationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  explanationProgram: {
    fontSize: '13px',
    fontWeight: '600',
    margin: 0,
    color: '#166534'
  },
  explanationTime: {
    fontSize: '12px',
    color: '#4b7c0f'
  },
  explanationText: {
    fontSize: '13px',
    margin: 0,
    color: '#15803d',
    lineHeight: '1.5'
  },
  infoSection: {
    padding: '16px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px'
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#1e40af'
  },
  infoList: {
    fontSize: '13px',
    margin: 0,
    paddingLeft: '20px',
    color: '#1e40af'
  }
} as const
