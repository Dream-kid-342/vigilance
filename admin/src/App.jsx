import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './components/UI';
import { supabase } from './supabaseClient';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [categories, setCategories] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newPrices, setNewPrices] = useState({ daily: "", weekly: "", monthly: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProfiles();
    
    const catChannel = supabase.channel('categories-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .subscribe();
      
    const profileChannel = supabase.channel('profiles-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchProfiles())
      .subscribe();

    return () => {
      supabase.removeChannel(catChannel);
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  // --- Category Management ---
  const addOrUpdateCategory = async () => {
    if (newCatName && newPrices.daily) {
      if (editingId) {
        await supabase.from('categories').update({
          name: newCatName,
          price_daily: parseInt(newPrices.daily),
          price_weekly: parseInt(newPrices.weekly),
          price_monthly: parseInt(newPrices.monthly)
        }).eq('id', editingId);
      } else {
        await supabase.from('categories').insert([{
          name: newCatName,
          price_daily: parseInt(newPrices.daily),
          price_weekly: parseInt(newPrices.weekly),
          price_monthly: parseInt(newPrices.monthly)
        }]);
      }
      setEditingId(null); setNewCatName(""); setNewPrices({ daily: "", weekly: "", monthly: "" });
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this service category? This cannot be undone.")) {
      await supabase.from('categories').delete().eq('id', id);
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setNewCatName(cat.name);
    setNewPrices({ daily: cat.price_daily.toString(), weekly: cat.price_weekly.toString(), monthly: cat.price_monthly.toString() });
  };

  // --- Worker Management ---
  const updateProfileStatus = async (id, field, value) => {
    await supabase.from('profiles').update({ [field]: value }).eq('id', id);
  };

  // Render Functions
  const renderDashboard = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      <Card style={{ borderTop: `4px solid ${Theme.colors.primary}` }}>
        <h3 style={{ color: Theme.colors.muted, margin: '0 0 1rem 0' }}>Total Revenue (Est)</h3>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>KES 452,500</h1>
        <p style={{ color: '#4ade80', fontSize: '0.8rem', marginTop: '0.5rem' }}>+12% from last month</p>
      </Card>
      <Card style={{ borderTop: `4px solid ${Theme.colors.secondary}` }}>
        <h3 style={{ color: Theme.colors.muted, margin: '0 0 1rem 0' }}>Active Workers</h3>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{profiles.filter(p => p.role === 'worker' && p.is_online).length}</h1>
        <p style={{ color: Theme.colors.muted, fontSize: '0.8rem', marginTop: '0.5rem' }}>Total registered: {profiles.filter(p => p.role === 'worker').length}</p>
      </Card>
      <Card style={{ borderTop: `4px solid #a855f7` }}>
        <h3 style={{ color: Theme.colors.muted, margin: '0 0 1rem 0' }}>Active BNB Contracts</h3>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>18</h1>
        <p style={{ color: Theme.colors.muted, fontSize: '0.8rem', marginTop: '0.5rem' }}>Monthly recurring</p>
      </Card>
    </div>
  );

  const renderWorkers = () => (
    <Card>
      <h3 style={{ marginBottom: '1.5rem' }}>Workforce & Compliance Pipeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {profiles.filter(p => p.role === 'worker').map(profile => (
          <div key={profile.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: `1px solid ${profile.is_verified ? Theme.colors.primary + '40' : Theme.glass.border}` }}>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} 
                alt="Profile" 
                style={{ width: '60px', height: '60px', borderRadius: '14px', border: `2px solid ${profile.is_suspended ? '#ef4444' : profile.is_verified ? Theme.colors.primary : 'transparent'}`, objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>{profile.full_name} {profile.is_suspended && <span style={{ color: '#ef4444', fontSize: '0.7rem', padding: '0.2rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>SUSPENDED</span>}</h4>
                  <span style={{ fontSize: '0.7rem', color: Theme.colors.secondary, background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>{profile.expertise || 'General'}</span>
                </div>
                <p style={{ margin: '0.3rem 0', fontSize: '0.8rem', color: Theme.colors.muted }}>ID: {profile.national_id || 'N/A'} • {profile.phone_number}</p>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <Button variant={profile.is_verified ? "outline" : "solid"} onClick={() => updateProfileStatus(profile.id, 'is_verified', !profile.is_verified)} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>
                    {profile.is_verified ? "Revoke NITA/Verify" : "Approve NITA / Verify"}
                  </Button>
                  
                  <Button variant={profile.mou_signed ? "outline" : "solid"} onClick={() => updateProfileStatus(profile.id, 'mou_signed', !profile.mou_signed)} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderColor: '#a855f7', color: profile.mou_signed ? '#a855f7' : '#fff', backgroundColor: profile.mou_signed ? 'transparent' : '#a855f7' }}>
                    {profile.mou_signed ? "MOU Signed" : "Mark MOU Signed"}
                  </Button>
                  
                  <select 
                    value={profile.training_status || 'none'} 
                    onChange={(e) => updateProfileStatus(profile.id, 'training_status', e.target.value)}
                    style={{ ...inputStyle, width: 'auto', padding: '0.4rem', fontSize: '0.7rem' }}
                  >
                    <option value="none">No Training</option>
                    <option value="enrolled">Enrolled in Academy</option>
                    <option value="completed">Training Completed</option>
                  </select>

                  <Button variant="outline" onClick={() => updateProfileStatus(profile.id, 'is_suspended', !profile.is_suspended)} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>
                    {profile.is_suspended ? "Lift Suspension" : "Suspend Worker"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderMap = () => {
    const onlineWorkers = profiles.filter(p => p.role === 'worker' && p.is_online);
    
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Live GPS Monitoring (Status)</h3>
          <span style={{ padding: '0.4rem 1rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '20px', fontSize: '0.8rem' }}>
            {onlineWorkers.length} Workers Active Now
          </span>
        </div>
        
        <div style={{ height: '400px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Faux Map Background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
          
          {onlineWorkers.length > 0 ? (
            onlineWorkers.map((worker, i) => (
              <div key={worker.id} className="animate-float" style={{ position: 'absolute', top: `${Math.max(10, Math.min(80, 20 + (i * 17)))}%`, left: `${Math.max(10, Math.min(80, 15 + (i * 25)))}%`, textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', margin: '0 auto', boxShadow: '0 0 10px #4ade80' }}></div>
                <div style={{ background: 'rgba(0,0,0,0.7)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>
                  {worker.full_name} ({worker.expertise})
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: Theme.colors.muted, zIndex: 1 }}>No workers currently on duty.</p>
          )}
        </div>
      </Card>
    );
  };

  const renderServices = () => (
    <Card>
      <h3 style={{ marginBottom: '1.5rem' }}>Service Pricing Manager</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <input placeholder="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={inputStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          <input placeholder="Daily" value={newPrices.daily} onChange={(e)=>setNewPrices({...newPrices, daily: e.target.value})} style={inputStyle} />
          <input placeholder="Weekly" value={newPrices.weekly} onChange={(e)=>setNewPrices({...newPrices, weekly: e.target.value})} style={inputStyle} />
          <input placeholder="Monthly" value={newPrices.monthly} onChange={(e)=>setNewPrices({...newPrices, monthly: e.target.value})} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={addOrUpdateCategory} style={{ flex: 1 }}>
            {editingId ? "Update Rates" : "Broadcast New Service"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={() => { setEditingId(null); setNewCatName(""); setNewPrices({ daily: "", weekly: "", monthly: "" }); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: Theme.colors.muted }}>Active Categories</h4>
        {categories.map(cat => (
          <div key={cat.id} style={{ padding: '1rem', background: Theme.glass.bg, borderRadius: '12px', border: `1px solid ${editingId === cat.id ? Theme.colors.primary : Theme.glass.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>{cat.name}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" onClick={() => startEditing(cat)} style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', border: `1px solid ${Theme.colors.primary}`, color: Theme.colors.primary }}>
                  EDIT
                </Button>
                <Button variant="outline" onClick={() => deleteCategory(cat.id)} style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', border: '1px solid #ef4444', color: '#ef4444' }}>
                  DELETE
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: Theme.colors.muted }}>
              <span>D: KSh {cat.price_daily}</span>
              <span>W: KSh {cat.price_weekly}</span>
              <span>M: KSh {cat.price_monthly}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem' }}>Vigilance Command Center</h1>
          <p style={{ color: Theme.colors.muted, fontSize: '0.9rem' }}>Global Verification & Standardization</p>
        </div>
        <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '45px', borderRadius: '10px' }} />
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Button variant={activeTab === 'dashboard' ? 'solid' : 'outline'} onClick={() => setActiveTab('dashboard')}>Overview</Button>
        <Button variant={activeTab === 'workers' ? 'solid' : 'outline'} onClick={() => setActiveTab('workers')}>Workforce Compliance</Button>
        <Button variant={activeTab === 'map' ? 'solid' : 'outline'} onClick={() => setActiveTab('map')}>Live GPS Radar</Button>
        <Button variant={activeTab === 'services' ? 'solid' : 'outline'} onClick={() => setActiveTab('services')}>Pricing Manager</Button>
      </div>

      <div style={{ paddingBottom: '3rem' }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'workers' && renderWorkers()}
        {activeTab === 'map' && renderMap()}
        {activeTab === 'services' && renderServices()}
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '0.8rem',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${Theme.glass.border}`,
  color: 'white',
  width: '100%',
  outline: 'none'
};

export default App;
