import { useEffect, useRef, useState } from 'react'
import { MLCEngine } from '@mlc-ai/web-llm'

interface UseWebLLMState {
  engine: MLCEngine | null
  isLoading: boolean
  error: string | null
  isModelReady: boolean
  progress: number
}

interface UseWebLLMResult extends UseWebLLMState {
  generate: (prompt: string, systemContext?: string) => Promise<string>
}

export function useWebLLM(): UseWebLLMResult {
  const engineRef = useRef<MLCEngine | null>(null)
  const [state, setState] = useState<UseWebLLMState>({
    engine: null,
    isLoading: true,
    error: null,
    isModelReady: false,
    progress: 0
  })

  useEffect(() => {
    let isMounted = true

    const initializeEngine = async () => {
      try {
        console.log('Initializing WebLLM engine...')

        if (isMounted) {
          setState(prev => ({
            ...prev,
            progress: 10
          }))
        }

        const engine = new MLCEngine({
          model: 'Phi-2-q4f32_1-MLC'
        })

        // Wait for engine to be ready
        if (isMounted) {
          setState(prev => ({
            ...prev,
            progress: 50
          }))
        }

        await engine.ready

        if (isMounted) {
          setState(prev => ({
            ...prev,
            progress: 75
          }))
        }

        // Mark as ready once engine is ready
        // The model will download lazily on first generation attempt
        if (isMounted) {
          setState(prev => ({
            ...prev,
            progress: 90
          }))
        }

        // Small delay to ensure engine is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500))

        if (isMounted) {
          console.log('WebLLM engine initialized and ready')
          engineRef.current = engine
          setState({
            engine,
            isLoading: false,
            error: null,
            isModelReady: true,
            progress: 100
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error('Failed to initialize WebLLM engine:', errorMessage)

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
            isModelReady: false
          }))
        }
      }
    }

    initializeEngine()

    return () => {
      isMounted = false
    }
  }, [])

  const generate = async (prompt: string, systemContext?: string): Promise<string> => {
    if (!engineRef.current) {
      throw new Error('WebLLM engine not initialized')
    }

    const messages = systemContext
      ? [
          { role: 'system' as const, content: systemContext },
          { role: 'user' as const, content: prompt }
        ]
      : [
          { role: 'user' as const, content: prompt }
        ]

    // Retry logic: model may not be fully loaded yet on first call
    // Web-llm downloads models lazily, which can take 30-60+ seconds
    let lastError: Error | null = null
    const maxAttempts = 5
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxAttempts}:`, prompt)

        const reply = await engineRef.current.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 256,
          top_p: 0.95
        })

        const content = reply.choices[0]?.message?.content
        if (!content) {
          throw new Error('No response generated')
        }

        console.log('Generation successful')
        return content
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const errorMsg = lastError.message

        // Check if it's a model loading error
        if (errorMsg.includes('Model not loaded') || errorMsg.includes('not found')) {
          if (attempt < maxAttempts) {
            // Exponential backoff: 5s, 10s, 20s, 30s, then give up
            const waitMs = Math.min(5000 * Math.pow(2, attempt - 1), 30000)
            console.warn(`Attempt ${attempt}/${maxAttempts} failed - model loading. Waiting ${waitMs}ms before retry...`, errorMsg)
            await new Promise(resolve => setTimeout(resolve, waitMs))
            continue
          }
        }

        // For other errors, fail immediately
        console.error('Generation error (non-retryable):', errorMsg)
        throw new Error(`Failed to generate response: ${errorMsg}`)
      }
    }

    // All retries exhausted
    throw new Error(`Failed to generate response after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`)
  }

  return {
    ...state,
    generate
  }
}
