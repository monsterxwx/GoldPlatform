export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const streamChatCompletion = async (
  messages: ChatMessageParam[],
  apiKey: string,
  apiBaseUrl: string,
  modelName: string,
  onChunk: (text: string) => void
) => {
  if (!apiKey) {
    throw new Error('API Key is required');
  }

  // Ensure apiBaseUrl does not end with a slash, and append /chat/completions if not present
  let url = apiBaseUrl.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/chat/completions')) {
    url += '/chat/completions';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      stream: true,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error (${response.status}): ${errText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let buffer = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // ignore JSON parse error for incomplete chunks
          }
        }
      }
    }
  }
};
