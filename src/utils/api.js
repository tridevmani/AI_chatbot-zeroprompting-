const API_BASE = '/api';

export async function sendMessage({ message, history = [], personality = 'default', stream = true, onChunk, onDone, onError }) {
  try {
    if (stream) {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, personality, stream: true }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onDone?.(fullText);
              return fullText;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                onChunk?.(parsed.text, fullText, parsed.intent);
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      onDone?.(fullText);
      return fullText;
    } else {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, personality, stream: false }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      onDone?.(data.message);
      return data.message;
    }
  } catch (error) {
    onError?.(error.message);
    throw error;
  }
}

export async function fetchSuggestions(context = '') {
  try {
    const response = await fetch(`${API_BASE}/chat/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    const data = await response.json();
    return data.suggestions ?? [];
  } catch {
    return [];
  }
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return response.json();
}
