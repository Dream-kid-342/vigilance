import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/supabaseClient.js';
import { Theme } from './components/UI.jsx';
import RoleSignup  from './components/Auth.jsx';
import ClientDashboard from './components/ClientDashboard.jsx';
import WorkerDashboard from './components/WorkerDashboard.jsx';
import LandingPageComponent from './components/LandingPage.jsx';

// view: 'landing' | 'auth-client' | 'auth-worker' | 'app'
export default function ClientApp({ genericAuth = false }) {
  const navigate   = useNavigate();
  const [user, setUser]           = useState(null);
  const [initializing, setInit]   = useState(true);
  const [view, setView]           = useState('auth-client'); // start straight at auth

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setInit(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) fetchProfile(session.user.id);
      else { setUser(null); setInit(false); setView('auth-client'); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setUser(data);
    setInit(false);
    setView('app');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');            // return to root landing page
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
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Client Portal…</span>
    </div>
  );

  // Authenticated
  if (user && view === 'app') {
    const dashboard = user.role === 'client'
      ? <ClientDashboard user={user} onLogout={handleLogout} />
      : <WorkerDashboard user={user} onLogout={handleLogout} />;
    return dashboard;
  }

  // Show auth (pre-selected role from what button was clicked on landing)
  return (
    <RoleSignup
      initialRole={genericAuth ? null : (view === 'auth-worker' ? 'worker' : 'client')}
      onSelect={(profile) => { setUser(profile); setView('app'); }}
      onBack={() => navigate('/')}
    />
  );
}



