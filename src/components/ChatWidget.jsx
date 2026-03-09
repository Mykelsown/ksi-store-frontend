// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const SYSTEM_PROMPT = `You are KSI Assistant, the friendly and knowledgeable AI customer care agent for KSI Gadget — Nigeria's #1 online gadget store.

Store info:
- Products: Smartphones, laptops, accessories (headphones, smartwatches, power banks, tablets, mice)
- Top brands: Apple, Samsung, Xiaomi, Tecno, Infinix, Dell, HP, Lenovo, Asus, Sony, Anker, Logitech, Google
- Delivery: Same-day in Lagos; 3–5 business days nationwide
- Returns: 15-day hassle-free return policy, item must be in original condition
- Payment: Bank transfer, Visa/Mastercard, USSD, mobile money — all secure and encrypted
- Warranty: All products are 100% genuine with manufacturer warranty
- Contact: support@ksigadget.ng | +234 800 KSI GADGET | 12 Broad Street, Lagos Island, Lagos
- Operating hours: Mon–Sat 8am–8pm

Be warm, concise, and genuinely helpful. Answer in 2–4 sentences unless more detail is needed. Use emojis lightly. If you don't know something specific, offer to escalate to a human agent.`;

const SUGGESTIONS = [
  { icon: '📦', text: 'Track my order' },
  { icon: '📱', text: 'Best phones under ₦300k' },
  { icon: '↩️', text: 'Return policy' },
  { icon: '🚚', text: 'Delivery info' },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! 👋 I'm KSI Assistant, your 24/7 AI customer care agent.\n\nI can help you with product info, orders, delivery, returns, and more. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userText }]);
    setLoading(true);

    const newHistory = [...history, { role: 'user', content: userText }];
    setHistory(newHistory);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having trouble right now. Please email support@ksigadget.ng 📧";
      const updatedHistory = [...newHistory, { role: 'assistant', content: reply }];
      setHistory(updatedHistory);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please email us at support@ksigadget.ng or call +234 800 KSI GADGET 📞",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'Chat cleared! How can I help you? 😊',
    }]);
    setHistory([]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button className="chat-bubble" onClick={() => setOpen(true)}>
          <span className="chat-bubble-icon">💬</span>
          <span className="chat-label">AI Support</span>
        </button>
      )}

      {/* Chat Window */}
      <div className={`chat-window ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-name">KSI Assistant</div>
              <div className="chat-status">
                <span className="status-dot" /> Online · AI Powered
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="chat-action-btn" onClick={clearChat} title="Clear chat">🗑️</button>
            <button className="chat-action-btn" onClick={() => setOpen(false)} title="Close">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.role}`}>
              <div className="msg-avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
              <div className="msg-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  disabled={loading}
                >
                  {s.icon} {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-msg assistant">
              <div className="msg-avatar">🤖</div>
              <div className="msg-bubble typing">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Type your message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
