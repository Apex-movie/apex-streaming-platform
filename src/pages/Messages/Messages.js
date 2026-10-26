import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Messages.css";

const API_URL = process.env.REACT_APP_API_URL || "https://apex-streaming-backend.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export default function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = useCallback(async (showLoading = false) => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const data = await apiRequest("/api/support/me");
      setMessages(Array.isArray(data) ? data : []);
      setError("");
      await apiRequest("/api/support/me/read", { method: "PATCH" });
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("session has expired")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  // REST-only chat: refresh the conversation periodically.
  useEffect(() => {
    const timer = setInterval(() => loadMessages(false), 5000);
    return () => clearInterval(timer);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || sending) return;

    setSending(true);
    setError("");

    try {
      const saved = await apiRequest("/api/support/send", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      setMessages((current) => {
        if (current.some((item) => item._id === saved._id)) return current;
        return [...current, saved];
      });

      setDraft("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="support-page">
      <section className="support-shell">
        <header className="support-header">
          <button
            type="button"
            className="support-back"
            onClick={() => navigate("/home")}
          >
            ← Home
          </button>

          <div className="support-brand">
            <div className="support-avatar">A</div>
            <div>
              <h1>Apex Support</h1>
              <p>Send us a message and we’ll get back to you.</p>
            </div>
          </div>

          <span className="support-status">
            <i /> Support
          </span>
        </header>

        <div className="support-notice">
          Need help with a movie, your account, or something else? Write to us
          below. Your conversation is saved to your account.
        </div>

        <section className="support-chat" aria-label="Support conversation">
          {loading ? (
            <div className="support-empty">Loading your conversation…</div>
          ) : messages.length === 0 ? (
            <div className="support-empty">
              <div className="support-empty-icon">✉</div>
              <h2>How can we help?</h2>
              <p>Send your first message to start a conversation with Apex Support.</p>
            </div>
          ) : (
            <div className="support-message-list">
              {messages.map((item) => (
                <article
                  key={item._id}
                  className={`support-message ${
                    item.senderRole === "user" ? "mine" : "theirs"
                  }`}
                >
                  <div className="support-message-sender">
                    {item.senderRole === "user" ? "You" : "Apex Support"}
                  </div>
                  <div className="support-bubble">{item.message}</div>
                  <time>{formatTime(item.createdAt)}</time>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </section>

        {error && <div className="support-error">{error}</div>}

        <form className="support-composer" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write your message…"
            maxLength={3000}
            rows={2}
            aria-label="Your message"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="support-composer-footer">
            <span>Enter to send · Shift + Enter for a new line</span>
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="support-send"
            >
              {sending ? "Sending…" : "Send message ↑"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}