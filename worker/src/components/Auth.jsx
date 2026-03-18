import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './UI';
import { supabase } from '../supabaseClient';

const RoleSignup = ({ onSelect }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1: Choose Role, 2: Basic Info, 3: Verification Info
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Registration State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    nationalId: "",
    avatarUrl: "",
    expertise: "",
    bio: ""
  });
  
  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      // Fetch profile to get role and pass it to App.jsx
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;

      onSelect(profileData);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true);
      setErrorMsg(null);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setFormData({ ...formData, avatarUrl: data.publicUrl });
      }
    } catch (error) {
      setErrorMsg("Image upload failed: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone) {
      setErrorMsg("Please fill in all core fields (Email, Password, Name, Phone)");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
            phone: formData.phone,
            nationalId: formData.nationalId,
            avatarUrl: formData.avatarUrl,
            expertise: formData.expertise,
            bio: formData.bio
          }
        }
      });

      if (error) throw error;

      // The profile is now automatically created by a Supabase trigger!
      // We just pass the user back to the app state.
      onSelect({ id: data.user.id, role, ...formData });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ color: Theme.colors.muted }}>Sign in to Vigilance</p>
      </div>
      
      {errorMsg && <div style={{ padding: '0.8rem', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}

      <input 
        placeholder="Email Address" 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        style={inputStyle}
      />
      <input 
        type="password"
        placeholder="Password" 
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        style={inputStyle}
      />
      <Button disabled={loading} onClick={handleLogin}>
        {loading ? "Authenticating..." : "Login to Dashboard"}
      </Button>
      <button onClick={() => { setMode('signup'); setStep(1); setErrorMsg(null); }} style={{ background: 'none', border: 'none', color: Theme.colors.muted, cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Don't have an account? Sign Up
      </button>
    </div>
  );

  const renderSignupStep = () => {
    switch(step) {
      case 1:
        return (
          <div style={{ textAlign: 'center' }}>
            <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Join Vigilance</h2>
            <p style={{ color: Theme.colors.muted, marginBottom: '2.5rem' }}>Kenya's Smartest Workforce Ecosystem</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <Button onClick={() => handleRoleSelect('client')} style={{ height: '70px', fontSize: '1.1rem' }}>
                Hire a Professional (Client)
              </Button>
              <Button variant="outline" onClick={() => handleRoleSelect('worker')} style={{ height: '70px', fontSize: '1.1rem', borderColor: Theme.colors.primary }}>
                Find Work (Worker)
              </Button>
            </div>
            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: Theme.colors.muted, cursor: 'pointer', fontSize: '0.8rem', marginTop: '1.5rem' }}>
              Already have an account? Login
            </button>
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Basic Information ({role === 'client' ? 'Client' : 'Worker'})</h3>
            <input 
              placeholder="Full Name as per ID" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              style={inputStyle}
            />
            <input 
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={inputStyle}
            />
            <input 
              type="password"
              placeholder="Secure Password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={inputStyle}
            />
            <input 
              placeholder="Phone Number (M-Pesa registered)" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={inputStyle}
            />
            <Button onClick={() => setStep(3)}>Next: Verification Details</Button>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: Theme.colors.muted, cursor: 'pointer', fontSize: '0.8rem' }}>Back</button>
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Identity Verification</h3>
            <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Just like Uber, we need these to keep the community safe.</p>
            
            {errorMsg && <div style={{ padding: '0.8rem', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}

            <input 
              placeholder="National ID / Passport Number" 
              value={formData.nationalId}
              onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
              style={inputStyle}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Profile Picture</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ ...inputStyle, padding: '0.5rem' }}
              />
              {uploadingImage && <span style={{ fontSize: '0.75rem', color: Theme.colors.primary }}>Uploading...</span>}
              {formData.avatarUrl && <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Image ready!</span>}
            </div>

            {role === 'worker' && (
              <>
                <select 
                  value={formData.expertise}
                  onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                  style={{...inputStyle, WebkitAppearance: 'none'}}
                >
                  <option value="" disabled>Select Primary Expertise</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name} style={{ color: 'black' }}>{cat.name}</option>
                  ))}
                  <option value="Other" style={{ color: 'black' }}>Other (General)</option>
                </select>
                <textarea 
                  placeholder="Professional Biography" 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                />
              </>
            )}

            <Button disabled={loading} onClick={handleRegister}>
              {loading ? "Verifying..." : "Complete Registration"}
            </Button>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: Theme.colors.muted, cursor: 'pointer', fontSize: '0.8rem' }}>Back</button>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: Theme.colors.darker, padding: '1rem' }}>
      <Card style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '50px', borderRadius: '12px' }} />
        </div>
        {mode === 'login' ? renderLogin() : renderSignupStep()}
      </Card>
    </div>
  );
};

const inputStyle = {
  padding: '0.9rem',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${Theme.glass.border}`,
  color: 'white',
  width: '100%',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};

export default RoleSignup;
