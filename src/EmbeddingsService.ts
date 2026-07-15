// In-browser embeddings service using Transformers.js
// Generates semantic embeddings for all content and provides vector search

interface EmbeddingDocument {
  id: string
  text: string
  metadata: Record<string, any>
  embedding?: number[]
  type: 'program' | 'course' | 'professor' | 'event' | 'opportunity'
}

interface SearchResult {
  document: EmbeddingDocument
  similarity: number
}

class EmbeddingsService {
  private db: IDBDatabase | null = null
  private initialized = false
  private modelLoaded = false
  private model: any = null

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Open IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('cu-entrepreneurship', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        // Create object stores for documents and embeddings
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('metadata', 'metadata', { unique: false })
        }
      }
    })
  }

  async loadModel(): Promise<void> {
    if (this.modelLoaded) return

    try {
      // Dynamically import Transformers.js
      const { pipeline } = await import('@xenova/transformers')
      // Load the embeddings model
      this.model = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      )
      this.modelLoaded = true
    } catch (error) {
      // Silently fail - embeddings are optional, UI works without them
      console.warn('Embeddings model not available. Semantic search disabled.')
      return
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.modelLoaded) {
      await this.loadModel()
    }

    // If model failed to load, return empty embedding silently
    if (!this.model) {
      return []
    }

    try {
      const embeddings = await this.model(text, {
        pooling: 'mean',
        normalize: true
      })

      // Convert to array if needed
      return Array.from(embeddings.data)
    } catch (error) {
      // Silently fail - embeddings are optional
      return []
    }
  }

  async addDocument(document: EmbeddingDocument): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Generate embedding for the document (may return empty array if model unavailable)
    const embedding = await this.generateEmbedding(document.text)

    // Store in IndexedDB
    return new Promise((resolve, reject) => {
      if (!this.db) {
        // Database init failed - skip silently for embeddings
        resolve()
        return
      }

      const transaction = this.db.transaction(['documents'], 'readwrite')
      const store = transaction.objectStore('documents')

      const docWithEmbedding = {
        ...document,
        embedding,
        createdAt: Date.now()
      }

      const request = store.put(docWithEmbedding)

      request.onerror = () => {
        // Silently ignore indexeddb errors
        resolve()
      }
      request.onsuccess = () => resolve()
    })
  }

  async addDocuments(documents: EmbeddingDocument[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Batch process documents
    for (const doc of documents) {
      await this.addDocument(doc)
    }
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query)

    // Retrieve all documents
    const allDocuments = await this.getAllDocuments()

    // Calculate similarity scores
    const results = allDocuments.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding || [])
    }))

    // Sort by similarity and return top-k
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  async searchByType(
    query: string,
    type: 'program' | 'course' | 'professor' | 'event' | 'opportunity',
    topK: number = 5
  ): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    const queryEmbedding = await this.generateEmbedding(query)
    const documents = await this.getDocumentsByType(type)

    const results = documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding || [])
    }))

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  async getDocumentsByType(
    type: 'program' | 'course' | 'professor' | 'event' | 'opportunity'
  ): Promise<EmbeddingDocument[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['documents'], 'readonly')
      const store = transaction.objectStore('documents')
      const index = store.index('type')
      const request = index.getAll(type)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAllDocuments(): Promise<EmbeddingDocument[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['documents'], 'readonly')
      const store = transaction.objectStore('documents')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clearDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['documents'], 'readwrite')
      const store = transaction.objectStore('documents')
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (normA * normB)
  }
}

// Export singleton instance
export const embeddingsService = new EmbeddingsService()
export type { EmbeddingDocument, SearchResult }
