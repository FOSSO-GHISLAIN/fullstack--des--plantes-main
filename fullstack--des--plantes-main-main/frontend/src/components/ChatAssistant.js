import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { chatWithAssistant } from '../services/aiService';

const STORAGE_KEY = 'planttracker_chat_history';

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Bonjour ! Je suis votre assistant IA agricole, propulsé par Google Gemini 🌿\nPosez-moi vos questions sur vos plantes : arrosage, maladies, récolte, engrais...',
  timestamp: Date.now(),
};

const QUICK_QUESTIONS = [
  'Pourquoi mes feuilles deviennent-elles jaunes ?',
  'Quel engrais dois-je utiliser ?',
  'Quand dois-je récolter ?',
  'Comment arroser correctement ?',
];

/** Charge l'historique depuis localStorage */
function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_MESSAGE];
    }
  } catch (_) {}
  return [INITIAL_MESSAGE];
}

/** Sauvegarde l'historique dans localStorage */
function saveHistory(messages) {
  try {
    // On garde max 100 messages pour ne pas surcharger localStorage
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
}

export default function ChatAssistant() {
  const { plants } = useApp();
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [plantContext, setPlantContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Sauvegarde automatique à chaque changement de messages
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // Scroll auto vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const context = plants.find((p) => p.id === plantContext) || null;

    const userMessage = { role: 'user', text: msg, timestamp: Date.now() };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // On passe l'historique complet pour que Gemini garde le contexte conversationnel
      const currentHistory = [...messages, userMessage];
      const reply = await chatWithAssistant(msg, context, currentHistory);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply, timestamp: Date.now() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, plants, plantContext]);

  const clearHistory = () => {
    const fresh = [INITIAL_MESSAGE];
    setMessages(fresh);
    saveHistory(fresh);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-section">
      <div className="section-header row">
        <div>
          <h2 className="chat-title">
            <Bot size={22} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Assistant IA agricole
          </h2>
          <p>Propulsé par Google Gemini · L'historique est sauvegardé automatiquement</p>
        </div>
        <button
          type="button"
          className="btn-secondary btn-sm chat-clear-btn"
          onClick={clearHistory}
          title="Effacer l'historique"
        >
          <Trash2 size={14} style={{ marginRight: 4 }} />
          Effacer
        </button>
      </div>

      {/* Sélecteur de plante */}
      <div className="chat-context">
        <label htmlFor="plant-context-select">Contexte plante (optionnel)</label>
        <select
          id="plant-context-select"
          value={plantContext}
          onChange={(e) => setPlantContext(e.target.value)}
        >
          <option value="">Général</option>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Questions rapides */}
      <div className="quick-questions">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className="chip"
            onClick={() => sendMessage(q)}
            disabled={isLoading}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Fenêtre de chat */}
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role} ${m.isError ? 'error' : ''}`}>
            <span className={`bubble-avatar ${m.role}`}>
              {m.role === 'assistant'
                ? <Bot size={18} strokeWidth={1.8} />
                : <User size={18} strokeWidth={1.8} />}
            </span>
            <div className="bubble-content">
              <p>{m.text}</p>
              {m.timestamp && (
                <span className="bubble-time">{formatTime(m.timestamp)}</span>
              )}
            </div>
          </div>
        ))}

        {/* Indicateur de chargement animé */}
        {isLoading && (
          <div className="chat-bubble assistant">
            <span className="bubble-avatar assistant">
              <Bot size={18} strokeWidth={1.8} />
            </span>
            <div className="bubble-content loading-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Écrivez votre question... (Entrée pour envoyer)"
          disabled={isLoading}
          aria-label="Message pour l'assistant IA"
        />
        <button
          type="button"
          className="btn-primary chat-send-btn"
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          aria-label="Envoyer le message"
        >
          {isLoading
            ? <Loader2 size={18} className="spin-icon" />
            : <Send size={18} />}
        </button>
      </div>


    </div>
  );
}
