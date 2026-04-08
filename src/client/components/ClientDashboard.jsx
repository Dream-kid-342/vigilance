import React, { useState, useEffect, useCallback } from 'react';
import { useTheme, Card, Button, Badge, Avatar, StatCard, SectionHeader, ThemeToggle, Divider, Input } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';
import { supabase } from '../../shared/supabaseClient.js';

/* ── WORKER PROFILE MODAL ──────────────────────────────────── */
function WorkerModal({ worker, onClose, onBook, duration, price }) {
  const { theme: t } = useTheme();
  const [completedJobs, setCompleted] = useState(null);

  useEffect(() => {
    if (!worker) return;
    supabase.from('jobs').select('id', { count: 'exact', head: true })
      .eq('worker_id', worker.id).eq('status', 'completed')
      .then(({ count }) => setCompleted(count ?? 0));
  }, [worker?.id]);

  if (!worker) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', background: t.surface, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadowLg }}>
        {/* Hero */}
        <div className="mobile-px" style={{ padding: '2rem 2rem 1.25rem', background: `linear-gradient(135deg, ${t.primary}20, ${t.secondary}10)`, borderRadius: '20px 20px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <Avatar src={worker.avatar_url} name={worker.full_name} size={80} verified={worker.is_verified} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{worker.full_name}</h2>
                {worker.is_verified && <Badge color="primary">✓ Verified</Badge>}
              </div>
              <p style={{ margin: '0.25rem 0 0', color: t.secondary, fontWeight: 600, fontSize: '0.9rem' }}>{worker.expertise || 'General Help'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem' }}>
            {[
              { label: 'Rating', value: '⭐ 4.9' },
              { label: 'Jobs Done', value: completedJobs ?? '…' },
              { label: 'Status', value: worker.is_online ? '🟢 Online' : '⚫ Offline' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="mobile-px" style={{ padding: '1.5rem 2rem 2rem' }}>
          {worker.worker_bio && (
            <>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>About</p>
              <p style={{ margin: '0 0 1.5rem', color: t.text, lineHeight: 1.7, fontSize: '0.92rem' }}>{worker.worker_bio}</p>
            </>
          )}

          {worker.portfolio_images?.length > 0 && (
            <>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Portfolio ({worker.portfolio_images.length})</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {worker.portfolio_images.map((url, i) => (
                  <div key={i} style={{ height: 90, borderRadius: 10, overflow: 'hidden', border: `1px solid ${t.border}` }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GPS Location */}
          {worker.latitude && worker.longitude && worker.is_online && (
            <div style={{ padding: '0.75rem 1rem', background: `${t.secondary}12`, borderRadius: 10, border: `1px solid ${t.secondary}30`, marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: t.secondary }}>📍 Live Location Available</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: t.textMuted }}>Last updated: {worker.last_seen_at ? new Date(worker.last_seen_at).toLocaleTimeString() : 'recently'}</p>
              <a href={`https://www.google.com/maps?q=${worker.latitude},${worker.longitude}`} target="_blank" rel="noreferrer" style={{ color: t.primary, fontSize: '0.8rem', display: 'inline-block', marginTop: '0.4rem' }}>Open on Google Maps ↗</a>
            </div>
          )}

          <div style={{ padding: '1rem', background: t.surfaceAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: t.textMuted }}>Rate for {duration}</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: t.primary }}>KSh {price?.toLocaleString()}</p>
            </div>
            <Badge color="green">Official Pricing</Badge>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href={`tel:${worker.phone_number || ''}`} style={{ flex: 1, textDecoration: 'none' }}>
              <Button variant="outline" style={{ width: '100%' }}>📞 Call</Button>
            </a>
            <Button onClick={() => { onBook(worker.id, worker.full_name); onClose(); }} style={{ flex: 1 }}>⚡ Request Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LIVE LOCATION MAP ─────────────────────────────────────── */
function LocationMap({ lat, lng, workerName }) {
  const { theme: t } = useTheme();
  if (!lat || !lng) return null;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>📍 {workerName}'s Live Location</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: t.textMuted }}>Updated in real-time while on duty</p>
        </div>
        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm">Google Maps ↗</Button>
        </a>
      </div>
      <iframe
        title="Worker Location"
        src={mapUrl}
        style={{ width: '100%', height: 220, border: 'none' }}
        loading="lazy"
      />
    </Card>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function ClientDashboard({ user, onLogout }) {
  const { theme: t, isDark } = useTheme();

  const [categories, setCategories]       = useState([]);
  const [selectedCat, setSelectedCat]     = useState(null);
  const [duration, setDuration]           = useState('Daily');
  const [notif, setNotif]                 = useState(null);
  const [calling, setCalling]             = useState(null);
  const [workers, setWorkers]             = useState([]);
  const [activeJobs, setActiveJobs]       = useState([]);
  const [showPayment, setShowPayment]     = useState(null);
  const [mpesaPhone, setMpesaPhone]       = useState(user?.phone_number || '');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [activeTab, setActiveTab]         = useState('find');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editProfile, setEditProfile]     = useState({ full_name: user?.full_name || '', phone_number: user?.phone_number || '', address: user?.address || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadAvatar]= useState(false);
  const avatarRef = React.useRef(null);

  const handleProfileSave = async () => {
    setSavingProfile(true); setNotif('Saving profile...');
    const { error } = await supabase.from('profiles').update(editProfile).eq('id', user.id);
    if (error) setNotif('❌ Save failed: ' + error.message);
    else { setNotif('✅ Profile updated!'); Object.assign(user, editProfile); }
    setSavingProfile(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadAvatar(true); setNotif('Uploading photo...');
    try {
      const path = `public/avatar_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file);
      if (upErr) throw upErr;
      const { data: url } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: url.publicUrl }).eq('id', user.id);
      user.avatar_url = url.publicUrl + '?t=' + Date.now();
      setNotif('✅ Profile photo updated!');
    } catch (err) { setNotif('❌ Upload failed: ' + err.message); }
    finally { setUploadAvatar(false); }
  };

  useEffect(() => {
    supabase.from('profiles').update({ is_online: true }).eq('id', user.id);
    fetchCategories(); fetchWorkers(); fetchActiveJobs();

    const ch = supabase.channel('client-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.worker' }, fetchWorkers)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs', filter: `client_id=eq.${user.id}` }, () => {
        setNotif('📢 Job broadcast sent! Workers nearby have been notified.'); fetchActiveJobs();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `client_id=eq.${user.id}` }, (p) => {
        if (p.new.status === 'active' && p.old?.status !== 'active') setNotif('🎉 A worker accepted and is on the way!');
        else if (p.new.status === 'completed') setNotif('✅ Job complete! Please settle payment.');
        else if (p.new.status === 'cancelled') setNotif('❌ Worker declined. Request another professional.');
        fetchActiveJobs();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.from('profiles').update({ is_online: false }).eq('id', user.id); };
  }, []);

  const checkAndAutoCompleteJobs = async (jobs) => {
    const now = new Date().getTime();
    const toComplete = [];
    
    jobs.forEach(job => {
      if (job.status === 'active') {
        const startedAt = new Date(job.updated_at || job.created_at).getTime();
        const elapsedHours = (now - startedAt) / (1000 * 60 * 60);
        
        let shouldComplete = false;
        if (job.duration === 'Daily' && elapsedHours >= 12) shouldComplete = true;
        if (job.duration === 'Weekly' && elapsedHours >= (7 * 24)) shouldComplete = true;
        if (job.duration === 'Monthly' && elapsedHours >= (30 * 24)) shouldComplete = true;
        
        if (shouldComplete) toComplete.push(job.id);
      }
    });

    if (toComplete.length > 0) {
      for (const id of toComplete) {
        await supabase.from('jobs').update({ status: 'verified_by_client' }).eq('id', id);
      }
      return toComplete;
    }
    return [];
  };

  const fetchActiveJobs = useCallback(async () => {
    const { data } = await supabase.from('jobs')
      .select('*, worker:profiles!worker_id(id, full_name, phone_number, avatar_url, latitude, longitude, last_seen_at)')
      .eq('client_id', user.id).order('created_at', { ascending: false });
    
    if (data) {
      const autoCompletedIds = await checkAndAutoCompleteJobs(data);
      if (autoCompletedIds.length > 0) {
        setActiveJobs(data.map(j => autoCompletedIds.includes(j.id) ? { ...j, status: 'verified_by_client' } : j));
      } else {
        setActiveJobs(data);
      }
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) { setCategories(data); if (data.length && !selectedCat) setSelectedCat(data[0].name); }
  }, []);

  const fetchWorkers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'worker').eq('is_online', true);
    if (data) setWorkers(data);
  }, []);

  const currentCat = categories.find(c => c.name === selectedCat) || {};
  const getPrice = () => duration === 'Daily' ? currentCat.price_daily : duration === 'Weekly' ? currentCat.price_weekly : currentCat.price_monthly;

  const handleBooking = async () => {
    const { error } = await supabase.from('jobs').insert([{ client_id: user.id, category_id: currentCat.id, duration, price: getPrice(), status: 'pending' }]);
    if (error) setNotif('❌ Booking failed: ' + error.message);
  };

  const handleDirectBooking = async (workerId, workerName) => {
    const { error } = await supabase.from('jobs').insert([{ client_id: user.id, category_id: currentCat.id, worker_id: workerId, duration, price: getPrice(), status: 'pending' }]);
    if (error) setNotif('❌ Booking failed: ' + error.message);
    else setNotif(`✅ Request sent to ${workerName}!`);
  };

  const handlePayment = async (jobId) => {
    setNotif('Initiating STK Push...');
    const job = activeJobs.find(j => j.id === jobId);
    
    try {
      const { data, error } = await supabase.functions.invoke('mpesa/stkpush', {
        body: {
          jobId: job.id,
          phone: mpesaPhone || user.phone_number,
          amount: job.price,
          accountReference: `Vigilance-${job.id.substring(0,8)}`
        }
      });

      if (error) throw new Error(error.message);
      if (data?.error || data?.errorMessage) throw new Error(data.error || data.errorMessage || 'STK Push Failed');
      
      setNotif('📲 Please enter your M-Pesa PIN on your phone.');
      
      // Auto-resolve after a UX delay (since we don't have webhook WS listeners in this demo)
      setTimeout(async () => {
        await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId);
        setShowPayment(null); setNotif('✅ Payment marked complete! Job done.'); fetchActiveJobs();
      }, 10000);

    } catch (err) {
      setNotif('❌ ' + err.message);
    }
  };

  const filteredWorkers = workers.filter(w => w.expertise === selectedCat || !w.expertise);

  return (
    <div className={`app-main show-${activeTab}`} style={{ minHeight: '100vh', background: t.bg, color: t.text, paddingBottom: '5rem' }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      <WorkerModal
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onBook={handleDirectBooking}
        duration={duration}
        price={getPrice()}
      />

      {/* Payment Modal */}
      {showPayment && (() => {
        const job = activeJobs.find(j => j.id === showPayment);
        return job ? (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <Card style={{ width: '100%', maxWidth: 400, textAlign: 'center', borderTop: `3px solid ${t.secondary}` }}>
              <div style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>💳</div>
              <h3 style={{ marginBottom: '0.25rem' }}>Settle Payment</h3>
              <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '1.25rem' }}>{job.duration} job · {job.worker?.full_name}</p>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: t.primary, marginBottom: '1.25rem' }}>KSh {job.price?.toLocaleString()}</p>
              <Input placeholder="M-Pesa number e.g. 07XXXXXXXX" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} style={{ marginBottom: '1rem', textAlign: 'center' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button onClick={() => handlePayment(job.id)} variant="secondary" style={{ flex: 1 }}>Pay Now</Button>
                <Button onClick={() => setShowPayment(null)} variant="outline" style={{ flex: 1 }}>Cancel</Button>
              </div>
            </Card>
          </div>
        ) : null;
      })()}

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <nav style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/src/assets/logo.jpeg" alt="Vigilance" style={{ height: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Client Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <Avatar src={user.avatar_url} name={user.full_name} size={36} />
          <div className="hide-mobile">
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{user.full_name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.from('profiles').update({ is_online: false }).eq('id', user.id); onLogout(); }}>Sign Out</Button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>
        
        {/* FIND / SERVICES SECTION */}
        <div className="section-find">
          {/* Stats row */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <StatCard label="Active Jobs" value={activeJobs.length} icon="⚡" color="primary" />
          <StatCard label="Online Workers" value={workers.length} icon="👷" color="green" />
          <StatCard label="Selected Service" value={selectedCat || '—'} icon="🔧" color="yellow" />
        </div>

        {/* Service + Duration selectors */}
        <div className="grid-client" style={{ marginBottom: '1.25rem' }}>
          <Card>
            <SectionHeader title="Service Category" subtitle="Choose what you need" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.map(cat => (
                <button key={cat.id} className={`pill-tab ${selectedCat === cat.name ? 'active' : ''}`} onClick={() => setSelectedCat(cat.name)}>{cat.name}</button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Duration" subtitle="Hire period" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Daily', 'Weekly', 'Monthly'].map(d => (
                <button key={d} className={`pill-tab ${duration === d ? 'active' : ''}`} style={{ borderRadius: 10, textAlign: 'left', padding: '0.6rem 1rem' }} onClick={() => setDuration(d)}>
                  {d} — <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>KSh {(d === 'Daily' ? currentCat.price_daily : d === 'Weekly' ? currentCat.price_weekly : currentCat.price_monthly)?.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Rate + Workers list */}
        <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
          <Card style={{ textAlign: 'center', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Official Vigilance Rate</p>
            <p style={{ margin: '0 0 0.5rem', fontSize: '2.8rem', fontWeight: 900, color: t.primary, lineHeight: 1 }}>KSh {getPrice()?.toLocaleString() || '—'}</p>
            <p style={{ margin: '0 0 1.5rem', color: t.secondary, fontSize: '0.82rem', fontWeight: 600 }}>Per {duration}</p>
            <Button onClick={handleBooking} size="lg" style={{ width: '100%' }}>Broadcast Request for {selectedCat}</Button>
          </Card>

          <Card>
            <SectionHeader title={`${selectedCat || 'Workers'} Online`} subtitle={`${filteredWorkers.length} available`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: 300, overflowY: 'auto' }}>
              {filteredWorkers.length === 0 && <p style={{ color: t.textMuted, fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>No workers available in this category right now.</p>}
              {filteredWorkers.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: t.surfaceAlt, borderRadius: 12 }}>
                  <Avatar src={w.avatar_url} name={w.full_name} size={44} verified={w.is_verified} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.full_name} {w.is_verified && <span style={{ color: t.primary }}>✓</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: t.textMuted }}>{w.expertise || 'General'} · ⭐ 4.9</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedWorker(w)}>Profile</Button>
                    <Button size="sm" onClick={() => handleDirectBooking(w.id, w.full_name)}>⚡</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>

        {/* ACTIVE JOBS SECTION */}
        <div className="section-active">
        {activeJobs.length > 0 ? (
          <Card style={{ marginBottom: '1.5rem' }}>
            <SectionHeader
              title="My Bookings & Active Jobs"
              right={<Badge color="primary">{activeJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length} ongoing</Badge>}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeJobs.map(job => (
                <div key={job.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: t.surfaceAlt, borderRadius: 12, flexWrap: 'wrap' }}>
                    <Avatar src={job.worker?.avatar_url} name={job.worker?.full_name || '?'} size={46} />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{job.worker?.full_name || 'Assigning worker…'}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: t.textMuted }}>
                        {job.duration} ·
                        <span style={{ color: job.status === 'active' ? t.secondary : job.status === 'verified_by_client' ? '#10b981' : job.status === 'completed' ? '#3b82f6' : t.accent }}> 
                          {job.status === 'active' ? '● In Progress' : job.status === 'verified_by_client' ? '● Awaiting Payment' : job.status === 'completed' ? '● Paid & Completed' : '● Pending'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="hide-desktop" style={{ width: '100%', height: 0 }} />

                    <div style={{ textAlign: 'left', flex: 1, minWidth: '100px' }} className="mobile-rate-box">
                      <p style={{ margin: 0, fontSize: '0.72rem', color: t.textMuted }}>Rate</p>
                      <p style={{ margin: 0, fontWeight: 800, color: t.text }}>KSh {job.price?.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, justifyContent: 'flex-end', width: 'auto' }} className="mobile-actions-box">
                      {job.worker?.phone_number && (
                        <a href={`tel:${job.worker.phone_number}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outline" size="sm">📞</Button>
                        </a>
                      )}
                      {job.status === 'verified_by_client' && (
                        <Button style={{ background: '#10b981', borderColor: '#10b981' }} size="sm" onClick={() => setShowPayment(job.id)}>💳 Pay via M-Pesa</Button>
                      )}
                      {job.status === 'active' && (
                        <Badge color="secondary">⏳ Work in Progress</Badge>
                      )}
                    </div>
                  </div>
                  {/* Live GPS Map for this worker */}
                  {job.worker?.latitude && job.worker?.longitude && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <LocationMap lat={job.worker.latitude} lng={job.worker.longitude} workerName={job.worker.full_name} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <p style={{ textAlign: 'center', color: t.textMuted, padding: '2rem' }}>No active or pending jobs right now.</p>
        )}
        </div>

        {/* PROFILE EDITOR MODAL */}
        {showProfileEditor && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="mobile-px" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', position: 'relative', background: t.bg, borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '1.5rem' }}>
              <button onClick={() => setShowProfileEditor(false)} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: t.surfaceAlt, border: 'none', color: t.text, width: 32, height: 32, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Account Settings</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                <button onClick={() => avatarRef.current?.click()} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                  <Avatar src={user.avatar_url} name={user.full_name} size={84} />
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: t.primary, borderRadius: '50%', border: `3px solid ${t.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff' }}>
                    {uploadingAvatar ? '…' : '📷'}
                  </span>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '1.1rem' }}>{user.full_name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: t.textMuted }}>Client Account</p>
                  <Button variant="outline" size="sm" onClick={async () => { await supabase.from('profiles').update({ is_online: false }).eq('id', user.id); onLogout(); }} style={{ marginTop: '0.75rem' }}>Sign Out</Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Email Address</label><div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, opacity: 0.6 }}>{user.email} 🔒</div></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>National ID</label><div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text, opacity: 0.6 }}>{user.national_id || 'Not set'} 🔒</div></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Full Name</label><Input value={editProfile.full_name} onChange={e => setEditProfile({...editProfile, full_name: e.target.value})} /></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Phone Number</label><Input value={editProfile.phone_number} onChange={e => setEditProfile({...editProfile, phone_number: e.target.value})} /></div>
                <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.3rem', display: 'block' }}>Default Address</label><Input value={editProfile.address} onChange={e => setEditProfile({...editProfile, address: e.target.value})} placeholder="E.g. CBD, Nairobi" /></div>
                <Button onClick={handleProfileSave} disabled={savingProfile} style={{ marginTop: '1rem' }}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {[
          { id: 'find', icon: '🔍', label: 'Find' },
          { id: 'active', icon: `⚡${activeJobs.length ? ` (${activeJobs.length})` : ''}`, label: 'Jobs' },
          { id: 'profile', icon: '👤', label: 'Profile', action: () => setShowProfileEditor(true) },
        ].map(tab => (
          <button key={tab.id} onClick={tab.action || (() => setActiveTab(tab.id))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', background: 'none', border: 'none', cursor: 'pointer', color: (activeTab === tab.id && tab.id !== 'profile') ? t.primary : t.textMuted, fontSize: '0.65rem', fontWeight: 600, fontFamily: 'inherit', padding: '0.25rem 0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
