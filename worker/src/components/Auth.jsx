import React, { useState, useEffect } from 'react';
import { useTheme, ThemeToggle, Button, Input, Badge, Avatar, Divider } from './UI';
import { supabase } from '../supabaseClient';

const inputBase = (t) => ({
  width: '100%', padding: '0.85rem 1rem', borderRadius: 10,
  background: t.surfaceAlt, border: `1px solid ${t.border}`,
  color: t.text, outline: 'none', fontSize: '0.9rem',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
});

export default function RoleSignup({ onSelect }) {
  const { theme: t, isDark } = useTheme();
  const [mode, setMode]   = useState('login');
  const [step, setStep]   = useState(1);
  const [role, setRole]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCats] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
    nationalId: '', avatarUrl: '', expertise: '', bio: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => { if (data) setCats(data); });
  }, []);

  /* ── LOGIN ────────────────────────────────────────────────── */
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please enter email and password.'); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (e) throw e;
      const { data: profile, error: pe } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (pe) throw pe;
      if (profile.role !== 'worker') {
        await supabase.auth.signOut();
        throw new Error('This portal is for Vigilance Workers only.');
      }
      if (onSelect) onSelect(profile);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── IMAGE UPLOAD ─────────────────────────────────────────── */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImg(true); setError(null);
    try {
      const path = `public/reg_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      if (data?.publicUrl) set('avatarUrl', data.publicUrl);
    } catch (err) { setError('Image upload failed: ' + err.message); }
    finally { setUploadingImg(false); }
  };

  /* ── REGISTER ─────────────────────────────────────────────── */
  const handleRegister = async () => {
    if (!form.email || !form.password || !form.fullName || !form.phone) {
      setError('Please fill in all required fields (Name, Email, Password, Phone).'); return;
    }
    if (role === 'worker' && !form.avatarUrl) {
      setError('A profile photo is required — clients need to see who they are hiring.'); return;
    }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.fullName, role, phone: form.phone, nationalId: form.nationalId, avatarUrl: form.avatarUrl, expertise: form.expertise, bio: form.bio } },
      });
      if (e) throw e;

      if (!data.session) { setStep(5); return; } // email confirmation required

      await new Promise(r => setTimeout(r, 800));
      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email, full_name: form.fullName,
        role: 'worker', phone_number: form.phone, national_id: form.nationalId,
        avatar_url: form.avatarUrl, expertise: form.expertise, worker_bio: form.bio,
      }, { onConflict: 'id' });

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (onSelect) onSelect(profile || { id: data.user.id, role: 'worker', ...form });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── SHARED STYLES ────────────────────────────────────────── */
  const pageStyle = {
    minHeight: '100vh', background: t.bg,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
  };
  const cardStyle = {
    width: '100%', maxWidth: 440,
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 20, padding: '2rem',
    boxShadow: t.shadowLg,
  };
  const errBox = error ? (
    <div style={{ padding: '0.75rem 1rem', background: `${t.danger}18`, border: `1px solid ${t.danger}40`, borderRadius: 10, color: t.danger, fontSize: '0.83rem', marginBottom: '1rem', lineHeight: 1.5 }}>
      {error}
    </div>
  ) : null;

  /* ── VIEWS ────────────────────────────────────────────────── */
  const renderLogin = () => (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src="/src/assets/logo.jpeg" alt="Vigilance" style={{ height: 36, borderRadius: 8 }} />
          <ThemeToggle />
        </div>
        <h2 style={{ margin: '0 0 0.25rem' }}>Welcome back</h2>
        <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Sign in to your Worker Hub</p>

        {errBox}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} style={inputBase(t)} type="email" />
          <input placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} style={inputBase(t)} type="password" />
        </div>

        <Button onClick={handleLogin} disabled={loading} style={{ width: '100%', marginBottom: '1rem' }} size="lg">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
        <Divider />
        <p style={{ textAlign: 'center', color: t.textMuted, fontSize: '0.83rem', marginTop: '1rem' }}>
          Don't have an account?{' '}
          <button onClick={() => { setMode('signup'); setStep(1); setError(null); }} style={{ background: 'none', border: 'none', color: t.primary, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.83rem' }}>
            Create account
          </button>
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      /* ─ Step 1: Role select ─ */
      case 1: return (
        <div style={pageStyle}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img src="/src/assets/logo.jpeg" alt="Vigilance" style={{ height: 36, borderRadius: 8 }} />
              <ThemeToggle />
            </div>
            <h2 style={{ margin: '0 0 0.25rem' }}>Join Vigilance</h2>
            <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '1.75rem' }}>Kenya's smartest workforce platform</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => { setRole('client'); setStep(2); }} style={{
                padding: '1.1rem 1.5rem', borderRadius: 12, border: `1px solid ${t.border}`,
                background: t.surfaceAlt, color: t.text, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', transition: 'border-color 0.2s',
              }}>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '1rem' }}>🏢 Hire a Professional</p>
                <p style={{ margin: 0, color: t.textMuted, fontSize: '0.8rem' }}>Post jobs and find verified workers</p>
              </button>
              <button onClick={() => { setRole('worker'); setStep(2); }} style={{
                padding: '1.1rem 1.5rem', borderRadius: 12,
                border: `2px solid ${t.primary}`,
                background: `${t.primary}12`, color: t.text, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
              }}>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '1rem' }}>👷 Join as a Worker</p>
                <p style={{ margin: 0, color: t.textMuted, fontSize: '0.8rem' }}>Find verified jobs and get paid fast</p>
              </button>
            </div>
            <Divider style={{ margin: '1.5rem 0 1rem' }} />
            <p style={{ textAlign: 'center', color: t.textMuted, fontSize: '0.83rem' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: t.primary, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.83rem' }}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      );

      /* ─ Step 2: Basic info ─ */
      case 2: return (
        <div style={pageStyle}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
              <Badge color={role === 'worker' ? 'primary' : 'green'}>{role === 'worker' ? 'Worker Registration' : 'Client Registration'}</Badge>
              <ThemeToggle />
            </div>
            <h3 style={{ margin: '0 0 0.25rem' }}>Basic Information</h3>
            <p style={{ color: t.textMuted, fontSize: '0.82rem', marginBottom: '1.25rem' }}>Step 1 of 2</p>
            {errBox}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Full name as per ID" value={form.fullName} onChange={e => set('fullName', e.target.value)} style={inputBase(t)} />
              <input placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} type="email" style={inputBase(t)} />
              <input placeholder="Password (min 8 characters)" value={form.password} onChange={e => set('password', e.target.value)} type="password" style={inputBase(t)} />
              <input placeholder="Phone number (M-Pesa registered)" value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" style={inputBase(t)} />
            </div>
            <Button onClick={() => setStep(3)} style={{ width: '100%', marginTop: '1.25rem' }}>Next: Verification →</Button>
          </div>
        </div>
      );

      /* ─ Step 3: Identity + photo ─ */
      case 3: return (
        <div style={pageStyle}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
              <Badge color="primary">Step 2 of 2</Badge>
              <ThemeToggle />
            </div>
            <h3 style={{ margin: '0 0 0.25rem' }}>Identity Verification</h3>
            <p style={{ color: t.textMuted, fontSize: '0.82rem', marginBottom: '1.25rem' }}>Required for community safety, just like Uber.</p>
            {errBox}

            {/* Profile photo */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', color: t.text }}>
                Profile Photo {role === 'worker' && <span style={{ color: t.danger }}>* Required</span>}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${t.primary}` }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', border: `2px dashed ${role === 'worker' ? t.danger : t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: t.textSubtle, background: t.surfaceAlt }}>👤</div>
                )}
                <label htmlFor="photo-upload" style={{ cursor: uploadingImg ? 'not-allowed' : 'pointer', padding: '0.6rem 1.2rem', background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: '0.82rem', color: t.text, fontWeight: 600 }}>
                  {uploadingImg ? 'Uploading…' : form.avatarUrl ? '📷 Change' : '📷 Upload Photo'}
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                {form.avatarUrl && <span style={{ color: t.secondary, fontSize: '0.8rem' }}>✓ Ready</span>}
              </div>
            </div>

            <input placeholder="National ID / Passport Number" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} style={{ ...inputBase(t), marginBottom: '0.75rem' }} />

            {role === 'worker' && (
              <>
                <select value={form.expertise} onChange={e => set('expertise', e.target.value)} style={{ ...inputBase(t), marginBottom: '0.75rem', WebkitAppearance: 'none' }}>
                  <option value="" disabled>Select your primary expertise</option>
                  {categories.map(c => <option key={c.id} value={c.name} style={{ color: '#0f172a' }}>{c.name}</option>)}
                  <option value="Other" style={{ color: '#0f172a' }}>Other (General)</option>
                </select>
                <textarea
                  placeholder="Professional bio — tell clients what makes you great"
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  style={{ ...inputBase(t), minHeight: 90, resize: 'none', marginBottom: '0.75rem' }}
                />
              </>
            )}

            <Button onClick={handleRegister} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }} size="lg">
              {loading ? 'Creating account…' : 'Complete Registration'}
            </Button>
          </div>
        </div>
      );

      /* ─ Step 5: Email confirmation ─ */
      case 5: return (
        <div style={pageStyle}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Check Your Email</h2>
            <p style={{ color: t.textMuted, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              We sent a confirmation link to <strong style={{ color: t.text }}>{form.email}</strong>.<br />
              Click the link to activate your account, then sign in.
            </p>
            <Button onClick={() => { setMode('login'); setStep(1); setError(null); }} style={{ width: '100%' }}>Back to Sign In</Button>
          </div>
        </div>
      );
    }
  };

  return mode === 'login' ? renderLogin() : renderStep();
}
