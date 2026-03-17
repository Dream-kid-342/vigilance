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

  useEffect(() => {
    fetchCategories();
    fetchWorkers();
    
    // Real-time worker availability sync
    const channel = supabase
      .channel('client-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.worker' }, () => fetchWorkers())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

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

  return (
    <div style={{ padding: '1rem', paddingBottom: '6rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

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
          <Button variant="outline" onClick={onLogout} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>Logout</Button>
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
          <h3 style={{ marginBottom: '1rem' }}>Nearby Verified {selectedCategory}s</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {availableWorkers.filter(w => w.expertise === selectedCategory || !w.expertise).map(worker => (
              <div key={worker.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${Theme.glass.border}` }}>
                <img 
                  src={worker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.full_name}`} 
                  alt="Worker" 
                  style={{ width: '45px', height: '45px', borderRadius: '10px' }} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{worker.full_name} {worker.is_verified && <span title="Verified" style={{ color: Theme.colors.primary }}>v</span>}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: Theme.colors.muted }}>{worker.expertise || "General Help"}</p>
                </div>
                {worker.share_location && <span style={{ fontSize: '1rem' }}>📍</span>}
              </div>
            ))}
            {availableWorkers.length === 0 && <p style={{ textAlign: 'center', color: Theme.colors.muted, fontSize: '0.8rem' }}>No workers currently sharing location in this category.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
