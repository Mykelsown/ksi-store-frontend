// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Box,
  MessageCircle,
  RotateCcw,
  Send,
  Smartphone,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { chatWithSupport } from "../api/support";
import "./ChatWidget.css";

const SUGGESTIONS = [
  { icon: Box, text: "Track my order" },
  { icon: Smartphone, text: "Best phones under ₦300k" },
  { icon: RotateCcw, text: "Return policy" },
  { icon: Truck, text: "Delivery info" },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm KSI Assistant, your 24/7 AI customer care agent.\n\nI can help you with product info, orders, delivery, returns, and more. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userText },
    ]);
    setLoading(true);

    const newHistory = [...history, { role: "user", content: userText }];
    setHistory(newHistory);

    try {
      const res = await chatWithSupport({
        message: userText,
        history,
      });
      const payload = res?.data || res;
      const reply =
        payload?.reply ||
        "I'm having trouble right now. Please email support@ksigadget.ng.";
      const updatedHistory = [
        ...newHistory,
        { role: "assistant", content: reply },
      ];
      setHistory(updatedHistory);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please email us at support@ksigadget.ng or call +234 800 KSI GADGET.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: "Chat cleared. How can I help you?",
      },
    ]);
    setHistory([]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button className="chat-bubble" onClick={() => setOpen(true)}>
          <span className="chat-bubble-icon">
            <MessageCircle size={18} />
          </span>
          <span className="chat-label">AI Support</span>
        </button>
      )}

      {/* Chat Window */}
      <div className={`chat-window ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <Bot size={18} />
            </div>
            <div>
              <div className="chat-name">KSI Assistant</div>
              <div className="chat-status">
                <span className="status-dot" /> Online · AI Powered
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-action-btn"
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
            <button
              className="chat-action-btn"
              onClick={() => setOpen(false)}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === "assistant" ? (
                  <Bot size={16} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="msg-bubble">
                {msg.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                // Suggestion items use icon components for consistent UI.
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  disabled={loading}
                >
                  <s.icon size={14} /> {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-msg assistant">
              <div className="msg-avatar">
                <Bot size={16} />
              </div>
              <div className="msg-bubble typing">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
