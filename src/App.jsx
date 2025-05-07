import '@carbon/react';
import React from 'react';
import { useState, useRef } from 'react';
import './App.scss';

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
import { Send } from '@carbon/icons-react';
import ReactMarkdown from 'react-markdown';



export default function CarbonChatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const assistantMessageIndexRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://ollama-route-demo-ollama-chatbot.apps.fusion101.hpdalab.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'zephyr:latest',
          messages: [...messages, userMessage],
          stream: true
        })
      });
  
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  
      // Safely track assistant message index using useRef
      setMessages(prev => {
        const newIndex = prev.length;
        assistantMessageIndexRef.current = newIndex;
        return [...prev, { role: 'assistant', content: '' }];
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partial = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        partial += decoder.decode(value, { stream: true });
  
        // Process lines
        //const lines = partial.split('\n').filter(line => line.trim() !== '');
        //partial = ''; // Reset buffer for next read
        const chunks = partial.split('\n');
        partial = chunks.pop(); // Save the last incomplete line for next round
        const lines = chunks.filter(line => line.trim() !== '');
  
        for (let line of lines) {
         // if (line.startsWith('data:')) {
            try {
              let cleaned = line.trim();
              if (cleaned.startsWith('data:')) {
                cleaned = cleaned.replace(/^data:\s*/, '');
              }
              const json = JSON.parse(cleaned);
              //const json = JSON.parse(line.replace(/^data:\s*/, ''));
              //const json = JSON.parse(line);
              //const delta = json.choices?.[0]?.delta?.content;
              const delta = json.message?.content ?? json.choices?.[0]?.delta?.content;
              if (delta) {
                setMessages(prev => {
                  const updated = [...prev];
                  const index = assistantMessageIndexRef.current;
                  const current = updated[index];
                  updated[index] = {
                    ...current,
                    content: current.content + delta
                  };
                  return updated;
                });
              }
            } catch (err) {
              console.error('Stream JSON parse error:', err);
            }
          //}
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
              renderIcon={Send}
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

