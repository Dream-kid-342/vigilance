import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';
import { supabase } from '../supabaseClient';

const WorkerDashboard = ({ user, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(user?.expertise || null);
  const [customJobInput, setCustomJobInput] = useState("");
  const [onDuty, setOnDuty] = useState(user?.is_online || false);
  const [notif, setNotif] = useState(null);
  const [portfolioImages, setPortfolioImages] = useState(user?.portfolio_images || []);
  const [uploading, setUploading] = useState(false);
  const [calling, setCalling] = useState(null);

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel('worker-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleToggleDuty = async () => {
    const newStatus = !onDuty;
    setOnDuty(newStatus);
    
    // Update profile in DB
    await supabase.from('profiles').update({ 
      is_online: newStatus,
      expertise: selectedCategory 
    }).eq('id', user.id);

    if (newStatus && selectedCategory) {
      setNotif(`You are now live as a ${selectedCategory}! Waiting for nearby clients...`);
    } else {
      setNotif("You are now off duty. Location hidden.");
    }
  };

  const handleJobSelect = async (job) => {
    setSelectedCategory(job);
    await supabase.from('profiles').update({ expertise: job }).eq('id', user.id);
  };

  const resetJob = async () => {
    setSelectedCategory(null);
    setOnDuty(false);
    setCustomJobInput("");
    await supabase.from('profiles').update({ is_online: false, expertise: null }).eq('id', user.id);
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      if (!files || files.length === 0) return;

      const newImageUrls = [];
      setNotif(`Uploading ${files.length} image(s)...`);

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolios')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('portfolios').getPublicUrl(filePath);
        if (data?.publicUrl) {
          newImageUrls.push(data.publicUrl);
        }
      }

      const updatedImages = [...portfolioImages, ...newImageUrls];
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ portfolio_images: updatedImages })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPortfolioImages(updatedImages);
      setNotif("Portfolio updated successfully!");
    } catch (error) {
      setNotif("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Worker Hub</h1>
          <p style={{ color: Theme.colors.muted }}>Select your expertise and find jobs</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Button variant="outline" onClick={onLogout} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Logout</Button>
          <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '40px', borderRadius: '8px' }} />
        </div>
      </header>

      {!selectedCategory ? (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>What service are you offering today?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {categories.map(cat => (
              <Button key={cat.id} variant="outline" onClick={() => handleJobSelect(cat.name)} style={{ minWidth: '150px' }}>
                {cat.name}
              </Button>
            ))}
          </div>
          
          <div style={{ borderTop: `1px solid ${Theme.glass.border}`, paddingTop: '2rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ color: Theme.colors.muted }}>Or type another job you are comfortable with:</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                placeholder="E.g. Painter, Tutor, Chef" 
                value={customJobInput}
                onChange={(e) => setCustomJobInput(e.target.value)}
                style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${Theme.glass.border}`, color: 'white', outline: 'none', width: '250px' }}
              />
              <Button onClick={() => customJobInput && handleJobSelect(customJobInput)} disabled={!customJobInput}>Start Custom Job</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Active Job</h3>
                  <p style={{ color: Theme.colors.primary, margin: '0.5rem 0 0 0', fontWeight: 600 }}>{selectedCategory}</p>
                </div>
                <Button variant="outline" onClick={resetJob} style={{ fontSize: '0.7rem', padding: '0.4rem' }}>Change Job</Button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: `1px solid ${onDuty ? Theme.colors.secondary : Theme.colors.muted}` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{onDuty ? "On Duty" : "Off Duty"}</p>
                  <p style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>{onDuty ? "Clients can see you" : "Location hidden"}</p>
                </div>
                <div 
                  onClick={handleToggleDuty} 
                  style={{ width: '50px', height: '26px', background: onDuty ? Theme.colors.secondary : '#334155', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', left: onDuty ? '26px' : '3px', top: '3px', transition: '0.3s' }}></div>
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: `4px solid ${Theme.colors.primary}` }}>
              <h3>Earnings</h3>
              <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>KES 0</h2>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>This Month • 0 Jobs</p>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>My Portfolio</h3>
                <div>
                  <input 
                    type="file" 
                    id="portfolio-upload" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    disabled={uploading}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('portfolio-upload').click()} 
                    style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "+ Add Images"}
                  </Button>
                </div>
              </div>
              
              {portfolioImages.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {portfolioImages.map((url, idx) => (
                    <div key={idx} style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${Theme.glass.border}` }}>
                      <img src={url} alt={`Portfolio ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: Theme.colors.muted, textAlign: 'center', margin: '1rem 0' }}>
                  No featured work yet. Upload photos to attract more clients!
                </p>
              )}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card style={{ height: '450px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center', opacity: onDuty ? 1 : 0.3, transition: '0.5s' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <h4>Nearby Job Leads</h4>
                  <p style={{ color: Theme.colors.muted }}>{onDuty ? "Searching for clients looking for " + selectedCategory + "..." : "Go On Duty to see leads"}</p>
               </div>
               
               {onDuty && (
                 <div style={{ position: 'absolute', top: '30%', left: '40%', cursor: 'pointer' }} onClick={() => setCalling("Client #204")}>
                    <div className="animate-float" style={{ padding: '0.5rem', background: Theme.colors.primary, borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                      New Request!
                    </div>
                    <div style={{ width: '12px', height: '12px', background: Theme.colors.primary, borderRadius: '50%', margin: '4px auto' }}></div>
                 </div>
               )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
