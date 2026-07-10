import { useEffect, useState } from 'react'
import { embeddingsService, type EmbeddingDocument, type SearchResult } from './EmbeddingsService'

interface UseSemanticSearchOptions {
  autoInitialize?: boolean
  corpusSize?: 'small' | 'medium' | 'large'
}

interface UseSemanticSearchResult {
  initialized: boolean
  modelLoaded: boolean
  search: (query: string, topK?: number) => Promise<SearchResult[]>
  searchByType: (query: string, type: string, topK?: number) => Promise<SearchResult[]>
  addDocuments: (documents: EmbeddingDocument[]) => Promise<void>
  clearIndex: () => Promise<void>
  error: Error | null
}

export const useSemanticSearch = (
  options: UseSemanticSearchOptions = {}
): UseSemanticSearchResult => {
  const { autoInitialize = true } = options

  const [initialized, setInitialized] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!autoInitialize) return

    const init = async () => {
      try {
        await embeddingsService.initialize()
        setInitialized(true)
        // Load model on background (don't block initialization)
        embeddingsService.loadModel().then(() => setModelLoaded(true)).catch(e => setError(e))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize embeddings'))
      }
    }

    init()
  }, [autoInitialize])

  const search = async (query: string, topK = 5): Promise<SearchResult[]> => {
    try {
      if (!initialized) {
        await embeddingsService.initialize()
      }
      return await embeddingsService.search(query, topK)
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('Search failed')
      setError(newError)
      throw newError
    }
  }

  const searchByType = async (
    query: string,
    type: string,
    topK = 5
  ): Promise<SearchResult[]> => {
    try {
      if (!initialized) {
        await embeddingsService.initialize()
      }
      return await embeddingsService.searchByType(
        query,
        type as 'program' | 'course' | 'professor' | 'event' | 'opportunity',
        topK
      )
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('Search failed')
      setError(newError)
      throw newError
    }
  }

  const addDocuments = async (documents: EmbeddingDocument[]): Promise<void> => {
    try {
      if (!initialized) {
        await embeddingsService.initialize()
      }
      return await embeddingsService.addDocuments(documents)
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('Failed to add documents')
      setError(newError)
      throw newError
    }
  }

  const clearIndex = async (): Promise<void> => {
    try {
      if (!initialized) {
        await embeddingsService.initialize()
      }
      return await embeddingsService.clearDatabase()
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('Failed to clear index')
      setError(newError)
      throw newError
    }
  }

  return {
    initialized,
    modelLoaded,
    search,
    searchByType,
    addDocuments,
    clearIndex,
    error
  }
}
