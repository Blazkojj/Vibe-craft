const fs = require('fs');

const file = 'src/pages/Project.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the return statement
const returnIndex = content.lastIndexOf('return (');
if (returnIndex === -1) {
  console.error("Could not find main return");
  process.exit(1);
}

// We will reconstruct the layout using Tailwind classes
const newLayout = `return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden selection:bg-zinc-800">
      
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="hidden md:flex w-72 flex-col border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl z-20">
        <div className="p-4 border-b border-zinc-800/50 flex-shrink-0">
          <button 
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors w-full"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16}/>
            {isEN ? 'Projects' : 'Projekty'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Twoje projekty</div>
          {projectsList.map(p => (
            <div
              key={p.id}
              className={\`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 \${p.id === id ? 'bg-zinc-800/80 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'}\`}
              onClick={() => navigate(\`/project/\${p.id}\`)}
              title={p.title}
            >
              <div className={\`w-1.5 h-1.5 rounded-full transition-colors \${p.id === id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-zinc-700 group-hover:bg-zinc-500'}\`}/>
              <span className="text-sm font-medium truncate flex-1">{p.title}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 flex-shrink-0">
          <button 
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all text-left group"
            onClick={() => navigate('/ustawienia')}
          >
            {currentUser?.user_metadata?.discord_profile?.avatar ? (
              <img src={currentUser.user_metadata.discord_profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-zinc-700 transition-all"/>
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm ring-2 ring-zinc-800">
                {(currentUser?.user_metadata?.discord_profile?.global_name || currentUser?.user_metadata?.username || currentUser?.email || 'B').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                {currentUser?.user_metadata?.discord_profile?.global_name || currentUser?.user_metadata?.discord_profile?.username || currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Konto'}
              </span>
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{userProfile?.plan || 'Free'}</span>
            </div>
            <SettingsIcon size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:rotate-45 duration-300"/>
          </button>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Wallet size={14} className="text-indigo-400"/>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex-1">{isEN ? 'Spent' : 'Wydano'}</span>
            <span className="text-sm font-mono font-bold text-indigo-300">
              \${parseFloat(userProfile?.used_credits_uncached || userProfile?.used_credits || '0').toFixed(2)} / \${parseFloat(userProfile?.balance || '0').toFixed(2)}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-zinc-950">
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h1 className="text-base font-semibold text-zinc-100 truncate">{projectData.title}</h1>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
            
            <div className="relative" ref={modelMenuRef}>
              <button
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-lg transition-all text-xs font-medium text-zinc-300"
                onClick={() => setIsModelMenuOpen(v => !v)}
              >
                <div className={\`flex items-center justify-center w-5 h-5 rounded-md \${projectData.model?.startsWith('claude') ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}\`}>
                  <ModelIcon modelId={projectData.model} size={12}/>
                </div>
                {getModelDisplayName(projectData.model)}
                <ChevronDown size={14} className="text-zinc-500 ml-1"/>
              </button>
              {isModelMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 z-50">
                  <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model AI</div>
                  <div className="flex flex-col gap-0.5">
                  {MODELS_LIST.map(m => (
                    <button
                      key={m.id}
                      className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left \${projectData.model === m.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}\`}
                      onClick={() => changeModel(m.id)}
                    >
                      <div className={\`flex items-center justify-center w-6 h-6 rounded-md \${m.id.startsWith('claude') ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}\`}>
                        <ModelIcon modelId={m.id} size={14}/>
                      </div>
                      {m.label}
                    </button>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/30 transition-all flex-shrink-0"
            onClick={handleClearChat} 
            title={isEN ? "Clear history" : "Wyczyść historię"}
          >
            <Trash2 size={14}/>
          </button>
        </header>

        {/* CHAT MESSAGES AREA */}
        <div 
          className="flex-1 overflow-y-auto scroll-smooth"
          ref={chatContainerRef}
        >
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 pb-40 flex flex-col gap-8 min-h-full">
            
            {messages.length === 0 && !isGenerating && (
              <div className="m-auto flex flex-col items-center justify-center text-center max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-2xl \${projectData.model?.startsWith('claude') ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-orange-500/10' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-indigo-500/10'}\`}>
                  <ModelIcon modelId={projectData.model} size={32}/>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-white">{isEN ? "Welcome to" : "Witaj w projekcie"} <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-200 to-zinc-500">{projectData.title}</span></h2>
                  <p className="text-zinc-400 text-base leading-relaxed max-w-md mx-auto">
                    {isEN ? "Describe below what you want to create or change. AI will generate production-ready code." : "Opisz w pasku poniżej, co chcesz zbudować lub zmienić. AI wygeneruje gotowy do produkcji kod."}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 hover:text-white rounded-full transition-all duration-300 hover:scale-[1.02]" onClick={() => setChatInput('Dodaj komendę /heal leczącą gracza do pełna z dźwiękiem LEVEL_UP')}>
                    <Lightbulb size={14} className="text-amber-400"/> Komenda /heal
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 hover:text-white rounded-full transition-all duration-300 hover:scale-[1.02]" onClick={() => setChatInput('Stwórz system skrzynek losujących (crates) z animacją otwarcia')}>
                    <Wrench size={14} className="text-cyan-400"/> System skrzynek
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 hover:text-white rounded-full transition-all duration-300 hover:scale-[1.02]" onClick={() => setChatInput('Dodaj panel GUI z 27 slotami przypisanymi do komendy /menu')}>
                    <Package size={14} className="text-emerald-400"/> Panel GUI
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'You';
              return (
                <div key={msg.id} className={\`flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300 \${isUser ? 'justify-end' : 'justify-start'}\`}>
                  
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="flex-shrink-0 mr-4 mt-1 hidden sm:block">
                      <div className={\`w-8 h-8 rounded-lg flex items-center justify-center border \${projectData.model?.startsWith('claude') ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}\`}>
                        <ModelIcon modelId={projectData.model} size={16}/>
                      </div>
                    </div>
                  )}

                  <div className={\`flex flex-col max-w-[90%] sm:max-w-[85%] \${isUser ? 'items-end' : 'items-start'}\`}>
                    
                    {/* Username header */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-sm font-semibold text-zinc-300">
                        {isUser ? (isEN ? 'You' : 'Ty') : getModelDisplayName(projectData.model)}
                      </span>
                      <span className="text-xs font-mono text-zinc-600">{msg.time}</span>
                    </div>

                    {/* Message body */}
                    <div className={\`relative \${isUser ? 'bg-zinc-800 text-zinc-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm border border-zinc-700/50' : 'text-zinc-300 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:p-0'}\`}>
                      {renderMessageContent(msg.text, msg.isStreaming, idx)}
                      {msg.isStreaming && msg.text && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-zinc-400 animate-pulse"/>}
                    </div>

                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="flex-shrink-0 ml-4 mt-1 hidden sm:block">
                      {currentUser?.user_metadata?.discord_profile?.avatar ? (
                        <img src={currentUser.user_metadata.discord_profile.avatar} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"/>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm ring-1 ring-zinc-700">
                          {(currentUser?.user_metadata?.discord_profile?.global_name || currentUser?.user_metadata?.username || currentUser?.email || 'B').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}

            {/* Generating Indicator */}
            {isGenerating && messages.length > 0 && !messages[messages.length-1]?.isStreaming && (
              <div className="flex w-full justify-start animate-in fade-in">
                <div className="flex-shrink-0 mr-4 mt-1 hidden sm:block">
                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center border \${projectData.model?.startsWith('claude') ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}\`}>
                    <ModelIcon modelId={projectData.model} size={16}/>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-sm font-semibold text-zinc-300">{getModelDisplayName(projectData.model)}</span>
                  </div>
                  <div className="flex gap-1 items-center h-8 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-12 pb-6 px-4 pointer-events-none z-10">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            <div className="relative flex items-end bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-700 transition-shadow">
              <textarea
                className="w-full max-h-60 bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 py-4 pl-5 pr-14 resize-none focus:outline-none focus:ring-0 leading-relaxed"
                placeholder={isGenerating ? (isEN ? "Typing..." : "Pisze...") : (isEN ? "Ask anything..." : "Napisz co chcesz stworzyć...")}
                value={chatInput}
                disabled={isGenerating}
                onChange={e => {
                  setChatInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 240) + 'px';
                }}
                onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!isGenerating) handleSend(); }}}
                rows={1}
                style={{ minHeight: '56px' }}
              />
              
              <div className="absolute right-2 bottom-2">
                {isGenerating ? (
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    onClick={stopGenerating} 
                    aria-label="Stop"
                  >
                    <div className="w-3 h-3 bg-current rounded-sm"/>
                  </button>
                ) : (
                  <button 
                    className={\`w-10 h-10 flex items-center justify-center rounded-xl transition-all \${!chatInput.trim() ? 'bg-zinc-800 text-zinc-600' : 'bg-white text-black hover:bg-zinc-200 hover:scale-105'}\`}
                    onClick={handleSend} 
                    disabled={!chatInput.trim()} 
                    aria-label="Wyślij"
                  >
                    <Send size={18} className={\`\${!chatInput.trim() ? '' : 'translate-x-[1px] translate-y-[-1px]'}\`}/>
                  </button>
                )}
              </div>
            </div>
            
            {/* BUILD BAR */}
            <div className="mt-3 flex items-center justify-between px-2">
              <div className="text-xs font-mono text-zinc-500 flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5"><kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm text-zinc-400">Enter</kbd> {isEN ? 'send' : 'wyślij'}</span>
                <span className="hidden sm:inline-flex items-center gap-1.5"><kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm text-zinc-400">Shift</kbd> + <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm text-zinc-400">Enter</kbd> {isEN ? 'new line' : 'nowa linia'}</span>
                <div className="w-1 h-1 bg-zinc-700 rounded-full hidden sm:block"></div>
                <span className="text-zinc-500 font-medium">MC {projectData.version}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500 font-medium">{projectData.engine}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {buildError && (
                  <button className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors" onClick={handleAutoFix}>
                    <Wrench size={12}/> {isEN ? 'Auto-Fix Error' : 'Napraw błąd automatycznie'}
                  </button>
                )}
                <div className={\`flex items-center gap-2 text-xs font-mono \${buildError?'text-red-400':buildStatus==='Zakończono sukcesem!'?'text-green-400':isBuilding?'text-indigo-400':'text-zinc-500'}\`}>
                  {isBuilding && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>}
                  <span className="max-w-[150px] truncate hidden sm:block">
                    {buildError ? 'Build failed' : buildStatus==='Zakończono sukcesem!' ? 'Success' : isBuilding ? buildStatus : 'Ready'}
                  </span>
                </div>
                <button 
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all \${isBuilding ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'}\`}
                  onClick={handleBuild} 
                  disabled={isBuilding}
                >
                  {isBuilding ? (isEN ? 'Compiling...' : 'Kompilowanie...') : (isEN ? 'Build JAR' : 'Buduj JAR')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Project;
`;

content = content.slice(0, returnIndex) + newLayout;
fs.writeFileSync(file, content);
console.log("Successfully replaced Layout!");
