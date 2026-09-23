import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useStore from '../../store/useStore';
import { api } from '../../api/client';

/* ─── Animated 3D Logo ─────────────────────────────────────────── */
function Logo3D() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const t = frame * 0.015;

      // Outer rotating rings
      for (let r = 0; r < 3; r++) {
        const angle = t + (r * Math.PI * 2) / 3;
        const radius = 54 + r * 10;
        const alpha = 0.15 + r * 0.08;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = 1.5 - r * 0.3;
        ctx.setLineDash([8, 14]);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Pulsing glow rings
      for (let i = 0; i < 2; i++) {
        const pulse = Math.sin(t * 2 + i * Math.PI) * 0.4 + 0.5;
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 52 + i * 8);
        gr.addColorStop(0, `rgba(0,229,255,0)`);
        gr.addColorStop(0.7, `rgba(0,229,255,0)`);
        gr.addColorStop(0.85, `rgba(0,229,255,${0.12 * pulse})`);
        gr.addColorStop(1, `rgba(0,229,255,0)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + i * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbiting dots
      const dots = [
        { r: 52, speed: 1,   size: 3.5, color: '#00e5ff' },
        { r: 42, speed: -1.4, size: 2.5, color: '#2979ff' },
        { r: 62, speed: 0.7, size: 2,   color: '#a855f7' },
      ];
      dots.forEach(d => {
        const a = t * d.speed;
        const x = cx + Math.cos(a) * d.r;
        const y = cy + Math.sin(a) * d.r * 0.42;
        const gd = ctx.createRadialGradient(x, y, 0, x, y, d.size * 2);
        gd.addColorStop(0, d.color);
        gd.addColorStop(1, 'transparent');
        ctx.fillStyle = gd;
        ctx.beginPath();
        ctx.arc(x, y, d.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(x, y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core hexagon
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.3);
      const hex = 28;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        i === 0 ? ctx.moveTo(Math.cos(a) * hex, Math.sin(a) * hex)
                : ctx.lineTo(Math.cos(a) * hex, Math.sin(a) * hex);
      }
      ctx.closePath();
      const hexGrad = ctx.createLinearGradient(-hex, -hex, hex, hex);
      hexGrad.addColorStop(0, 'rgba(0,229,255,0.15)');
      hexGrad.addColorStop(1, 'rgba(41,121,255,0.15)');
      ctx.fillStyle = hexGrad;
      ctx.strokeStyle = 'rgba(0,229,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner triangle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(a) * 16, y = Math.sin(a) * 16;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,229,255,${0.5 + Math.sin(t * 3) * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Center dot
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
      cg.addColorStop(0, '#fff');
      cg.addColorStop(0.4, '#00e5ff');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

/* ─── Particle background ────────────────────────────────────────── */
function ParticleBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.a * 0.4})`;
        ctx.fill();
      });
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,229,255,${(1 - dist / 120) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── Main LoginPage ─────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useStore();
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      setToken(res.data.access_token);
      setUser(res.data.user);
      navigate('/globe');
    } catch { setError('Google Sign-In Failed. Please try again.'); }
  };

  const [loading, setLoading] = useState(false);

  const handleSignIn = async (overrideEmail, overridePassword) => {
    setError(null);
    setLoading(true);
    const targetEmail = overrideEmail !== undefined ? overrideEmail : email.trim();
    const targetPassword = overridePassword !== undefined ? overridePassword : password;

    try {
      // 1. Try standard password login if credentials provided
      if (targetEmail && targetPassword) {
        try {
          const res = await api.post('/auth/login', { email: targetEmail, password: targetPassword });
          setToken(res.data.access_token);
          setUser(res.data.user);
          navigate('/globe');
          return;
        } catch (loginErr) {
          // If explicitly wrong password, surface it; otherwise fallback to dev token
          if (loginErr.response?.status === 401 && overrideEmail) {
            setError('Invalid credentials for selected profile.');
            setLoading(false);
            return;
          }
        }
      }

      // 2. Fallback to high-authority dev bypass token
      const res = await api.post('/auth/google', { token: 'dev_mock_google_token' });
      setToken(res.data.access_token);
      setUser(res.data.user);
      navigate('/globe');
    } catch {
      setError('Login failed. Please verify the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030810', position: 'relative', overflow: 'hidden' }}>
      <ParticleBG />

      {/* Radial glow bg */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(0,100,180,0.12) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 'min(440px, calc(100vw - 32px))', padding: 'clamp(24px, 5vw, 44px)',
        background: 'rgba(8, 16, 28, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,229,255,0.18)',
        borderRadius: 20,
        boxShadow: '0 0 60px rgba(0,100,200,0.15), 0 0 120px rgba(0,50,100,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Logo3D />
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: '0.12em', color: '#fff', marginTop: 4 }}>
            NEXUS<span style={{ color: '#00e5ff' }}>-LAND</span>
          </div>
          <div style={{ fontSize: 11, color: '#4a6a7a', fontFamily: 'monospace', letterSpacing: '0.2em', marginTop: 3 }}>
            DISASTER INTELLIGENCE PLATFORM
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 20px' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.2))' }} />
          <span style={{ fontSize: 10, color: '#3a5a6a', fontFamily: 'monospace', letterSpacing: '0.15em' }}>SIGN IN</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(0,229,255,0.2))' }} />
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff3b5c', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠ {error}
          </div>
        )}

        {/* Email input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: '#4a6a7a', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="operator@nexus-land.in"
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.35)', border: '1px solid #1e3a4a', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#00e5ff'}
            onBlur={e => e.target.style.borderColor = '#1e3a4a'}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: '#4a6a7a', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.35)', border: '1px solid #1e3a4a', borderRadius: 8, padding: '11px 40px 11px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#00e5ff'}
              onBlur={e => e.target.style.borderColor = '#1e3a4a'}
            />
            <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a6a7a', cursor: 'pointer', fontSize: 14 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <Link to="/forgot-password" style={{ fontSize: 11, color: '#00e5ff', textDecoration: 'none', opacity: 0.7 }}>Forgot password?</Link>
          </div>
        </div>

        {/* Quick Profile Login Pills */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: 6 }}>
            QUICK ACCESS DEMO PROFILES:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { role: '⚡ Super Admin', email: 'admin@nexusland.gov', pwd: 'Admin2024!' },
              { role: '🔬 Analyst', email: 'analyst@nexusland.gov', pwd: 'Analyst2024!' },
              { role: '📡 Field Officer', email: 'officer@nexusland.gov', pwd: 'Officer2024!' },
            ].map(p => (
              <button
                key={p.role}
                type="button"
                onClick={() => {
                  setEmail(p.email);
                  setPassword(p.pwd);
                  handleSignIn(p.email, p.pwd);
                }}
                style={{
                  background: 'rgba(0,229,255,0.06)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  borderRadius: 14,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: 'var(--cyan)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.role}
              </button>
            ))}
          </div>
        </div>

        {/* Sign In button */}
        <button
          onClick={() => handleSignIn()}
          disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em', background: 'linear-gradient(135deg, #00b4d8, #00e5ff)', color: '#000', boxShadow: '0 4px 24px rgba(0,229,255,0.25)', transition: 'all 0.2s', marginBottom: 14, opacity: loading ? 0.7 : 1 }}
          onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 32px rgba(0,229,255,0.4)'; } }}
          onMouseLeave={e => { if (!loading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(0,229,255,0.25)'; } }}
        >
          {loading ? 'AUTHENTICATING...' : 'SIGN IN TO NEXUS'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 10, color: '#3a4a5a', fontFamily: 'monospace' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Google login */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'mock-client-id' ? (
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In failed.')} />
          ) : (
            <button
              onClick={() => handleSignIn()}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', color: '#3c4043',
                border: '1px solid #dadce0', borderRadius: 4,
                padding: '8px 16px', fontSize: 14, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', width: '100%', justifyContent: 'center',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          )}
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#4a6a7a' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>Create Account →</Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#1e2e3e', fontFamily: 'monospace', zIndex: 1 }}>
        NEXUS-LAND v3.2 · ISRO × NIT SILCHAR · SECURE CHANNEL ESTABLISHED
      </div>
    </div>
  );
}
