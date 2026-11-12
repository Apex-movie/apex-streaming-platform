
import React, { useState, useRef, useEffect } from 'react';
import './AdminAIChat.css';

const suggestions = [
  'How many total users are registered?',
  'How many monthly and yearly subscribers do we have?',
  'Which movie has the highest number of views?',
  'How many new users joined in the last 30 days?'
];

export default function AdminAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  const sendMessage = async (text = question) => {
    const prompt = text.trim();
    if (!prompt || loading) return;

    const previousMessages = messages;

    const nextMessages = [
      ...previousMessages,
      { role: 'user', content: prompt }
    ];

    setMessages(nextMessages);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://apex-streaming-backend.onrender.com/api/admin-ai/ask',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            question: prompt,
            history: previousMessages.slice(-8)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to get an answer.');
      }

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: data.answer
        }
      ]);
    } catch (err) {
      setMessages(previousMessages);
      setQuestion(prompt);
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apex-ai-widget">

      {!isOpen && (
        <button
          type="button"
          className="apex-ai-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          title="APEX AI Assistant"
        >
          <span className="apex-ai-launcher-icon">✦</span>
          <span>AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <section
          className="apex-ai-window"
          role="dialog"
          aria-label="APEX AI Assistant"
        >
          <header className="apex-ai-header">
            <div className="apex-ai-brand">
              <div className="apex-ai-avatar">✦</div>
              <div>
                <h3>APEX AI Assistant</h3>
                <p>Ask me anything about your platform</p>
              </div>
            </div>

            <button
              type="button"
              className="apex-ai-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              title="Close"
            >
              ×
            </button>
          </header>

          <div className="apex-ai-messages" aria-live="polite">

            {messages.length === 0 && (
              <div className="apex-ai-welcome">
                <div className="apex-ai-welcome-icon">✦</div>

                <h3>Hello, Admin! 👋</h3>

                <p>
                  I'm your APEX AI Assistant. Ask me anything about
                  your users, subscriptions, revenue, or most-viewed movies.
                </p>

                <div className="apex-ai-suggestions">
                  {suggestions.map(item => (
                    <button
                      type="button"
                      key={item}
                      disabled={loading}
                      onClick={() => sendMessage(item)}
                    >
                      {item}
                      <span>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`apex-ai-message ${
                  message.role === 'user'
                    ? 'apex-ai-user-message'
                    : 'apex-ai-bot-message'
                }`}
              >
                <span className="apex-ai-message-label">
                  {message.role === 'user' ? 'You' : 'APEX AI'}
                </span>

                <p>{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="apex-ai-message apex-ai-bot-message">
                <span className="apex-ai-message-label">APEX AI</span>
                <p className="apex-ai-thinking">
                  Analyzing your data...
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="apex-ai-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="apex-ai-form"
            onSubmit={event => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder="Type your question here..."
              aria-label="Ask APEX AI a question"
              maxLength={2000}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send message"
            >
              {loading ? '…' : '↑'}
            </button>
          </form>

          <div className="apex-ai-footer">
            Powered by APEX AI
          </div>
        </section>
      )}
    </div>
  );
}
