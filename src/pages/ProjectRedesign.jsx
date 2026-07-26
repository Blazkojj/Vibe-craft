import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Play, Settings, Code2, MessageSquare, FileText, Terminal } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../LangContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function ProjectRedesign() {
  const { id } = useParams();
  const { lang } = useLang();
  const isEN = lang === 'en';
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('files');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) {
        setProjectData(data);
        if (data.messages && data.messages.length > 0) {
          const cleanedMessages = data.messages.map(msg => ({ ...msg, isStreaming: false }));
          setMessages(cleanedMessages);
        }
      }
    };
    fetchProject();
  }, [id]);

  if (!projectData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e5e5', borderTopColor: '#333', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  const getModelDisplayName = (model) => {
    const mapping = {
      'claude-opus-4-8': 'Opus 4.8',
      'claude-sonnet-5': 'Sonnet 5.0',
      'claude-sonnet-4-6': 'Sonnet 4.6',
      'z-ai/glm-5.2': 'GLM 5.2'
    };
    return mapping[model] || 'GLM 5.2';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Simple Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px',
        padding: '0 16px',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '6px 12px',
              background: 'none',
              border: '1px solid #d5d5d5',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            ← Back
          </button>
          <Separator orientation="vertical" style={{ height: '20px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{projectData.title}</span>
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>MC {projectData.version} • {projectData.engine}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={projectData.model}
            onChange={(e) => {
              setProjectData(prev => ({...prev, model: e.target.value}));
              supabase.from('projects').update({ model: e.target.value }).eq('id', id);
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #d5d5d5',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            <option value="claude-opus-4-8">Opus 4.8</option>
            <option value="claude-sonnet-5">Sonnet 5.0</option>
            <option value="claude-sonnet-4-6">Sonnet 4.6</option>
            <option value="z-ai/glm-5.2">GLM 5.2</option>
          </select>

          <button
            style={{
              padding: '6px 16px',
              background: '#333',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Play size={14} />
            Build
          </button>

          <button
            onClick={() => navigate('/ustawienia')}
            style={{
              width: '32px',
              height: '32px',
              background: 'none',
              border: '1px solid #d5d5d5',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT PANEL - Workspace (60%) */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e5e5' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', backgroundColor: '#fafafa' }}>
            <button
              onClick={() => setActiveLeftTab('files')}
              style={{
                padding: '12px 24px',
                background: activeLeftTab === 'files' ? '#fff' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'files' ? '2px solid #333' : '2px solid transparent',
                fontSize: '13px',
                cursor: 'pointer',
                color: activeLeftTab === 'files' ? '#333' : '#666',
                fontWeight: activeLeftTab === 'files' ? 500 : 400
              }}
            >
              Files
            </button>
            <button
              onClick={() => setActiveLeftTab('code')}
              style={{
                padding: '12px 24px',
                background: activeLeftTab === 'code' ? '#fff' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'code' ? '2px solid #333' : '2px solid transparent',
                fontSize: '13px',
                cursor: 'pointer',
                color: activeLeftTab === 'code' ? '#333' : '#666',
                fontWeight: activeLeftTab === 'code' ? 500 : 400
              }}
            >
              Code
            </button>
            <button
              onClick={() => setActiveLeftTab('console')}
              style={{
                padding: '12px 24px',
                background: activeLeftTab === 'console' ? '#fff' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'console' ? '2px solid #333' : '2px solid transparent',
                fontSize: '13px',
                cursor: 'pointer',
                color: activeLeftTab === 'console' ? '#333' : '#666',
                fontWeight: activeLeftTab === 'console' ? 500 : 400
              }}
            >
              Console
            </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, padding: '24px', overflow: 'auto', backgroundColor: '#fff' }}>
            {activeLeftTab === 'files' && (
              <div>
                <p style={{ color: '#999', fontSize: '13px' }}>No files generated yet. Use the AI assistant to generate code.</p>
              </div>
            )}
            {activeLeftTab === 'code' && (
              <div>
                <p style={{ color: '#999', fontSize: '13px' }}>Code editor will appear here.</p>
              </div>
            )}
            {activeLeftTab === 'console' && (
              <div>
                <p style={{ color: '#999', fontSize: '13px', fontFamily: 'monospace' }}>Build console output will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - AI Assistant (40%) */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>

          {/* Assistant Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e5e5',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333' }}>AI Assistant</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
              {getModelDisplayName(projectData.model)}
            </p>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflow: 'auto', backgroundColor: '#fff' }}>
            {messages.length === 0 && !isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MessageSquare size={32} style={{ color: '#ccc', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Start a conversation</p>
                <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>Ask the AI to generate code for your project</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg) => {
                  const isUser = msg.sender === 'You';
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isUser ? '#e5e5e5' : '#333',
                        color: isUser ? '#333' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {isUser ? (currentUser?.email?.charAt(0).toUpperCase() || 'U') : 'AI'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>
                          {isUser ? 'You' : getModelDisplayName(projectData.model)} • {msg.time}
                        </div>
                        <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isGenerating && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#333',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      AI
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#999' }}></span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#999' }}></span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#999' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e5e5', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isGenerating}
                style={{
                  flex: 1,
                  minHeight: '80px',
                  maxHeight: '200px',
                  padding: '12px',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    // handleSend()
                  }
                }}
              />
              <button
                disabled={!chatInput.trim() || isGenerating}
                style={{
                  width: '40px',
                  height: '40px',
                  background: !chatInput.trim() || isGenerating ? '#e5e5e5' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: !chatInput.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
              Cmd/Ctrl + Enter to send
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProjectRedesign;
