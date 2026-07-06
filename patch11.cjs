const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

const targetDropdown = `                          <div 
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
                            className={\`model-option \${projectData.model !== 'gemini-1.5-pro' && projectData.model !== 'z-ai/glm-5.2' && !['opus-4.8','sonnet-4.8','haiku-4.8'].includes(projectData.model) ? 'active' : ''}\`}

                          onClick={() => changeModel('gemini-2.5-flash')}
                        >
                          <div className="model-option-left">
                            <div className="model-icon orange"><Sparkles size={10} /></div>
                            Gemini 2.5 Flash
                          </div>
                          {projectData.model !== 'gemini-1.5-pro' && projectData.model !== 'z-ai/glm-5.2' && <Check size={14} />}
                        </div>`;

const replacementDropdown = `                          <div 
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
                          </div>`;

// Normalize line endings to LF before match
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
