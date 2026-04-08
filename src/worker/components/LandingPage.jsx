import React, { useState, useEffect } from 'react';
import { useTheme, ThemeToggle } from './UI';

/* ── tiny hook for counting animation ───────────────────── */
function useCountUp(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Stat({ number, suffix, label, t }) {
  const val = useCountUp(number);
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{
        fontSize: '2.6rem', fontWeight: 800, lineHeight: 1,
        background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {val.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '0.82rem', color: t.textMuted, marginTop: '0.4rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surface,
        border: `1px solid ${hovered ? t.primary : t.border}`,
        borderRadius: 20, padding: '1.75rem',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.15)` : t.shadow,
        cursor: 'default',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(129,140,248,0.15) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', marginBottom: '1rem',
        border: `1px solid rgba(59,130,246,0.2)`,
      }}>
        {icon}
      </div>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: t.text }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: t.textMuted, lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

function RoleCard({ icon, role, title, subtitle, bullets, ctaLabel, accent, onGo, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surface,
        border: `2px solid ${hovered ? accent : t.border}`,
        borderRadius: 24, padding: '2.5rem 2rem',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'none',
        boxShadow: hovered ? `0 24px 48px rgba(0,0,0,0.5), 0 0 28px ${accent}30` : t.shadowLg,
        cursor: 'default', flex: 1,
      }}
    >
      <div style={{
        width: 68, height: 68, borderRadius: 18,
        background: `${accent}18`, border: `2px solid ${accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.2rem', marginBottom: '1.5rem',
      }}>{icon}</div>
      <span style={{
        display: 'inline-block', marginBottom: '0.75rem',
        padding: '0.25rem 0.8rem', borderRadius: 99,
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
        background: `${accent}20`, color: accent, width: 'fit-content', textTransform: 'uppercase',
      }}>{role}</span>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.45rem', fontWeight: 800, color: t.text }}>{title}</h2>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: t.textMuted, lineHeight: 1.6 }}>{subtitle}</p>
      <ul style={{ margin: '0 0 2rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: t.textMuted }}>
            <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: '0.05rem' }}>✓</span>
            {b}
          </li>
        ))}
      </ul>
      <button
        id={`landing-cta-${role.toLowerCase()}`}
        onClick={onGo}
        style={{
          width: '100%', padding: '1rem', borderRadius: 14,
          background: accent, color: '#fff', border: 'none',
          fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: 'inherit',
          boxShadow: `0 4px 18px ${accent}50`,
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >{ctaLabel} →</button>
    </div>
  );
}

function StepCard({ step, title, desc, t }) {
  return (
    <div style={{
      display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
      padding: '1.25rem', background: t.surfaceAlt,
      borderRadius: 16, border: `1px solid ${t.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, color: '#fff', fontSize: '0.95rem',
      }}>{step}</div>
      <div>
        <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '0.95rem', color: t.text }}>{title}</p>
        <p style={{ margin: 0, fontSize: '0.82rem', color: t.textMuted, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterClient, onEnterWorker }) {
  const { theme: t } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const orb = (color, size, top, left, blur = 120) => ({
    position: 'absolute', width: size, height: size, borderRadius: '50%',
    background: color, filter: `blur(${blur}px)`, opacity: 0.25,
    top, left, pointerEvents: 'none', zIndex: 0,
  });

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, overflowX: 'hidden', position: 'relative' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? `${t.surface}ee` : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${t.border}` : '1px solid transparent',
        transition: 'all 0.3s ease', padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>🛡️</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Vigilance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button
            id="nav-worker-signin"
            onClick={onEnterWorker}
            style={{
              padding: '0.55rem 1.2rem', borderRadius: 10,
              background: 'transparent', color: t.text,
              border: `1px solid ${t.border}`,
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
          >
            Worker Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', padding: '6rem 2rem 5rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center', overflow: 'hidden' }}>
        <div style={orb('radial-gradient(circle, #3b82f6, transparent)', 500, '-100px', '10%')} />
        <div style={orb('radial-gradient(circle, #818cf8, transparent)', 400, '50px', '60%')} />
        <div style={orb('radial-gradient(circle, #10b981, transparent)', 350, '200px', '75%', 140)} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1.1rem', borderRadius: 99,
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            fontSize: '0.78rem', fontWeight: 600, color: '#3b82f6',
            marginBottom: '1.75rem', letterSpacing: '0.03em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            Kenya's Premier On-Demand Workforce Platform
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
            Connect with{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 60%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Verified Professionals
            </span>
            <br />or Find Your Next Job
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: t.textMuted, maxWidth: 640, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Vigilance is a trusted marketplace connecting clients with skilled, ID-verified workers
            across Kenya. Post a job in minutes, get matched instantly, and pay securely via M-Pesa.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              id="hero-cta-client"
              onClick={onEnterClient}
              style={{
                padding: '1rem 2.2rem', borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.45)'; }}
            >🏢 I Need a Professional</button>
            <button
              id="hero-cta-worker"
              onClick={onEnterWorker}
              style={{
                padding: '1rem 2.2rem', borderRadius: 14,
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                border: '2px solid rgba(16,185,129,0.35)',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >👷 I'm a Worker</button>
          </div>
          <p style={{ fontSize: '0.78rem', color: t.textSubtle }}>Free to join • No hidden fees • M-Pesa payments</p>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background: t.surface, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, padding: '0.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <Stat number={2400} suffix="+" label="Active Workers" t={t} />
          <Stat number={8700} suffix="+" label="Jobs Completed" t={t} />
          <Stat number={47}   suffix="+"  label="Counties Served" t={t} />
          <Stat number={98}   suffix="%"  label="Client Satisfaction" t={t} />
        </div>
      </div>

      {/* WHAT IS VIGILANCE */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ color: t.primary, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>About the Platform</p>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>What is Vigilance?</h2>
          <p style={{ color: t.textMuted, maxWidth: 680, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.75 }}>
            Vigilance is Kenya's smartest on-demand workforce marketplace. We bridge the gap between
            individuals and businesses who need skilled help — and the talented professionals ready to deliver it.
            Every worker on our platform is identity-verified, rated by real clients, and paid instantly
            through M-Pesa, making every transaction safe, transparent and fast.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '🆔', title: 'ID-Verified Workers', desc: 'Every worker completes National ID verification before accepting a single job. You always know who you are hiring.' },
            { icon: '📍', title: 'Location-Aware Matching', desc: 'Our GPS-powered matching system connects you with the closest available worker, slashing wait times dramatically.' },
            { icon: '💳', title: 'Instant M-Pesa Payments', desc: 'Clients pay through M-Pesa upon job completion. Workers receive funds within seconds — no delays, no disputes.' },
            { icon: '⭐', title: 'Transparent Rating System', desc: 'Every interaction is reviewed. Clients rate workers and workers rate clients, keeping the entire ecosystem accountable.' },
            { icon: '🔒', title: 'Enterprise-Grade Security', desc: 'All data is encrypted end-to-end. Our platform is built on Supabase with row-level security, ensuring privacy for everyone.' },
            { icon: '📊', title: 'Real-time Job Tracking', desc: 'Know exactly where your job stands at every moment. Clients and workers receive live status updates throughout the process.' },
          ].map((f, i) => <FeatureCard key={i} {...f} t={t} />)}
        </div>
      </section>

      {/* CHOOSE YOUR ROLE */}
      <div style={{ background: t.surfaceAlt, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: t.primary, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Get Started</p>
            <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Who are you?</h2>
            <p style={{ color: t.textMuted, fontSize: '0.9rem' }}>Choose your path — everything is tailored to your specific experience.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <RoleCard
              icon="🏢" role="Client" title="Hire a Professional"
              subtitle="Post your job, browse verified workers nearby, and get the help you need — fast, safely, and on your schedule."
              bullets={[
                'Post jobs with a full description and your location',
                'Browse worker profiles with ratings and verified identity',
                'Receive real-time job status updates',
                'Pay securely via M-Pesa — only when the job is done',
                'Rate and review your experience after completion',
                'Full job history available in your personal dashboard',
              ]}
              ctaLabel="Enter Client Portal" accent="#3b82f6" onGo={onEnterClient} t={t}
            />
            <RoleCard
              icon="👷" role="Worker" title="Find Work & Earn"
              subtitle="Join thousands of professionals already earning on Vigilance. Set your availability, accept jobs nearby, and get paid instantly."
              bullets={[
                'Create a profile that showcases your skills and expertise',
                'Toggle your availability on/off at any time',
                'Get matched with relevant jobs near your location',
                'Accept or decline job requests freely',
                'Receive M-Pesa payment within seconds of completion',
                'Build your reputation with client reviews and a portfolio',
              ]}
              ctaLabel="Enter Worker Portal" accent="#10b981" onGo={onEnterWorker} t={t}
            />
          </div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: t.primary, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Simple Process</p>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>How it works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
              <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Clients</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <StepCard step="1" title="Sign Up & Post a Job" desc="Create your free client account in under 2 minutes. Describe what you need, set your location, and submit." t={t} />
              <StepCard step="2" title="Get Matched Instantly"  desc="Our algorithm surfaces the nearest available, highest-rated worker for your specific job category." t={t} />
              <StepCard step="3" title="Track in Real-Time"    desc="Watch your job progress through each stage — from acceptance to completion — all within the app." t={t} />
              <StepCard step="4" title="Pay & Review"          desc="Approve completion, pay via M-Pesa, and leave a review to help the community stay high quality." t={t} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Workers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <StepCard step="1" title="Create Your Profile"  desc="Register with your National ID, upload a photo, pick your expertise category, and write a short bio." t={t} />
              <StepCard step="2" title="Go Online"            desc="Toggle your availability to 'online' whenever you're ready to work. You control your own schedule." t={t} />
              <StepCard step="3" title="Accept Job Requests"  desc="Receive instant job notifications. Review the details and accept if it fits — you can always decline." t={t} />
              <StepCard step="4" title="Complete & Get Paid"  desc="Deliver quality work, mark the job complete, and receive your M-Pesa payment in seconds — guaranteed." t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div style={{ background: t.surfaceAlt, borderTop: `1px solid ${t.border}` }}>
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Built on Trust & Transparency</h2>
          <p style={{ color: t.textMuted, fontSize: '0.9rem', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            Vigilance is not just a marketplace — it is a community governed by accountability.
            Our safety-first design ensures that clients can hire with confidence and workers can earn with dignity.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🛡️', label: 'End-to-End Encryption' },
              { icon: '✅', label: 'National ID Verification' },
              { icon: '📱', label: 'M-Pesa Secured Payments' },
              { icon: '⚖️', label: 'Dispute Resolution Support' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '1.25rem', background: t.surface,
                borderRadius: 16, border: `1px solid ${t.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.text }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FINAL CTA */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={orb('radial-gradient(circle, #3b82f6, transparent)', 400, '-80px', '20%', 100)} />
        <div style={orb('radial-gradient(circle, #10b981, transparent)', 300, '50px', '65%', 110)} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Ready to get started?</h2>
          <p style={{ color: t.textMuted, fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Join thousands of Kenyans already using Vigilance to work smarter and hire better. It's free, fast, and built for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="final-cta-client"
              onClick={onEnterClient}
              style={{
                padding: '1rem 2.2rem', borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(59,130,246,0.45)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >🏢 Client Portal</button>
            <button
              id="final-cta-worker"
              onClick={onEnterWorker}
              style={{
                padding: '1rem 2.2rem', borderRadius: 14,
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                border: '2px solid rgba(16,185,129,0.35)',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.22)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >👷 Worker Portal</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: `1px solid ${t.border}`, padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', color: t.textSubtle, fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
          }}>🛡️</div>
          <span style={{ fontWeight: 700, color: t.textMuted }}>Vigilance</span>
        </div>
        <span>© {new Date().getFullYear()} Vigilance Kenya. All rights reserved.</span>
        <span style={{ color: '#10b981', fontWeight: 600 }}>🇰🇪 Proudly Kenyan</span>
      </footer>
    </div>
  );
}

