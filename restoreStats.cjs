const fs = require('fs');
let jsx = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const statsGridHTML = `
            {/* STATS GRID */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statPlugins}</span>
                  <FileCode size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{totalSystemProjects}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statUsers}</span>
                  <Users size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{activeUsersCount}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statCredits}</span>
                  <Wallet size={14} className="dash-stat-icon" />
                </div>
                {(() => {
                  const spent = parseFloat(usedCredits || '0');
                  const total = parseFloat(balance || '0');
                  const remaining = Math.max(total - spent, 0);
                  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                  return (
                    <>
                      <span className="dash-stat-value" title={\`\${D.statSpent} $\${spent.toFixed(2)} / $\${total.toFixed(2)}\`}>
                        \${spent.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ \${total.toFixed(2)}</span>
                      </span>
                      <div className="dash-stat-progress-bg">
                        <div className="dash-stat-progress-bar" style={{ width: \`\${pct}%\` }} />
                      </div>
                      <span className="dash-stat-sub" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{D.statRemaining} \${remaining.toFixed(2)}</span>
                    </>
                  );
                })()}
              </div>
            </div>
`;

jsx = jsx.replace('{/* PROJECTS SECTION */}', statsGridHTML + '\n            {/* PROJECTS SECTION */}');

fs.writeFileSync('src/pages/Dashboard.jsx', jsx);
