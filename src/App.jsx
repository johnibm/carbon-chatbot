import { Header, HeaderName } from '@carbon/react';
import 'carbon-components/css/carbon-components.min.css';
import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Loading,
  InlineNotification,
  Content,
  Grid,
  Column,
  Stack
} from '@carbon/react';
import { Send16 } from '@carbon/icons-react';
import ReactMarkdown from 'react-markdown';


export default function CarbonChatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://$OLLAMA_HOST:11434/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // or any model you’ve pulled
          messages: [...messages, userMessage],
          stream: true
        })
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      let assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partial = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        // Stream chunks separated by \n\ndata: {...}
        const lines = partial.split('\n').filter(line => line.trim() !== '');
        for (let line of lines) {
          if (line.startsWith('data:')) {
            const json = JSON.parse(line.replace(/^data:\s*/, ''));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistantMessage.content += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMessage };
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content>
      <Grid fullWidth style={{ padding: '2rem' }}>
        <Column sm={4} md={8} lg={12}>
          <h1 style={{ marginBottom: '1rem' }}>💬 Carbon Chatbot</h1>

          <div
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              backgroundColor: '#f4f4f4',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            {messages.map((msg, index) => (
              <Stack key={index} gap={2} style={{ marginBottom: '1rem' }}>
                <strong>{msg.role === 'user' ? '🧑 You' : '🤖 Bot'}</strong>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </Stack>
            ))}
            {loading && <Loading small withOverlay={false} />}
          </div>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              style={{ marginBottom: '1rem' }}
            />
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <TextInput
              id="chat-input"
              labelText=""
              placeholder="Ask me something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flexGrow: 1 }}
            />
            <Button
              renderIcon={Send16}
              iconDescription="Send message"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </Button>
          </div>
        </Column>
      </Grid>
    </Content>
  );
}
