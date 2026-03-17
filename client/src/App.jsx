import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from './components/UI';
import RoleSignup from './components/Auth';
import ClientDashboard from './components/ClientDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setInitializing(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUser(data);
    setInitializing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (initializing) return <div style={{ background: Theme.colors.darker, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Initializing Vigilance...</div>;

  return (
    <Router>
      <div className="App" style={{ background: Theme.colors.darker, minHeight: '100vh' }}>
        {!user ? (
          <RoleSignup onSelect={setUser} />
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={user.role === 'client' ? <ClientDashboard user={user} onLogout={handleLogout} /> : <WorkerDashboard user={user} onLogout={handleLogout} />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
