import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from './components/UI';
import Auth from './components/Auth';
import WorkerDashboard from './components/WorkerDashboard';
import { supabase } from './supabaseClient'; // Ensure accurate path

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

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: Theme.colors.darker }}>
        <h2 style={{ color: Theme.colors.primary }}>Verifying Secure Connection...</h2>
      </div>
    );
  }

  // Enforce worker-only route
  const ProtectedWorkerRoute = ({ children }) => {
    if (!user) return <Navigate to="/auth" />;
    if (user.role !== 'worker') {
      // If a client logs into the worker app by mistake
      return (
        <div style={{ textAlign: 'center', padding: '4rem', background: Theme.colors.darker, color: 'white', minHeight: '100vh' }}>
          <h2>Access Denied</h2>
          <p>This portal is strictly for registered Vigilance Workers.</p>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>Sign Out</button>
        </div>
      );
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={!user ? <Auth /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedWorkerRoute>
              <WorkerDashboard user={user} onLogout={handleLogout} />
            </ProtectedWorkerRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
