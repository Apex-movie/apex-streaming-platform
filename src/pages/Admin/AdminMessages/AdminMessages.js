import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminMessages.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const loadInbox = useCallback(async () => {
    try {
      const data = await apiRequest("/api/support/admin/inbox");
      setInbox(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("session has expired")) {
        navigate("/login");
      }
    } finally {
      setLoadingInbox(false);
    }
  }, [navigate]);

  const loadConversation = useCallback(async (userId, showLoading = false) => {
    if (!userId) return;

    if (showLoading) setLoadingMessages(true);

    try {
      const data = await apiRequest(
        `/api/support/admin/conversation/${encodeURIComponent(userId)}`
      );

      setMessages(Array.isArray(data) ? data : []);
      await apiRequest(
        `/api/support/admin/conversation/${encodeURIComponent(userId)}/read`,
        { method: "PATCH" }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    loadInbox();
  }, [loadInbox, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadInbox();
      if (selectedUser) loadConversation(selectedUser);
    }, 5000);

    return () => clearInterval(timer);
  }, [loadInbox, loadConversation, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function selectConversation(userId) {
    setSelectedUser(userId);
    setMessages([]);
    setError("");
    await loadConversation(userId, true);
    await loadInbox();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || !selectedUser || sending) return;

    setSending(true);
    setError("");

    try {
      const saved = await apiRequest("/api/support/admin/send", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedUser,
          message,
        }),
      });

      setMessages((current) => {
        if (current.some((item) => item._id === saved._id)) return current;
        return [...current, saved];
      });

      setDraft("");
      await loadInbox();
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

  function shortId(id) {
    return id ? String(id).slice(-7).toUpperCase() : "UNKNOWN";
  }

  const activeConversation = inbox.find((item) => item._id === selectedUser);

  return (
    <main className="admin-support-page">
      <section className="admin-support-shell">
        <header className="admin-support-topbar">
          <div>
            <span className="admin-support-eyebrow">APEX ADMINISTRATION</span>
            <h1>Support Inbox</h1>
            <p>Manage user questions and support requests.</p>
          </div>

          <button
            type="button"
            className="admin-support-back"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>
        </header>

        {error && <div className="admin-support-error">{error}</div>}

        <div className="admin-support-layout">
          <aside className="admin-support-sidebar">
            <div className="admin-support-sidebar-heading">
              <h2>Conversations</h2>
              <span>{inbox.length}</span>
            </div>

            {loadingInbox ? (
              <div className="admin-support-muted">Loading inbox…</div>
            ) : inbox.length === 0 ? (
              <div className="admin-support-no-conversations">
                <span>✉</span>
                <p>No support conversations yet.</p>
              </div>
            ) : (
              <div className="admin-support-conversation-list">
                {inbox.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    className={`admin-support-conversation ${
                      selectedUser === item._id ? "active" : ""
                    }`}
                    onClick={() => selectConversation(item._id)}
                  >
                    <span className="admin-support-user-avatar">U</span>
                    <span className="admin-support-conversation-info">
                      <span className="admin-support-user-name">
                        User {shortId(item._id)}
                      </span>
                      <span className="admin-support-last-message">
                        {item.lastMessage}
                      </span>
                      <span className="admin-support-last-time">
                        {item.lastMessageAt ? formatTime(item.lastMessageAt) : ""}
                      </span>
                    </span>

                    {item.unreadCount > 0 && (
                      <span className="admin-support-unread">
                        {item.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="admin-support-chat">
            {!selectedUser ? (
              <div className="admin-support-welcome">
                <div className="admin-support-welcome-icon">✉</div>
                <h2>Select a conversation</h2>
                <p>Choose a user from the inbox to view messages and reply.</p>
              </div>
            ) : (
              <>
                <header className="admin-support-chat-header">
                  <span className="admin-support-user-avatar large">U</span>
                  <div>
                    <h2>User {shortId(selectedUser)}</h2>
                    <p>
                      {activeConversation?.lastMessageAt
                        ? `Last activity: ${formatTime(activeConversation.lastMessageAt)}`
                        : "Support conversation"}
                    </p>
                  </div>
                </header>

                <div className="admin-support-message-area">
                  {loadingMessages ? (
                    <div className="admin-support-muted">
                      Loading conversation…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="admin-support-muted">
                      No messages in this conversation.
                    </div>
                  ) : (
                    messages.map((item) => (
                      <article
                        key={item._id}
                        className={`admin-support-message ${
                          item.senderRole === "admin" ? "admin-mine" : "admin-theirs"
                        }`}
                      >
                        <span className="admin-support-message-sender">
                          {item.senderRole === "admin" ? "You · Support" : "User"}
                        </span>
                        <div className="admin-support-bubble">{item.message}</div>
                        <time>{formatTime(item.createdAt)}</time>
                      </article>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form className="admin-support-composer" onSubmit={handleSubmit}>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a reply…"
                    maxLength={3000}
                    rows={2}
                    aria-label="Write a reply"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <div className="admin-support-composer-footer">
                    <span>Enter to send · Shift + Enter for a new line</span>
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                    >
                      {sending ? "Sending…" : "Send reply ↑"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}