import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';
import { supabase } from '../supabaseClient';

const ClientDashboard = ({ user, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [duration, setDuration] = useState("Daily");
  const [notif, setNotif] = useState(null);
  const [calling, setCalling] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [showPaymentFor, setShowPaymentFor] = useState(null);

  useEffect(() => {
    const setOnline = async () => {
      await supabase.from('profiles').update({ is_online: true }).eq('id', user.id);
    };
    setOnline();

    fetchCategories();
    fetchWorkers();
    fetchActiveJobs();
    
    // Real-time worker availability sync
    const channel = supabase
      .channel('client-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.worker' }, () => fetchWorkers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `client_id=eq.${user.id}` }, () => fetchActiveJobs())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchActiveJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, worker:profiles!worker_id(full_name, phone_number)')
      .eq('client_id', user.id)
      .in('status', ['active', 'verified_by_client'])
      .order('created_at', { ascending: false });
    if (data) setActiveJobs(data);
  };


  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) {
      setCategories(data);
      if (data.length > 0 && !selectedCategory) setSelectedCategory(data[0].name);
    }
  };

  const fetchWorkers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'worker')
      .eq('is_online', true);
    if (data) setAvailableWorkers(data);
  };

  const handleLogout = async () => {
    await supabase.from('profiles').update({ is_online: false }).eq('id', user.id);
    onLogout();
  };

  const currentCat = categories.find(c => c.name === selectedCategory) || { price_daily: 0, price_weekly: 0, price_monthly: 0 };
  const getPrice = () => {
    if (duration === "Daily") return currentCat.price_daily;
    if (duration === "Weekly") return currentCat.price_weekly;
    return currentCat.price_monthly;
  };

  const handleBooking = async () => {
    setNotif(`Broadcasting ${selectedCategory} request at KSh ${getPrice()}...`);
    const { error } = await supabase.from('jobs').insert([{
      client_id: user.id,
      category_id: currentCat.id,
      duration: duration,
      price: getPrice(),
      status: 'pending'
    }]);
    
    if (error) setNotif("Booking failed: " + error.message);
  };

  const handleDirectBooking = async (workerId, workerName) => {
    setNotif(`Requesting ${workerName} directly for KSh ${getPrice()}...`);
    const { error } = await supabase.from('jobs').insert([{
      client_id: user.id,
      category_id: currentCat.id,
      worker_id: workerId,
      duration: duration,
      price: getPrice(),
      status: 'pending'
    }]);
    
    if (error) setNotif("Booking failed: " + error.message);
    else setNotif("Direct request sent to " + workerName + "!");
  };

  const handlePayment = async (jobId) => {
    setNotif("Processing secure payment...");
    setTimeout(async () => {
      await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId);
      setShowPaymentFor(null);
      setNotif("Payment successful! Job completed.");
      fetchActiveJobs();
    }, 2000); // Simulate network request for M-Pesa
  };

  const renderPaymentPanel = () => {
    if (!showPaymentFor) return null;
    const job = activeJobs.find(j => j.id === showPaymentFor);
    if (!job) return null;
    
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
        <Card style={{ width: '90%', maxWidth: '400px', textAlign: 'center', borderTop: `4px solid ${Theme.colors.secondary}` }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Settle Payment</h2>
          <p style={{ color: Theme.colors.muted, fontSize: '0.9rem' }}>Pay your {job.duration} worker ({job.worker?.full_name})</p>
          <h1 style={{ margin: '1.5rem 0', color: Theme.colors.primary, fontSize: '2.5rem' }}>KSh {job.price.toLocaleString()}</h1>
          
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: Theme.colors.muted, marginLeft: '0.5rem' }}>M-Pesa Number</label>
            <input 
              placeholder="e.g. 07XXXXXXXX" 
              defaultValue={user.phone_number || ''} 
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${Theme.glass.border}`, color: 'white', marginTop: '0.5rem', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={() => handlePayment(job.id)} style={{ flex: 1, background: Theme.colors.secondary, color: '#000' }}>Pay Now</Button>
            <Button variant="outline" onClick={() => setShowPaymentFor(null)} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '6rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}
      {renderPaymentPanel()}

      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: Theme.glass.bg, padding: '1rem', borderRadius: '16px', border: `1px solid ${Theme.glass.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '12px', border: `2px solid ${Theme.colors.primary}` }} 
          />
          <div>
            <h4 style={{ margin: 0 }}>{user.full_name}</h4>
            <span style={{ fontSize: '0.7rem', color: Theme.colors.secondary }}>Client • Premium Member</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant="outline" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Logout</Button>
          <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '35px', borderRadius: '8px' }} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h3 style={{ marginBottom: '1.2rem' }}>Manual Service Choice</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  padding: '0.7rem 1.2rem',
                  borderRadius: '10px',
                  border: `1px solid ${selectedCategory === cat.name ? Theme.colors.primary : Theme.glass.border}`,
                  background: selectedCategory === cat.name ? Theme.colors.primary + '20' : Theme.glass.bg,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1.2rem' }}>Booking Duration</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {["Daily", "Weekly", "Monthly"].map(d => (
              <button 
                key={d} 
                onClick={() => setDuration(d)}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: `1px solid ${duration === d ? Theme.colors.secondary : Theme.glass.border}`,
                  background: duration === d ? Theme.colors.secondary + '20' : Theme.glass.bg,
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ fontWeight: 700 }}>{d}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <Card style={{ textAlign: 'center', padding: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: Theme.colors.muted }}>Standard Managed Rate</span>
          <h1 style={{ fontSize: '3rem', color: Theme.colors.primary, margin: '0.5rem 0' }}>KSh {getPrice().toLocaleString()}</h1>
          <p style={{ color: Theme.colors.secondary, fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem' }}>Official Vigilance Pricing</p>
          <Button onClick={handleBooking} style={{ padding: '1rem 3.5rem', fontSize: '1.1rem', width: '100%' }}>Request {selectedCategory} Now</Button>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Available {selectedCategory}s</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {availableWorkers.filter(w => w.expertise === selectedCategory || !w.expertise).map(worker => (
              <div key={worker.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${Theme.glass.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                  <img 
                    src={worker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.full_name}`} 
                    alt="Worker" 
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: worker.is_verified ? `2px solid ${Theme.colors.primary}` : 'none' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{worker.full_name} {worker.is_verified && <span title="Verified" style={{ color: Theme.colors.primary }}>✓</span>}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: Theme.colors.muted }}>{worker.expertise || "General Help"} • ⭐ 4.9</p>
                  </div>
                  {worker.share_location && <span style={{ fontSize: '1.2rem' }} title="Sharing Location">📍</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={`tel:${worker.phone_number || ''}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <Button variant="outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>📞 Call</Button>
                  </a>
                  <Button onClick={() => handleDirectBooking(worker.id, worker.full_name)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>⚡ Request</Button>
                </div>
              </div>
            ))}
            {availableWorkers.length === 0 && <p style={{ textAlign: 'center', color: Theme.colors.muted, fontSize: '0.8rem' }}>No workers currently available in this category.</p>}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>My Active Jobs</h3>
            <span style={{ fontSize: '0.8rem', background: Theme.colors.primary + '30', color: Theme.colors.primary, padding: '0.3rem 0.8rem', borderRadius: '12px' }}>{activeJobs.length} Ongoing</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeJobs.length === 0 ? (
              <p style={{ color: Theme.colors.muted, textAlign: 'center', padding: '2rem 0' }}>No active or pending jobs. Request a professional above to get started!</p>
            ) : activeJobs.map(job => (
              <div key={job.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${Theme.glass.border}`, display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.4rem 0' }}>{job.worker?.full_name || "Assigning Worker..."}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: Theme.colors.muted }}>
                    {job.duration} • Status: <span style={{ color: job.status === 'active' ? Theme.colors.secondary : Theme.colors.accent }}>{job.status === 'active' ? "In Progress" : "Pending Action"}</span>
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.75rem', color: Theme.colors.muted }}>Agreed Rate</p>
                    <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>KSh {job.price.toLocaleString()}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {job.worker?.phone_number && (
                      <a href={`tel:${job.worker.phone_number}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>📞 Call</Button>
                      </a>
                    )}
                    {(job.status === 'active' || job.status === 'verified_by_client') && (
                      <Button onClick={() => setShowPaymentFor(job.id)} style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem', background: Theme.colors.secondary, color: '#000' }}>Finish & Pay</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
