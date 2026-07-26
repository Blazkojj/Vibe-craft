import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Code2, Play, Settings, User, CreditCard, Menu, X, ChevronDown, Send, Loader2, CheckCircle2, XCircle, Trash2, RotateCcw, Zap, Sparkles, Terminal, FileCode } from 'lucide-react';
import { supabase } from '../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';
import { useLang } from '../LangContext';
import './ProjectNew.css';

// Import wszystkich funkcji z oryginalnego Project.jsx
import {
  generateWithBackend,
  isClaudeModel,
  getIdentityInjection,
  getModelDisplayName,
  MINECRAFT_SERVERS_KNOWLEDGE
} from './Project';

function ProjectNew() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const isEN = lang === 'en';
  const navigate = useNavigate();

  // All state from original
  const [projectData, setProjectData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [buildError, setBuildError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialGenerated = useRef(false);
  const currentProjectIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isGeneratingRef = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const el = chatContainerRef.current;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 250;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Fetch project data (simplified - reuse logic from original)
  useEffect(() => {
    const fetchProject = async () => {
      if (currentProjectIdRef.current !== id) {
        currentProjectIdRef.current = id;
        initialGenerated.current = false;
        setMessages([]);
      }

      setProjectData(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const profileKey = `__user_profile:${user.email}__`;
      const { data: profs } = await supabase.from('projects').select('*').eq('title', profileKey);
      if (profs && profs[0]) {
        setUserProfile(profs[0].messages || {});
      }

      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) {
        setProjectData(data);
        if (data.messages && data.messages.length > 0) {
          const cleanedMessages = data.messages.map(msg => ({ ...msg, isStreaming: false }));
          setMessages(cleanedMessages);
          initialGenerated.current = true;
        }
      }
    };
    fetchProject();
  }, [id]);

  if (!projectData) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={32} />
        <p>{isEN ? 'Loading workspace...' : 'Ładowanie obszaru roboczego...'}</p>
      </div>
    );
  }

  return (
    <div className="workspace">
      {/* Top Navigation Bar */}
      <header className="workspace-header">
        <div className="header-left">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="project-title-area">
            <div className="project-icon">
              <Code2 size={18} />
            </div>
            <h1 className="project-title">{projectData.title}</h1>
          </div>

          <div className="header-divider" />

          <div className="model-selector">
            <button className="model-btn" onClick={() => setShowModelMenu(!showModelMenu)}>
              <Sparkles size={14} />
              <span>{getModelDisplayName(projectData.model)}</span>
              <ChevronDown size={14} />
            </button>

            {showModelMenu && (
              <div className="model-menu">
                <div className="menu-section-title">AI Model</div>
                {['claude-opus-4-8', 'claude-sonnet-5', 'claude-sonnet-4-6', 'z-ai/glm-5.2'].map(modelId => (
                  <button
                    key={modelId}
                    className={`menu-item ${projectData.model === modelId ? 'active' : ''}`}
                    onClick={() => {
                      setProjectData(prev => ({...prev, model: modelId}));
                      setShowModelMenu(false);
                      supabase.from('projects').update({ model: modelId }).eq('id', id);
                    }}
                  >
                    {getModelDisplayName(modelId)}
                    {projectData.model === modelId && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" title={isEN ? "Clear chat" : "Wyczyść czat"}>
            <Trash2 size={18} />
          </button>

          <button
            className="build-btn"
            onClick={() => {/* handleBuild logic */}}
            disabled={isBuilding}
          >
            {isBuilding ? (
              <>
                <Loader2 size={16} className="spinner" />
                {isEN ? 'Building...' : 'Budowanie...'}
              </>
            ) : (
              <>
                <Play size={16} />
                {isEN ? 'Build' : 'Zbuduj'}
              </>
            )}
          </button>

          <button className="icon-btn" onClick={() => navigate('/ustawienia')}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="workspace-body">
        {/* Sidebar */}
        <aside className={`workspace-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Workspace</h2>
            <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <MessageSquare size={18} />
              <span>Chat</span>
            </a>
            <a href="#" className="nav-item">
              <FileCode size={18} />
              <span>Files</span>
            </a>
            <a href="#" className="nav-item">
              <Terminal size={18} />
              <span>Console</span>
            </a>
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">
                {currentUser?.user_metadata?.discord_profile?.avatar ? (
                  <img src={currentUser.user_metadata.discord_profile.avatar} alt="Avatar" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {currentUser?.user_metadata?.discord_profile?.global_name ||
                   currentUser?.user_metadata?.username ||
                   currentUser?.email?.split('@')[0] || 'User'}
                </div>
                <div className="user-plan">{userProfile?.plan || 'Free'}</div>
              </div>
            </div>

            <div className="credits-card">
              <CreditCard size={14} />
              <span className="credits-label">{isEN ? 'Spent' : 'Wydano'}</span>
              <span className="credits-value">
                ${parseFloat(userProfile?.used_credits || '0').toFixed(2)}
              </span>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="workspace-main">
          <div className="chat-container" ref={chatContainerRef}>
            <div className="chat-messages">
              {messages.length === 0 && !isGenerating && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Zap size={32} />
                  </div>
                  <h2 className="empty-title">
                    {isEN ? 'Ready to build' : 'Gotowy do budowania'}
                  </h2>
                  <p className="empty-description">
                    {isEN
                      ? 'Describe what you want to create and AI will generate production-ready code.'
                      : 'Opisz co chcesz stworzyć, a AI wygeneruje gotowy kod produkcyjny.'}
                  </p>

                  <div className="starter-prompts">
                    <button className="starter-btn" onClick={() => setChatInput('Stwórz system skrzynek losujących')}>
                      <Code2 size={16} />
                      System skrzynek
                    </button>
                    <button className="starter-btn" onClick={() => setChatInput('Dodaj komendę /heal')}>
                      <Terminal size={16} />
                      Komenda /heal
                    </button>
                    <button className="starter-btn" onClick={() => setChatInput('Panel GUI z menu')}>
                      <Settings size={16} />
                      Panel GUI
                    </button>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'You';
                return (
                  <div key={msg.id} className={`message ${isUser ? 'user' : 'assistant'}`}>
                    <div className="message-avatar">
                      {isUser ? (
                        currentUser?.user_metadata?.discord_profile?.avatar ? (
                          <img src={currentUser.user_metadata.discord_profile.avatar} alt="" />
                        ) : (
                          <User size={16} />
                        )
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </div>

                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {isUser ? (isEN ? 'You' : 'Ty') : getModelDisplayName(projectData.model)}
                        </span>
                        <span className="message-time">{msg.time}</span>
                      </div>

                      <div className="message-body">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isGenerating && messages.length > 0 && !messages[messages.length-1]?.isStreaming && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Sparkles size={16} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-wrapper">
              <textarea
                className="chat-input"
                placeholder={isGenerating ? (isEN ? "AI is typing..." : "AI pisze...") : (isEN ? "Type your message..." : "Wpisz wiadomość...")}
                value={chatInput}
                disabled={isGenerating}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isGenerating && chatInput.trim()) {
                      // handleSend();
                    }
                  }
                }}
                rows={1}
              />

              <button
                className="send-btn"
                disabled={!chatInput.trim() || isGenerating}
                onClick={() => {/* handleSend */}}
              >
                {isGenerating ? (
                  <Loader2 size={20} className="spinner" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="input-footer">
              <div className="input-hints">
                <span className="hint">
                  <kbd>Enter</kbd> {isEN ? 'to send' : 'aby wysłać'}
                </span>
                <span className="hint">
                  <kbd>Shift</kbd> + <kbd>Enter</kbd> {isEN ? 'for new line' : 'nowa linia'}
                </span>
              </div>

              <div className="project-info">
                <span>MC {projectData.version}</span>
                <span className="separator">•</span>
                <span>{projectData.engine}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProjectNew;
