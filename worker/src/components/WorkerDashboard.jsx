import React, { useState, useEffect, useRef } from 'react';
import { useTheme, Card, Button, Badge, Avatar, StatCard, SectionHeader, ThemeToggle, Divider } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';
import { supabase } from '../supabaseClient';

/* ── GPS HOOK ───────────────────────────────────────────────── */
function useGPS({ enabled, onUpdate }) {
  const watchId = useRef(null);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => onUpdate(pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );

    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled]);
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function WorkerDashboard({ user, onLogout }) {
  const { theme, isDark } = useTheme();
  const t = theme;

  const [categories, setCategories]       = useState([]);
  const [selectedCat, setSelectedCat]     = useState(user?.expertise || null);
  const [customJob, setCustomJob]         = useState('');
  const [onDuty, setOnDuty]               = useState(user?.is_online || false);
  const [notif, setNotif]                 = useState(null);
  const [portfolioImages, setPortfolio]   = useState(user?.portfolio_images || []);
  const [uploading, setUploading]         = useState(false);
  const [uploadingAvatar, setUploadAvatar]= useState(false);
  const [calling, setCalling]             = useState(null);
  const [isSuspended, setIsSuspended]     = useState(user?.is_suspended || false);
  const [pendingJobs, setPendingJobs]     = useState([]);
  const [earnings, setEarnings]           = useState({ total: 0, jobs: 0 });
  const [avatarUrl, setAvatarUrl]         = useState(user?.avatar_url || null);
  const [gpsCoords, setGpsCoords]         = useState(null);
  const [activeTab, setActiveTab]         = useState('dashboard'); // mobile tabs
  const [editProfile, setEditProfile]     = useState({ full_name: user?.full_name || '', phone_number: user?.phone_number || '', worker_bio: user?.worker_bio || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarRef = useRef(null);
  const lastGpsSave = useRef(0);

  const handleProfileSave = async () => {
    setSavingProfile(true); setNotif('Saving profile...');
    const { error } = await supabase.from('profiles').update(editProfile).eq('id', user.id);
    if (error) setNotif('❌ Save failed: ' + error.message);
    else { setNotif('✅ Profile updated!'); Object.assign(user, editProfile); }
    setSavingProfile(false);
  };

  /* GPS – save to DB at most every 30 s */
  useGPS({
    enabled: onDuty,
    onUpdate: async (lat, lng) => {
      setGpsCoords({ lat, lng });
      const now = Date.now();
      if (now - lastGpsSave.current > 30000) {
        lastGpsSave.current = now;
        await supabase.from('profiles').update({
          latitude: lat, longitude: lng, last_seen_at: new Date().toISOString()
        }).eq('id', user.id);
      }
    },
  });

  useEffect(() => {
    fetchCategories(); fetchPendingJobs(); fetchEarnings();

    const channel = supabase.channel('worker-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (p) => {
        if (p.new.is_suspended !== undefined) setIsSuspended(p.new.is_suspended);
        if (p.new.avatar_url) setAvatarUrl(p.new.avatar_url);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs', filter: `worker_id=eq.${user.id}` }, () => {
        setNotif('🔔 New direct request from a client!'); fetchPendingJobs();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (p) => {
        if (!p.new.worker_id) { setNotif('📢 New broadcast job nearby — check requests!'); fetchPendingJobs(); }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `worker_id=eq.${user.id}` }, () => {
        fetchPendingJobs(); fetchEarnings();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchEarnings = async () => {
    const { data } = await supabase.from('jobs').select('price').eq('worker_id', user.id).eq('status', 'completed');
    if (data) setEarnings({ total: data.reduce((s, j) => s + j.price, 0), jobs: data.length });
  };
  const fetchPendingJobs = async () => {
    const { data } = await supabase.from('jobs')
      .select('*, client:profiles!client_id(id, full_name, phone_number, avatar_url, address, national_id)')
      .eq('worker_id', user.id).eq('status', 'pending');
    if (data) setPendingJobs(data);
  };
  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleToggleDuty = async () => {
    const next = !onDuty;
    setOnDuty(next);
    const update = { is_online: next, expertise: selectedCat };
    if (!next) { update.latitude = null; update.longitude = null; }
    await supabase.from('profiles').update(update).eq('id', user.id);
    setNotif(next ? `🟢 Now live as ${selectedCat}. GPS active.` : '⚫ Off duty. Location cleared.');
  };

  const handleJobAction = async (jobId, status) => {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
    if (!error) { setNotif(status === 'active' ? '✅ Request accepted!' : 'Request declined.'); fetchPendingJobs(); }
    else setNotif('❌ ' + error.message);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadAvatar(true);
    setNotif('Uploading photo...');
    try {
      const path = `public/avatar_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file);
      if (upErr) throw upErr;
      const { data: url } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: url.publicUrl }).eq('id', user.id);
      setAvatarUrl(url.publicUrl + '?t=' + Date.now());
      setNotif('✅ Profile photo updated!');
    } catch (err) { setNotif('❌ Upload failed: ' + err.message); }
    finally { setUploadAvatar(false); }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true); setNotif(`Uploading ${files.length} image(s)...`);
    try {
      const urls = [];
      for (const f of files) {
        const path = `${user.id}/${Math.random().toString(36).slice(2)}_${Date.now()}.${f.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('portfolios').upload(path, f);
        if (error) throw error;
        const { data } = supabase.storage.from('portfolios').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const updated = [...portfolioImages, ...urls];
      await supabase.from('profiles').update({ portfolio_images: updated }).eq('id', user.id);
      setPortfolio(updated);
      setNotif('✅ Portfolio updated!');
    } catch (err) { setNotif('❌ ' + err.message); }
    finally { setUploading(false); }
  };

  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}&backgroundColor=3b82f6&textColor=ffffff`;

  /* ── RENDER ─────────────────────────────────────────────── */
  if (isSuspended) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Card style={{ maxWidth: 420, textAlign: 'center', padding: '3rem 2rem', borderColor: t.danger }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: t.danger, marginBottom: '0.75rem' }}>Account Suspended</h2>
        <p style={{ color: t.textMuted, lineHeight: 1.7 }}>Your account has been suspended by an administrator. Contact Vigilance support for assistance.</p>
        <Button onClick={onLogout} variant="danger" style={{ marginTop: '2rem', width: '100%' }}>Sign Out</Button>
      </Card>
    </div>
  );

  return (
    <div className={`app-main show-${activeTab}`} style={{ minHeight: '100vh', background: t.bg, color: t.text, paddingBottom: '5rem' }}>

      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <nav style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/src/assets/logo.jpeg" alt="Vigilance" style={{ height: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Worker Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {gpsCoords && onDuty && (
            <Badge color="green">📍 GPS Live</Badge>
          )}
          <ThemeToggle />
          <button
            onClick={() => avatarRef.current?.click()}
            style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            title="Change profile photo"
          >
            <Avatar src={avatarUrl} name={user.full_name} size={36} verified={user.is_verified} />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── PROFILE HEADER ──────────────────────────────────── */}
        <div className="section-profile">
        <Card style={{ marginBottom: '1.5rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', background: isDark ? `linear-gradient(135deg, ${t.surface} 60%, ${t.primary}15)` : t.surface }}>
          <button onClick={() => avatarRef.current?.click()} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <Avatar src={avatarUrl} name={user.full_name} size={72} verified={user.is_verified} />
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: t.primary, borderRadius: '50%', border: `2px solid ${t.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
              {uploadingAvatar ? '…' : '📷'}
            </span>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{user.full_name}</h2>
              {user.is_verified && <Badge color="primary">✓ Verified</Badge>}
            </div>
            <p style={{ margin: '0.25rem 0 0', color: t.textMuted, fontSize: '0.85rem' }}>
              {selectedCat || user.expertise || 'Vigilance Worker'} &nbsp;·&nbsp;
              <span style={{ color: onDuty ? t.secondary : t.textSubtle }}>
                <span className={`status-dot ${onDuty ? 'online' : 'offline'}`} style={{ marginRight: 4 }} />
                {onDuty ? 'On Duty' : 'Off Duty'}
              </span>
            </p>
            {user.worker_bio && <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: t.textMuted, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>{user.worker_bio}</p>}
          </div>

          <div style={{ flex: 1, minWidth: '100%' }} className="hide-desktop"></div>
          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }} className="mobile-stats-row">
            <div style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', color: t.primary }}>{earnings.jobs}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jobs</p>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', color: t.secondary }}>KSh {(earnings.total / 1000).toFixed(1)}k</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Earned</p>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', color: t.accent }}>⭐ 4.9</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onLogout} style={{ flexShrink: 0, width: '100%', marginTop: '0.5rem' }} className="mobile-logout-btn">Sign Out</Button>
        </Card>
        
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionHeader title="Account Settings" subtitle="Update your worker profile" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Email Address (Locked)</label><div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, opacity: 0.6 }}>{user.email}</div></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>National ID (Locked)</label><div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, opacity: 0.6 }}>{user.national_id || 'Not set'}</div></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Full Name</label><input value={editProfile.full_name} onChange={e => setEditProfile({...editProfile, full_name: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Phone Number</label><input value={editProfile.phone_number} onChange={e => setEditProfile({...editProfile, phone_number: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Worker Bio</label><textarea value={editProfile.worker_bio} onChange={e => setEditProfile({...editProfile, worker_bio: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: 90, resize: 'none' }} placeholder="Professional bio" /></div>
            <Button onClick={handleProfileSave} disabled={savingProfile} style={{ marginTop: '0.5rem' }}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </Card>
        </div>

        {/* ── JOB SELECTION ───────────────────────────────────── */}
        {!selectedCat ? (
          <Card className="section-dashboard" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>What service are you offering today?</h3>
            <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Select your expertise to go live and receive client requests.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {categories.map(cat => (
                <button key={cat.id} className="pill-tab" onClick={() => { setSelectedCat(cat.name); supabase.from('profiles').update({ expertise: cat.name }).eq('id', user.id); }}>
                  {cat.name}
                </button>
              ))}
            </div>
            <Divider />
            <p style={{ color: t.textMuted, fontSize: '0.85rem', margin: '1rem 0 0.75rem' }}>Or type a custom job:</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                placeholder="E.g. Painter, Tutor, Chef"
                value={customJob}
                onChange={e => setCustomJob(e.target.value)}
                style={{ padding: '0.7rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', width: 220 }}
              />
              <Button disabled={!customJob} onClick={() => { if (customJob) { setSelectedCat(customJob); supabase.from('profiles').update({ expertise: customJob }).eq('id', user.id); } }}>
                Start Custom Job
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid-worker">
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Duty Toggle */}
              <Card className="section-dashboard">
                <SectionHeader title="Duty Status" subtitle={selectedCat} right={<Button variant="ghost" size="sm" onClick={() => { setSelectedCat(null); setOnDuty(false); supabase.from('profiles').update({ is_online: false, expertise: null, latitude: null, longitude: null }).eq('id', user.id); }}>Change</Button>} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: t.surfaceAlt, borderRadius: 12, border: `1px solid ${onDuty ? t.secondary + '50' : t.border}` }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{onDuty ? '🟢 On Duty' : '⚫ Off Duty'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: t.textMuted }}>{onDuty ? 'Visible to clients · GPS active' : 'Hidden from clients'}</p>
                  </div>
                  <div className={`toggle-track ${onDuty ? 'on' : ''}`} onClick={handleToggleDuty}>
                    <div className="toggle-thumb" />
                  </div>
                </div>

                {/* GPS indicator */}
                {onDuty && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: `${t.secondary}12`, borderRadius: 10, border: `1px solid ${t.secondary}30` }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: t.secondary }}>📍 GPS Broadcasting</p>
                    {gpsCoords ? (
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: t.textMuted }}>
                        {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                      </p>
                    ) : (
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: t.textMuted }}>Acquiring signal...</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Earnings */}
              <div className="section-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <StatCard label="Total Earned" value={`KSh ${earnings.total.toLocaleString()}`} icon="💰" color="primary" />
                <StatCard label="Jobs Completed" value={earnings.jobs} icon="✅" color="green" />
              </div>

              {/* Portfolio */}
              <Card className="section-portfolio">
                <SectionHeader
                  title="Portfolio"
                  subtitle={`${portfolioImages.length} photos`}
                  right={
                    <>
                      <input type="file" id="port-upload" multiple accept="image/*" onChange={handlePortfolioUpload} style={{ display: 'none' }} />
                      <Button variant="ghost" size="sm" disabled={uploading} onClick={() => document.getElementById('port-upload').click()}>
                        {uploading ? 'Uploading…' : '+ Add'}
                      </Button>
                    </>
                  }
                />
                {portfolioImages.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {portfolioImages.slice(0, 6).map((url, i) => (
                      <div key={i} style={{ height: 75, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}` }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: t.textMuted, fontSize: '0.8rem', padding: '1rem 0' }}>No portfolio photos yet.</p>
                )}
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingJobs.length > 0 && (
                <Card className="section-requests" style={{ borderTop: `3px solid ${t.primary}` }}>
                  <SectionHeader title={`Incoming Requests`} subtitle={`${pendingJobs.length} pending`} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 420, overflowY: 'auto' }}>
                    {pendingJobs.map(job => {
                      const c = job.client || {};
                      return (
                        <div key={job.id} style={{ padding: '1rem', background: t.surfaceAlt, borderRadius: 12, border: `1px solid ${t.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                            <Avatar src={c.avatar_url} name={c.full_name} size={48} />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 700 }}>{c.full_name || 'Unknown Client'}</p>
                              {c.address && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: t.textMuted }}>📍 {c.address}</p>}
                            </div>
                            <span style={{ fontWeight: 800, color: t.secondary, fontSize: '0.95rem' }}>KSh {job.price?.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <Badge color="primary">📅 {job.duration}</Badge>
                            {c.phone_number && <a href={`tel:${c.phone_number}`} style={{ textDecoration: 'none' }}><Badge color="muted">📞 {c.phone_number}</Badge></a>}
                            {c.national_id && <Badge color="muted">🪪 {c.national_id}</Badge>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button onClick={() => handleJobAction(job.id, 'active')} size="sm" style={{ flex: 1 }}>✅ Accept</Button>
                            <Button onClick={() => handleJobAction(job.id, 'cancelled')} variant="danger" size="sm" style={{ flex: 1 }}>✕ Decline</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Radar / standby panel */}
              <Card className="section-dashboard" style={{ minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Animated radar rings */}
                {onDuty && [1,2,3].map(i => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: i * 80, height: i * 80,
                    borderRadius: '50%',
                    border: `1px solid ${t.primary}${40 - i * 10}`,
                    animation: `pulse-ring ${1.5 + i * 0.5}s ease-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                  }} />
                ))}
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {onDuty ? '📡' : '🗺️'}
                  </div>
                  <h4 style={{ margin: '0 0 0.4rem' }}>{onDuty ? 'Searching nearby clients…' : 'Go On Duty to go live'}</h4>
                  <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>
                    {onDuty ? `Broadcasting as ${selectedCat} · GPS active` : 'Toggle duty status above'}
                  </p>
                  {gpsCoords && onDuty && (
                    <a
                      href={`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8rem', color: t.primary, textDecoration: 'underline' }}
                    >
                      View on Google Maps ↗
                    </a>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────── */}
      <nav className="mobile-nav">
        {[
          { id: 'dashboard', icon: '🏠', label: 'Home' },
          { id: 'requests', icon: `🔔${pendingJobs.length > 0 ? ` (${pendingJobs.length})` : ''}`, label: 'Requests' },
          { id: 'portfolio', icon: '📁', label: 'Portfolio' },
          { id: 'profile', icon: '👤', label: 'Profile' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeTab === tab.id ? t.primary : t.textMuted,
            fontSize: '0.65rem', fontWeight: 600, fontFamily: 'inherit', padding: '0.25rem 0.5rem',
          }}>
            <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
