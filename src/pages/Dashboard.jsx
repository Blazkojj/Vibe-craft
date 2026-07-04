import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderOpen, ChevronDown, Sparkles, Command, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';
import './Dashboard.css';

const MC_VERSIONS = [
  '26.2', '26.1.2', '26.1.1', '26.1',
  '1.21.11', '1.21.10', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
  '1.20.6', '1.20.5', '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16',
  '1.15.2', '1.15.1', '1.15',
  '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14',
  '1.13.2', '1.13.1', '1.13',
  '1.12.2', '1.12.1', '1.12',
  '1.11.2', '1.11.1', '1.11',
  '1.10.2', '1.10.1', '1.10',
  '1.9.4', '1.9.3', '1.9.2', '1.9.1', '1.9',
  '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.3', '1.8.2', '1.8.1', '1.8'
];

const ENGINES = [
  // Serwery MC
  'Paper', 'Purpur', 'Spigot', 'Bukkit', 'Folia', 'Pufferfish', 'Glowstone', 'Minestom',
  // Proxy
  'Velocity', 'BungeeCord', 'Waterfall', 'Aegis', 'FlameCord', 'WaterdogPE', 'Geyser',
  // Modowane
  'Fabric', 'Forge', 'NeoForge', 'Quilt', 'SpongeVanilla', 'SpongeForge',
  // Hybrydy (Mod + Plugin)
  'Mohist', 'Magma', 'Arclight', 'Crucible',
  // Bedrock
  'Nukkit', 'PowerNukkit', 'PocketMine-MP'
];

const MODELS = [
  'Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o', 'z-ai/glm-5.2'
];

function Dashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  
  // Selections
  const [model, setModel] = useState(MODELS[0]);
  const [engine, setEngine] = useState(ENGINES[0]);
  const [mcVersion, setMcVersion] = useState(MC_VERSIONS[0]);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        // Map the Supabase data to match frontend expectations (e.g., date -> created_at)
        const mapped = data.map(p => ({
          ...p,
          date: p.created_at,
        }));
        setProjects(mapped);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleGenerate = async () => {
    if (prompt.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Musisz być zalogowany!");
        navigate('/login');
        return;
      }
      
      const newProject = {
        user_id: user.id,
        title: prompt.split(' ').slice(0, 4).join(' ') + '...',
        prompt: prompt,
        version: mcVersion,
        engine: engine,
        model: model,
        messages: []
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();

      if (error) {
        alert("Błąd podczas tworzenia projektu w bazie!");
        console.error(error);
        return;
      }

      const createdProject = data[0];
      setPrompt('');
      navigate(`/project/${createdProject.id}`);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if(window.confirm('Czy na pewno chcesz bezpowrotnie usunąć ten projekt i jego czat?')) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (!error) {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
      }
    }
  };

  return (
    <div className="dashboard-container">
      


      {/* Minimal Generator */}
      <div className="minimal-generator" ref={dropdownRef}>
        <div className="generator-input-wrapper">
          <Command size={18} className="input-icon" />
          <textarea 
            className="minimal-input"
            placeholder="Co chcesz dzisiaj zbudować? (np. ekonomia, logowanie, system gildii...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="generator-toolbar">
          <div className="toolbar-selectors">
            {/* Model Selection */}
            <div className="relative dropdown-container">
              <button className="toolbar-btn" onClick={(e) => toggleDropdown('model', e)}>
                {model} <ChevronDown size={14} />
              </button>
              {activeDropdown === 'model' && (
                <div className="minimal-dropdown">
                  <div className="dropdown-label">Model AI</div>
                  {MODELS.map(m => (
                    <button key={m} onClick={() => { setModel(m); setActiveDropdown(null); }}>{m}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Engine Selection */}
            <div className="relative dropdown-container">
              <button className="toolbar-btn" onClick={(e) => toggleDropdown('engine', e)}>
                {engine} <ChevronDown size={14} />
              </button>
              {activeDropdown === 'engine' && (
                <div className="minimal-dropdown large-grid">
                  <div className="dropdown-label" style={{gridColumn: '1 / -1'}}>Silnik</div>
                  {ENGINES.map(e => (
                    <button key={e} onClick={() => { setEngine(e); setActiveDropdown(null); }}>{e}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Version Selection */}
            <div className="relative dropdown-container">
              <button className="toolbar-btn" onClick={(e) => toggleDropdown('version', e)}>
                {mcVersion} <ChevronDown size={14} />
              </button>
              {activeDropdown === 'version' && (
                <div className="minimal-dropdown large-grid">
                  <div className="dropdown-label" style={{gridColumn: '1 / -1'}}>Wersja MC</div>
                  {MC_VERSIONS.map(v => (
                    <button key={v} onClick={() => { setMcVersion(v); setActiveDropdown(null); }}>{v}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            className="btn-create"
            onClick={handleGenerate}
            disabled={!prompt.trim()}
          >
            <Sparkles size={16} /> Zbuduj Plugin
          </button>
        </div>
      </div>

      {/* Projects List Minimal */}
      <div className="projects-section">
        <h2 className="section-heading">Projekty</h2>
        
        {projects.length === 0 ? (
          <div className="minimal-empty">
            Brak aktywnych projektów.
          </div>
        ) : (
          <div className="minimal-projects-list">
            {projects.map((project) => (
              <div key={project.id} className="minimal-project-card" onClick={() => navigate(`/project/${project.id}`)}>
                <div className="project-info">
                  <Package size={16} className="text-muted" />
                  <span className="project-title">{project.title}</span>
                  <span className="project-meta">{project.engine} • {project.version}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="project-date text-muted">
                    {new Date(project.date).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    title="Usuń projekt"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
