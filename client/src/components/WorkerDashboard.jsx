import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';
import { supabase } from '../supabaseClient';

const WorkerDashboard = ({ user, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [onDuty, setOnDuty] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [durationPref, setDurationPref] = useState("Daily");
  const [notif, setNotif] = useState(null);
  const [calling, setCalling] = useState(null);

  useEffect(() => {
    fetchCategories();
    
    // Subscribe to new specific job leads
    const channel = supabase
      .channel('worker-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs', filter: 'status=eq.pending' }, () => {
        setNotif("New service request matches your expertise!");
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const handleToggleDuty = async () => {
    const nextState = !onDuty;
    setOnDuty(nextState);
    
    await supabase.from('profiles').update({ 
      is_online: nextState, 
      expertise: selectedCategory,
      duration_preference: durationPref
    }).eq('id', user.id);

    if (nextState) setNotif("You are now live! Clients can see your profile image and verification status.");
  };

  const handleToggleLocation = async () => {
    const nextState = !shareLocation;
    setShareLocation(nextState);
    await supabase.from('profiles').update({ share_location: nextState }).eq('id', user.id);
  };

  return (
    <div style={{ padding: '1rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: Theme.glass.bg, padding: '1rem', borderRadius: '16px', border: `1px solid ${Theme.glass.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '12px', border: `2px solid ${Theme.colors.secondary}` }} 
          />
          <div>
            <h4 style={{ margin: 0 }}>{user.full_name} {user.is_verified && <span style={{ color: Theme.colors.primary }}>Verified</span>}</h4>
            <span style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>Vigilance Pro • {user.expertise || "Onboarding"}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant="outline" onClick={onLogout} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>Logout</Button>
          <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '35px', borderRadius: '8px' }} />
        </div>
      </header>

      {!selectedCategory ? (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Which expertise are you utilizing today?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {categories.map(cat => (
              <Button key={cat.id} variant="outline" onClick={() => setSelectedCategory(cat.name)} style={{ minWidth: '150px' }}>
                {cat.name}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ marginBottom: '1.5rem' }}>Gig Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preferred Duration</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {["Daily", "Weekly", "Monthly"].map(d => (
                      <button key={d} onClick={() => setDurationPref(d)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: durationPref === d ? Theme.colors.primary + '30' : 'transparent', border: `1px solid ${durationPref === d ? Theme.colors.primary : Theme.glass.border}`, color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>{d}</button>
                    ))}
                  </div>
               </div>

               <div onClick={handleToggleDuty} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: onDuty ? Theme.colors.primary + '10' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${onDuty ? Theme.colors.primary : 'transparent'}`, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active for Duty</p>
                    <p style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>{onDuty ? "Clients can see your profile" : "Offline"}</p>
                  </div>
                  <div style={{ width: '40px', height: '22px', background: onDuty ? Theme.colors.primary : '#334155', borderRadius: '11px', position: 'relative' }}>
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: onDuty ? '21px' : '3px', top: '3px', transition: '0.3s' }}></div>
                  </div>
               </div>

               {onDuty && (
                 <div onClick={handleToggleLocation} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: shareLocation ? Theme.colors.secondary + '10' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${shareLocation ? Theme.colors.secondary : 'transparent'}`, cursor: 'pointer' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Share Location</p>
                      <p style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>GPS Signal: {shareLocation ? "On" : "Private"}</p>
                    </div>
                    <div style={{ width: '40px', height: '22px', background: shareLocation ? Theme.colors.secondary : '#334155', borderRadius: '11px', position: 'relative' }}>
                      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: shareLocation ? '21px' : '3px', top: '3px', transition: '0.3s' }}></div>
                    </div>
                 </div>
               )}
            </div>
          </Card>

          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <div>
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} 
                  alt="Verified" 
                  style={{ width: '120px', height: '120px', borderRadius: '25px', marginBottom: '1.5rem', border: `4px solid ${onDuty ? Theme.colors.primary : 'transparent'}` }} 
                />
                <h3>{onDuty ? "Awaiting Connections" : "Hub Offline"}</h3>
                <p style={{ color: Theme.colors.muted, maxWidth: '300px', margin: '1rem auto' }}>
                  {onDuty 
                    ? "Your profile is verified and active. Maintain high performance to stay at the top of client search results." 
                    : "Go online to start receiving standardized job offers directly from clients."}
                </p>
                {onDuty && <Button onClick={() => setCalling("Premium Client")}>Simulate Callback</Button>}
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
