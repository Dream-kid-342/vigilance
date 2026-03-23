import React, { useState } from 'react';
import { Theme, Card, Button } from './UI';
import { supabase } from '../supabaseClient';

const AdminAuth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Verify that the logged-in user has the 'admin' role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // Profile row not found — the admin SQL insert hasn't been run yet
      setError(`No profile found for this account. Did you run admin_create_user.sql in Supabase? (UID: ${data.user.id})`);
      setLoading(false);
      return;
    }

    if (profile?.role !== 'admin') {
      setError(`Access denied. Your account role is "${profile.role}", not "admin".`);
      setLoading(false);
      return;
    }

    onLogin(data.user);
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${Theme.glass.border}`,
    color: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '1rem',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: Theme.colors.darker,
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: `linear-gradient(135deg, ${Theme.colors.primary}, #7c3aed)`,
            borderRadius: '20px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: `0 0 30px ${Theme.colors.primary}50`,
          }}>🛡️</div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            Vigilance Command
          </h1>
          <p style={{ color: Theme.colors.muted, margin: 0 }}>Admin Access Only</p>
        </div>

        <Card style={{ borderTop: `3px solid ${Theme.colors.primary}` }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: Theme.colors.muted, display: 'block', marginBottom: '0.5rem' }}>Admin Email</label>
              <input
                type="email"
                placeholder="admin@vigilance.app"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: Theme.colors.muted, display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                color: '#ef4444',
                fontSize: '0.85rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Sign In to Command Center'}
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', color: Theme.colors.muted, fontSize: '0.75rem', marginTop: '2rem' }}>
          🔒 This portal is protected by Supabase Auth + Row Level Security
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;
