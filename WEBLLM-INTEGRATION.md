# WebLLM Integration Guide

This document describes the in-browser LLM inference integration using WebLLM and MLC.

## Overview

The CU Entrepreneurship Navigator now includes local AI inference capabilities using WebLLM. This allows users to generate explanations about program relevance entirely in their browser, without sending data to external servers.

## Architecture

### Components

1. **useWebLLM Hook** (`src/useWebLLM.ts`)
   - Manages the MLCEngine lifecycle
   - Handles model initialization and loading
   - Provides a `generate()` function for text generation
   - Tracks loading state and progress

2. **RelevanceExplainer Component** (`src/RelevanceExplainer.tsx`)
   - User interface for testing WebLLM integration
   - Allows users to input:
     - Program name (e.g., "New Venture Challenge")
     - Entrepreneurial goal (e.g., "Build an AI startup")
   - Displays:
     - Engine initialization status
     - Model loading progress
     - Generated explanations
     - Error messages

3. **CUEntrepreneurshipAgent Main App** (`src/CUEntrepreneurshipAgent.tsx`)
   - Integrated RelevanceExplainer as "Local AI" tab (🧠)
   - Accessible from main navigation

## Model Configuration

- **Model**: Phi-2-q4f32_1-MLC
- **Size**: ~50-100MB (downloaded on first use)
- **Context**: Efficient for entrepreneurship domain explanations
- **Cache**: Persisted in browser (IndexedDB)

### Why Phi-2?

- Small enough to run on consumer hardware
- Fast inference (typically 10-50 tokens/second)
- Good quality for domain-specific explanations
- Supports 2048 token context window

## Quick Start

### Development

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. Navigate to the "🧠 Local AI" tab

4. Test the integration:
   - Enter a program name: "New Venture Challenge"
   - Enter your goal: "Build an AI startup"
   - Click "Generate Explanation"

### First Run Notes

- **Initial Model Load**: First use will download the Phi-2 model (~50-100MB)
  - Progress is displayed in the status section
  - This happens once per browser/device
  - Subsequent uses are instant

- **Browser Requirements**:
  - Modern browser with WebAssembly support
  - IndexedDB for model caching
  - Sufficient disk space for model cache
  - Recommended: Chrome 90+, Firefox 78+, Safari 14+

## Usage Example

```typescript
import { useWebLLM } from './useWebLLM'

function MyComponent() {
  const { isModelReady, generate, isLoading, error } = useWebLLM()

  const handleGenerate = async () => {
    try {
      const response = await generate(
        'Explain why this program matters',
        'You are a helpful entrepreneurship advisor'
      )
      console.log(response)
    } catch (err) {
      console.error('Generation failed:', err)
    }
  }

  return (
    <div>
      {isLoading && <p>Loading model... {progress}%</p>}
      {error && <p>Error: {error}</p>}
      {isModelReady && <button onClick={handleGenerate}>Generate</button>}
    </div>
  )
}
```

## Integration Points

### Current

- **RelevanceExplainer Tab**: Full UI for testing explanations
- **Status Indicators**: Model loading progress and readiness
- **Error Handling**: Graceful fallback and error messages

### Future Opportunities

1. **Chat Integration**: Use WebLLM as fallback when Worker API is unavailable
2. **Batch Processing**: Generate explanations for multiple programs
3. **Custom Models**: Support for other small efficient models (Mistral, Llama 2)
4. **Offline Mode**: Cache explanations locally for offline access
5. **Performance**: Dynamic model selection based on device capabilities

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Model Download | ~100MB (first time only) |
| Model Load Time | ~5-10 seconds |
| Generation Speed | 10-50 tokens/second |
| Memory Usage | ~1-2GB during inference |
| Cache Size | ~100MB (IndexedDB) |

## Testing Checklist

- [ ] Model loads successfully on first visit
- [ ] Progress bar shows loading percentage
- [ ] Can enter program name and goal
- [ ] Generation produces relevant explanations
- [ ] Multiple explanations can be generated sequentially
- [ ] Error states display helpful messages
- [ ] Works on mobile (responsive design)
- [ ] Model caching works on reload

## Troubleshooting

### Model Won't Load

**Symptoms**: Stuck on "Loading... 0%" or error about model download

**Solutions**:
1. Check network connectivity
2. Clear browser cache: Settings → Clear browsing data → Cache
3. Try incognito/private window
4. Check browser console for detailed errors (F12)

### Generation Slow

**Symptoms**: Text generation takes >30 seconds per response

**Causes**:
- Device lacking sufficient RAM
- Browser background tabs consuming resources
- Network issues (if using remote model)

**Solutions**:
1. Close other browser tabs
2. Use Incognito/private window
3. Allow at least 2GB free RAM

### "Engine Not Initialized" Error

**Solutions**:
1. Wait for model to finish loading (check progress bar)
2. Reload page and wait for complete initialization
3. Clear browser storage and reload

## Architecture Decisions

### Why MLCEngine vs. Other Options?

- **WebLLM/MLCEngine**: Best browser support, mature, good documentation
- **Ollama**: Requires local server, not true in-browser
- **LM Studio**: Desktop application, not web-native
- **Transformers.js**: Slower for this use case, larger models

### Stateless Design

- Hook manages engine lifecycle
- Component controls UI state
- Easy to swap engine implementation later

### Single Model Default

- Simplifies initial implementation
- Can add model selection later
- Phi-2 chosen for performance/quality balance

## Deployment

### Production Build

```bash
npm run build
npm run deploy  # Deploys to Cloudflare Workers
```

The WebLLM model will:
- Be downloaded to users' browsers on first use
- Use browser's IndexedDB for persistent caching
- Not increase server bandwidth costs

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | Full | Recommended |
| Firefox 78+ | Full | Good support |
| Safari 14+ | Full | May be slower on older devices |
| Edge 90+ | Full | Chromium-based |

## Next Steps

1. **Monitor Performance**: Track model load times and generation speed
2. **Gather Feedback**: Collect user experience data
3. **Add More Models**: Support for different domains (funding, mentorship)
4. **Caching Strategy**: Store generated explanations for common program/goal pairs
5. **Analytics**: Track which programs/goals users explore

## References

- [WebLLM Documentation](https://mlc.ai/web-llm/)
- [MLC LLM Project](https://mlc.ai/)
- [Phi-2 Model Card](https://huggingface.co/microsoft/phi-2)

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Review this guide's troubleshooting section
3. Check WebLLM GitHub issues: https://github.com/mlc-ai/web-llm
