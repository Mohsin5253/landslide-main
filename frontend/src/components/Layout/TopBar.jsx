import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { getSummary } from '../../api/client';

export default function TopBar({ onMenuClick }) {
  const { user, alerts } = useStore();
  const [time, setTime] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [, setSimState] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus_theme') || 'obsidian');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('nexus_theme', newTheme);
    if (newTheme === 'obsidian') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme') || 'obsidian';
    if (savedTheme !== 'obsidian') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleSimChange = () => setSimState(s => s + 1);
    window.addEventListener('nexus_sim_changed', handleSimChange);
    window.addEventListener('focus', handleSimChange);
    return () => {
      window.removeEventListener('nexus_sim_changed', handleSimChange);
      window.removeEventListener('focus', handleSimChange);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    getSummary().then(r => setSummary(r.data)).catch(() => {});
    return () => clearInterval(tick);
  }, []);

  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const isSim = localStorage.getItem('nexus_sim_mode') === 'true';

  return (
    <header className="top-bar">
      {/* Hamburger — mobile only */}
      <button
        className="topbar-hamburger"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Brand */}
      <div className="topbar-brand">
        <div style={{
          width: 28, height: 28, background: 'var(--cyan)', borderRadius: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#000', fontFamily: 'var(--font-headline)',
          boxShadow: '0 0 12px rgba(0,229,255,0.3)', flexShrink: 0,
        }}>N</div>
        <div className="topbar-brand-text">
          <span style={{
            fontFamily: 'var(--font-headline)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', color: 'var(--cyan)', textTransform: 'uppercase',
          }}>LANDSense</span>
          <span className="topbar-subtitle" style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 8,
          }}>Disaster Intelligence</span>
        </div>
      </div>

      {/* Center Status — hidden on mobile */}
      <div className="topbar-status">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 4,
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ fontSize: 8, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
            SYSTEM NOMINAL
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 4,
          background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)',
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)',
            animation: 'pulse-cyan 3s infinite',
          }} />
          <span style={{ fontSize: 8, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
            AI MONITORING
          </span>
        </div>

        {summary && (
          <>
            <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>INCIDENTS</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: summary.critical_incidents > 0 ? 'var(--red)' : 'var(--text-primary)',
              }}>{summary.total_incidents}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>SENSORS</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>
                {summary.sensors_online}/{summary.sensors_total}
              </span>
            </div>
            {summary.critical_incidents > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 4,
                background: 'var(--red-muted)', border: '1px solid rgba(255,59,92,0.3)',
                animation: 'pulse-red 2s infinite',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />
                <span style={{ fontSize: 8, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {summary.critical_incidents} CRITICAL
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Sim Toggle — hidden on mobile */}
        <button
          className="topbar-sim-btn"
          onClick={() => {
            const sim = localStorage.getItem('nexus_sim_mode') === 'true';
            localStorage.setItem('nexus_sim_mode', (!sim).toString());
            window.dispatchEvent(new Event('nexus_sim_changed'));
          }}
          style={{
            background: isSim ? 'rgba(255,59,92,0.2)' : 'rgba(255,255,255,0.05)',
            border: isSim ? '1px solid var(--red)' : '1px solid var(--border-subtle)',
            color: isSim ? 'var(--red)' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-mono)',
            padding: '4px 10px', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}
          title="Toggle Simulation Mode"
        >
          <span>⚡</span>
          <span>{isSim ? 'SIM ON' : 'SIM'}</span>
        </button>

        {/* Alerts Bell */}
        <button className="btn-ghost btn-icon" style={{ position: 'relative' }}>
          <span style={{ fontSize: 15 }}>🔔</span>
          {activeAlerts > 0 && (
            <span style={{
              position: 'absolute', top: 3, right: 3,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--red)', border: '2px solid var(--bg-panel)',
              animation: 'pulse-red 2s infinite',
            }} />
          )}
        </button>

        {/* Theme Switcher — hidden on mobile */}
        <div className="topbar-themes" style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6, padding: 2,
        }}>
          {[
            { id: 'obsidian', label: '🌌', title: 'Obsidian' },
            { id: 'navy',     label: '🛡️', title: 'Navy' },
            { id: 'emerald',  label: '🌿', title: 'Emerald' },
          ].map(t => {
            const isSel = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                title={t.title}
                style={{
                  background: isSel ? 'var(--cyan)' : 'transparent',
                  color: isSel ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: 4, padding: '3px 7px',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  fontWeight: isSel ? 700 : 500, cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSel ? '0 0 10px var(--cyan-muted)' : 'none',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* UTC Clock — hidden on mobile */}
        <div className="topbar-clock" style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
            color: 'var(--cyan)', letterSpacing: '0.04em',
          }}>
            {time.toUTCString().slice(17, 25)} UTC
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)',
            letterSpacing: '0.08em',
          }}>
            {time.toUTCString().slice(0, 16)}
          </div>
        </div>

        {/* User Avatar */}
        {user && (
          <div className="topbar-user" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 10px 4px 4px', borderRadius: 6,
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#000',
            }}>
              {user.full_name?.[0] || 'U'}
            </div>
            <div className="topbar-user-info">
              <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{user.full_name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--cyan)', letterSpacing: '0.08em' }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
