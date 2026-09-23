import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

const NAV_GROUPS = [
  {
    title: 'CMD',
    items: [
      { to: '/globe', icon: '🌐', label: '3D Global Command Center' },
      { to: '/alerts', icon: '⚡', label: 'Alert Center', badge: 'alerts' },
      { to: '/incidents', icon: '◈', label: 'Incidents' },
      { to: '/risk', icon: '◎', label: 'Risk Intelligence' },
    ]
  },
  {
    title: 'HAZARDS',
    items: [
      { to: '/virtual-sensors', icon: '📡', label: '⭐ Virtual Sensor Network' },
      { to: '/location', icon: '◉', label: 'Location Intelligence' },
      { to: '/rainfall', icon: '🌧️', label: 'Rainfall & Floods' },
      { to: '/cyclone', icon: '🌀', label: 'Cyclone Tracker' },
      { to: '/volcanic', icon: '🌋', label: 'Volcanic & Tectonic' },
      { to: '/earthquake', icon: '〰️', label: 'Earthquake Intelligence' },
      { to: '/landslide', icon: '⛰️', label: 'Landslide Detection' },
    ]
  },
  {
    title: 'SYSTEMS',
    items: [
      { to: '/sensor-pricing', icon: '◇', label: 'Sensor Pricing BOM' },
      { to: '/simulation', icon: '⚡', label: 'Simulation Engine' },
      { to: '/reports', icon: '📋', label: 'Intelligence Reports' },
      { to: '/forecasts', icon: '◷', label: 'Forecast Analytics' },
      { to: '/ai-copilot', icon: '✦', label: 'AI Copilot' },
      { to: '/datasets', icon: '▤', label: 'Datasets' },
      { to: '/response', icon: '◉', label: 'Response Center' },
    ]
  }
];

const BOTTOM_NAV = [
  { to: '/system', icon: '◎', label: 'System Health' },
  { to: '/audit', icon: '≡', label: 'Audit Logs' },
  { to: '/admin', icon: '⊞', label: 'Administration' },
];

function NavItem({ to, icon, label, badgeCount, expanded, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      title={label}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: expanded ? '100%' : 44,
        height: 44,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        padding: expanded ? '0 14px' : 0,
        gap: expanded ? 12 : 0,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        margin: '2px 0',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 16, position: 'relative', zIndex: 1, flexShrink: 0 }}>{icon}</span>

      {/* Label — shown when expanded (mobile drawer) */}
      {expanded && (
        <span style={{
          fontSize: 12, fontWeight: 500, color: 'inherit',
          fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </span>
      )}

      {badgeCount > 0 && (
        <span style={{
          position: 'absolute',
          top: expanded ? '50%' : 6,
          right: expanded ? 12 : 6,
          transform: expanded ? 'translateY(-50%)' : 'none',
          width: expanded ? 'auto' : 7,
          height: expanded ? 'auto' : 7,
          minWidth: expanded ? 18 : 7,
          padding: expanded ? '1px 5px' : 0,
          borderRadius: expanded ? 9 : '50%',
          background: 'var(--red)',
          boxShadow: '0 0 8px var(--red)',
          animation: 'pulse-red 2s infinite',
          fontSize: expanded ? 9 : undefined,
          color: expanded ? '#fff' : undefined,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {expanded ? badgeCount : ''}
        </span>
      )}

      {/* Tooltip — desktop icon-only mode */}
      {!expanded && hovered && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '6px 12px',
          borderRadius: 6,
          background: 'rgba(20, 24, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-cyan)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.6), 0 0 12px var(--cyan-glow)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {label}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, alerts, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    onClose?.();
  }, [location.pathname]); // eslint-disable-line

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const activeAlertCount = alerts?.filter(a => !a.resolved)?.length || 0;

  // On mobile: full expanded drawer. On desktop: icon-only column.
  // We use CSS to show/hide and switch mode.
  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="sidebar sidebar--desktop">
        <SidebarContent
          expanded={false}
          onClose={undefined}
          activeAlertCount={activeAlertCount}
          user={user}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </aside>

      {/* Mobile drawer — slides in from left */}
      <aside className={`sidebar sidebar--mobile ${isOpen ? 'sidebar--open' : ''}`}>
        <SidebarContent
          expanded={true}
          onClose={onClose}
          activeAlertCount={activeAlertCount}
          user={user}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </aside>
    </>
  );
}

function SidebarContent({ expanded, onClose, activeAlertCount, user, handleLogout, navigate }) {
  return (
    <>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: expanded ? 'space-between' : 'center',
        width: '100%', padding: expanded ? '0 14px 8px' : '0 0 8px',
        flexShrink: 0,
      }}>
        <div
          style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--cyan) 0%, var(--blue) 100%)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#000', fontSize: 16,
            fontWeight: 800, boxShadow: '0 0 18px rgba(0, 229, 255, 0.45)',
            flexShrink: 0, fontFamily: 'var(--font-headline)', cursor: 'pointer',
          }}
          onClick={() => { navigate('/globe'); onClose?.(); }}
        >
          N
        </div>
        {expanded && (
          <>
            <div style={{ flex: 1, paddingLeft: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--cyan)' }}>
                NEXUS-LAND
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                INTELLIGENCE PLATFORM
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 18, padding: 4, lineHeight: 1,
              }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </>
        )}
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border-subtle)', marginBottom: 6, flexShrink: 0 }} />

      {/* Navigation Groups */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        width: '100%', gap: 2, flex: 1, overflowY: 'auto',
        padding: expanded ? '0 8px' : '0',
        scrollbarWidth: 'none',
      }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <React.Fragment key={group.title}>
            {gIdx > 0 && (
              <div style={{
                width: expanded ? '100%' : 28, height: 1,
                background: 'rgba(255, 255, 255, 0.07)', margin: '6px 0 4px',
                alignSelf: 'center',
              }} />
            )}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--text-muted)', letterSpacing: '0.12em',
              marginBottom: 2, textAlign: expanded ? 'left' : 'center',
              padding: expanded ? '0 6px' : 0,
            }}>
              {group.title}
            </span>
            {group.items.map(({ to, icon, label, badge }) => (
              <NavItem
                key={to} to={to} icon={icon} label={label}
                badgeCount={badge === 'alerts' ? activeAlertCount : 0}
                expanded={expanded} onClose={onClose}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div style={{ height: 8, flexShrink: 0 }} />
      <div style={{ width: expanded ? '100%' : 32, height: 1, background: 'var(--border-subtle)', margin: '6px 0', flexShrink: 0, alignSelf: 'center' }} />

      {/* Bottom Nav */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        gap: 2, padding: expanded ? '0 8px' : 0, flexShrink: 0,
      }}>
        {BOTTOM_NAV.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} expanded={expanded} onClose={onClose} />
        ))}
      </div>

      {/* User / Logout */}
      <div style={{ marginTop: 8, padding: expanded ? '0 8px' : 0, width: '100%', flexShrink: 0 }}>
        <button
          className="nav-item"
          onClick={handleLogout}
          title={`Logout (${user?.email || ''})`}
          style={{
            background: 'none', border: 'none',
            width: expanded ? '100%' : 40, height: 40,
            display: 'flex', alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            cursor: 'pointer', gap: expanded ? 10 : 0,
            padding: expanded ? '0 6px' : 0, borderRadius: 8,
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#000',
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
          }}>
            {user?.full_name?.[0] || 'U'}
          </div>
          {expanded && (
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                LOGOUT
              </div>
            </div>
          )}
        </button>
      </div>
    </>
  );
}
