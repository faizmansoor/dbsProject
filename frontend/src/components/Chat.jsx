import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chat({ apiUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${apiUrl}/chat/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', message: userMessage, created_at: new Date() }]);

    try {
      const response = await axios.post(`${apiUrl}/chat/ai-response`, {
        message: userMessage
      });

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'assistant', message: response.data.response, created_at: new Date() }]);
      setLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await axios.delete(`${apiUrl}/chat/history`);
        setMessages([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>🤖 AI Financial Assistant</h2>
        <button className="btn btn-secondary" onClick={clearHistory}>
          Clear History
        </button>
      </div>

      <div className="chart-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>👋 Hi! I'm your AI financial assistant. Ask me anything about your finances!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>
                    {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                  </div>
                  {msg.message}
                  <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.6 }}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>🤖 Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your finances..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ width: 'auto' }}
          >
            Send
          </button>
        </form>
      </div>

      <div className="chart-card" style={{ marginTop: '20px' }}>
        <h3>💡 Try asking:</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li>"How much have I spent this month?"</li>
          <li>"What are my top spending categories?"</li>
          <li>"Am I saving enough?"</li>
          <li>"Give me budget tips"</li>
          <li>"What's my total income?"</li>
        </ul>
      </div>
    </div>
  );
}

export default Chat;