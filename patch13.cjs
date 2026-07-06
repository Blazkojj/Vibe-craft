const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// 1. Update getModelDisplayName fallback
code = code.replace(/return mapping\[model\] \|\| 'Gemini 2\.5 Flash';/g, "return mapping[model] || 'GLM 5.2 (z-ai)';");

// 2. Remove gemini-2.0-flash fallback in generateInitial and handleSend
code = code.replace(/let selectedModel = "gemini-2\.0-flash";/g, 'let selectedModel = "z-ai/glm-5.2";');

// 3. Dropdown replacement
const targetDropdown = `                    {isModelMenuOpen && (
                      <div className="model-menu-dropdown top-dropdown">
                        
                          <div 
                            className={\`model-option \${projectData.model === 'opus-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('opus-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Opus 4.8
                            </div>
                            {projectData.model === 'opus-4.8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-opus-4-8' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-opus-4-8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Opus 4.8
                            </div>
                            {projectData.model === 'claude-opus-4-8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-opus-4-7' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-opus-4-7')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Opus 4.7
                            </div>
                            {projectData.model === 'claude-opus-4-7' && <Check size={14} />}
                          </div>
                          
                          <div 
                            className={\`model-option \${projectData.model === 'sonnet-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('sonnet-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Sonnet 4.8
                            </div>
                            {projectData.model === 'sonnet-4.8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-sonnet-4-6' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-sonnet-4-6')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Sonnet 4.6
                            </div>
                            {projectData.model === 'claude-sonnet-4-6' && <Check size={14} />}
                          </div>
                          
                          <div 
                            className={\`model-option \${projectData.model === 'haiku-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('haiku-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Haiku 4.8
                            </div>
                            {projectData.model === 'haiku-4.8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-haiku-4-5-20251001' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-haiku-4-5-20251001')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Haiku 4.5
                            </div>
                            {projectData.model === 'claude-haiku-4-5-20251001' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model !== 'gemini-1.5-pro' && projectData.model !== 'z-ai/glm-5.2' && !isClaudeModel(projectData.model) ? 'active' : ''}\`}
                            onClick={() => changeModel('gemini-2.5-flash')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon orange"><Sparkles size={10} /></div>
                              Gemini 2.5 Flash
                            </div>
                            {!['gemini-1.5-pro', 'z-ai/glm-5.2'].includes(projectData.model) && !isClaudeModel(projectData.model) && <Check size={14} />}
                          </div>
                        
                        <div 
                          className={\`model-option \${projectData.model === 'gemini-1.5-pro' ? 'active' : ''}\`}
                          onClick={() => changeModel('gemini-1.5-pro')}
                        >
                          <div className="model-option-left">
                            <div className="model-icon muted"><Sparkles size={10} /></div>
                            Gemini 2.5 Pro
                          </div>
                          {projectData.model === 'gemini-1.5-pro' ? <Check size={14} /> : <span className="model-badge">AGENT</span>}
                        </div>

                        <div 
                          className={\`model-option \${projectData.model === 'z-ai/glm-5.2' ? 'active' : ''}\`}
                          onClick={() => changeModel('z-ai/glm-5.2')}
                        >
                          <div className="model-option-left">
                            <div className="model-icon muted" style={{color: '#8b5cf6'}}><Sparkles size={10} /></div>
                            GLM 5.2 (z-ai)
                          </div>
                          {projectData.model === 'z-ai/glm-5.2' ? <Check size={14} /> : null}
                        </div>
                      </div>
                    )}`;

const replacementDropdown = `                    {isModelMenuOpen && (
                      <div className="model-menu-dropdown top-dropdown">
                          <div 
                            className={\`model-option \${projectData.model === 'claude-opus-4-8' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-opus-4-8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Opus 4.8
                            </div>
                            {projectData.model === 'claude-opus-4-8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-opus-4-7' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-opus-4-7')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Opus 4.7
                            </div>
                            {projectData.model === 'claude-opus-4-7' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-sonnet-4-6' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-sonnet-4-6')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Sonnet 4.6
                            </div>
                            {projectData.model === 'claude-sonnet-4-6' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model === 'claude-haiku-4-5-20251001' ? 'active' : ''}\`}
                            onClick={() => changeModel('claude-haiku-4-5-20251001')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Claude Haiku 4.5
                            </div>
                            {projectData.model === 'claude-haiku-4-5-20251001' && <Check size={14} />}
                          </div>

                        <div 
                          className={\`model-option \${projectData.model === 'z-ai/glm-5.2' ? 'active' : ''}\`}
                          onClick={() => changeModel('z-ai/glm-5.2')}
                        >
                          <div className="model-option-left">
                            <div className="model-icon muted" style={{color: '#8b5cf6'}}><Sparkles size={10} /></div>
                            GLM 5.2 (z-ai)
                          </div>
                          {projectData.model === 'z-ai/glm-5.2' && <Check size={14} />}
                        </div>
                      </div>
                    )}`;

const normalizedCode = code.replace(/\r\n/g, '\n');
const normalizedTarget = targetDropdown.replace(/\r\n/g, '\n');
const normalizedReplacement = replacementDropdown.replace(/\r\n/g, '\n');

if (normalizedCode.includes(normalizedTarget)) {
  const result = normalizedCode.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync('src/pages/Project.jsx', result, 'utf8');
  console.log('Successfully patched dropdown menu models');
} else {
  console.error('Target dropdown content not found');
}
