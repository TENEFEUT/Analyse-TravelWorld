"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./chatbot.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    // Message de bienvenue
    setMessages([
      {
        role: "assistant",
        content:
          "Bonjour ! Je suis votre assistant personnel pour vos projets d'immigration. Comment puis-je vous aider aujourd'hui ? 😊",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Désolé, une erreur s'est produite. Veuillez réessayer dans quelques instants.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const quickQuestions = [
    "Quels sont les documents nécessaires pour mon dossier ?",
    "Combien de temps prend la procédure ?",
    "Comment améliorer mes chances d'acceptation ?",
    "Quel est le coût total de ma procédure ?",
  ];

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="bot-avatar">
              <span>🤖</span>
            </div>
            <div className="header-info">
              <h1 className="header-title">Assistant IA TravelWorld</h1>
              <p className="header-status">
                {isAuthenticated
                  ? "Assistance personnalisée disponible"
                  : "Conseils généraux sur l'immigration"}
              </p>
            </div>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => router.push("/auth/login")}
              className="login-button"
            >
              Se connecter
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <div className="messages-wrapper">
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
              >
                <div className={`message-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                  <p className="message-text">{msg.content}</p>
                  <p className="message-time">
                    {msg.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant-row">
                <div className="message-bubble assistant-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Questions rapides */}
      {messages.length <= 1 && (
        <div className="quick-questions">
          <div className="quick-questions-content">
            <p className="quick-questions-title">Questions fréquentes :</p>
            <div className="quick-questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="quick-question-button"
                >
                   {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <div className="input-box">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question ici..."
              disabled={loading}
              rows={1}
              className="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="send-button"
            >
              {loading ? "..." : "Envoyer"}
            </button>
          </div>
          <p className="input-hint"> Appuyez sur Entrée pour envoyer</p>
        </div>
      </div>
    </div>
  );
}