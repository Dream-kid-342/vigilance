import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/supabaseClient.js';
import { Theme } from './components/UI.jsx';
import Auth from './components/Auth.jsx';
import WorkerDashboard from './components/WorkerDashboard.jsx';

export default function WorkerApp() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [initializing, setInit] = useState(true);
  const [authed, setAuthed]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setInit(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) fetchProfile(session.user.id);
      else { setUser(null); setInit(false); setAuthed(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setUser(data);
    setInit(false);
    setAuthed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');            // back to root landing page
  };

  if (initializing) return (
    <div style={{
      background: Theme.colors.darker, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
      }}>🛡️</div>
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Verifying Secure Connection…</span>
    </div>
  );

  // Authenticated worker dashboard
  if (authed && user) {
    if (user.role !== 'worker') {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', background: Theme.colors.darker, color: 'white', minHeight: '100vh' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2>Access Denied</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>This portal is for registered Vigilance Workers only.</p>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.65rem 1.5rem', marginTop: '1.5rem', cursor: 'pointer',
              background: '#3b82f6', color: '#fff', border: 'none',
              borderRadius: 10, fontWeight: 600, fontFamily: 'inherit',
            }}
          >Sign Out</button>
        </div>
      );
    }
    return <WorkerDashboard user={user} onLogout={handleLogout} />;
  }

  // Worker auth screen
  return (
    <Auth
      initialRole="worker"
      onSelect={(profile) => { setUser(profile); setAuthed(true); }}
      onBack={() => navigate('/')}
    />
  );
}



