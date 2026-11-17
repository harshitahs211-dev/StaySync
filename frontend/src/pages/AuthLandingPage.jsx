import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Hotel,
  Shield,
  Key,
  Calendar,
  CreditCard,
  Sparkles,
  ClipboardList,
  LayoutDashboard,
  Wrench,
  Utensils,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  Star,
  Compass,
  AlertCircle,
  HelpCircle,
  Users
} from 'lucide-react';

export default function AuthLandingPage({ defaultTab = 'LOGIN' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, register, loading: authLoading } = useAuth();

  const initialTab = searchParams.get('tab') === 'register' ? 'REGISTER' : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab); // 'LOGIN' or 'REGISTER'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAccountType, setRegAccountType] = useState('GUEST');
  const [regError, setRegError] = useState(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState(null);
  const [submittingReg, setSubmittingReg] = useState(false);

  // If user is already authenticated, redirect to their role dashboard
  useEffect(() => {
    if (!authLoading && user) {
      redirectToDashboard(user.role);
    }
  }, [user, authLoading]);

  // Sync tab with props / URL search params
  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('REGISTER');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, searchParams]);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'GUEST':
        navigate('/guest/dashboard', { replace: true });
        break;
      case 'RECEPTIONIST':
        navigate('/receptionist/dashboard', { replace: true });
        break;
      case 'MANAGER':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'HOUSEKEEPING':
        navigate('/housekeeping/dashboard', { replace: true });
        break;
      case 'MAINTENANCE':
        navigate('/maintenance/dashboard', { replace: true });
        break;
      case 'RESTAURANT':
        navigate('/services/dashboard', { replace: true });
        break;
      default:
        navigate('/guest/dashboard', { replace: true });
    }
  };

  // Loading splash to prevent any flash of content (strictly placed AFTER all React hooks)
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF9F6'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: '#5B6A53',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          marginBottom: '1rem',
          boxShadow: '0 4px 14px rgba(91, 106, 83, 0.25)'
        }}>
          <Hotel size={30} />
        </div>
        <div style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#343B36',
          marginBottom: '0.35rem'
        }}>
          StaySync
        </div>
        <div style={{ fontSize: '0.85rem', color: '#8C754E', fontStyle: 'italic' }}>
          Initializing secure portal access...
        </div>
      </div>
    );
  }

  // Password strength check
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passwordStrength = calculatePasswordStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setSubmittingLogin(true);

    try {
      const loggedIn = await login(loginEmail, loginPassword);
      redirectToDashboard(loggedIn.role);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your confirmation password.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters in length.');
      return;
    }

    setSubmittingReg(true);

    try {
      const newUser = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: 'GUEST'
      });
      setRegSuccessMsg('Account created successfully! Redirecting to your Guest Portal...');
      setTimeout(() => {
        redirectToDashboard('GUEST');
      }, 1000);
    } catch (err) {
      setRegError(err.message || 'Registration failed. A user with this email may already exist.');
    } finally {
      setSubmittingReg(false);
    }
  };

  // Pre-fill demo role credentials
  const selectPortalRole = (roleEmail, defaultTab = 'LOGIN') => {
    setActiveTab(defaultTab);
    setLoginEmail(roleEmail);
    setLoginPassword('StaySync@2026');
    setLoginError(null);

    // Scroll smoothly to auth card
    const cardEl = document.getElementById('auth-card-section');
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh', color: '#343B36' }}>

      {/* Hero & Authentication Section */}
      <section style={{
        position: 'relative',
        padding: '3.5rem 1.5rem 5rem 1.5rem',
        background: 'linear-gradient(180deg, #FAF9F6 0%, #F4F0E8 100%)',
        borderBottom: '1px solid #E8E4DC'
      }}>
        <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>

            {/* Left Column: Brand Hero Text */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EEF2EC',
                border: '1px solid #D6DFD3',
                padding: '6px 14px',
                borderRadius: '20px',
                color: '#5B6A53',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '1.5rem'
              }}>
                <Sparkles size={16} />
                <span>Enterprise Hospitality Management Platform</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#343B36',
                fontFamily: 'Playfair Display, Georgia, serif',
                marginBottom: '1rem',
                letterSpacing: '-0.02em'
              }}>
                StaySync
              </h1>

              <div style={{
                fontSize: 'clamp(1.25rem, 2.2vw, 1.7rem)',
                fontWeight: 600,
                color: '#8C754E',
                fontFamily: 'Playfair Display, Georgia, serif',
                marginBottom: '1.25rem',
                fontStyle: 'italic'
              }}>
                “Your Stay, Seamlessly Connected.”
              </div>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: '#6E7770',
                maxWidth: '520px',
                marginBottom: '2rem'
              }}>
                Experience smarter hospitality. Discover exceptional stays, effortless bookings, and personalised guest services – all in one place.
              </p>

              {/* Value Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B6A53', flexShrink: 0 }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#343B36', display: 'block' }}>Zero Race Conditions</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6E7770' }}>Atomic 5m Redis inventory locks</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C754E', flexShrink: 0 }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#343B36', display: 'block' }}>Razorpay Test Gateway</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6E7770' }}>HMAC SHA-256 signature verification</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B6A53', flexShrink: 0 }}>
                    <Key size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#343B36', display: 'block' }}>Digital QR / NFC Pass</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6E7770' }}>Instant online KYC check-in</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C754E', flexShrink: 0 }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#343B36', display: 'block' }}>6 Role Portals</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6E7770' }}>Tailored operational dashboards</span>
                  </div>
                </div>
              </div>

              {/* Guest Exploration & Portal Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/search"
                    className="btn-primary"
                    style={{
                      padding: '12px 22px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      backgroundColor: '#5B6A53',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)',
                      textDecoration: 'none'
                    }}
                  >
                    <Compass size={18} />
                    Continue as Guest (Browse Suites) &rarr;
                  </Link>
                  <a
                    href="#portal-selection-section"
                    style={{
                      fontSize: '0.88rem',
                      color: '#5B6A53',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Explore 6 Role Portals</span>
                    <span>&darr;</span>
                  </a>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#85877F' }}>
                  * Public browsing lets you inspect hotels and suites. Login is required to book or use room controls.
                </div>
              </div>

            </div>

            {/* Right Column: Authentication Card */}
            <div id="auth-card-section">
              <div
                className="animate-fade"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E8E4DC',
                  boxShadow: '0 20px 45px rgba(52, 59, 54, 0.08)',
                  padding: '2.5rem',
                  maxWidth: '460px',
                  margin: '0 auto'
                }}
              >

                {/* Tab Switcher: Login / Sign Up */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  backgroundColor: '#F4F0E8',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '1.75rem'
                }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('LOGIN'); setLoginError(null); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeTab === 'LOGIN' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'LOGIN' ? '#343B36' : '#6E7770',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'LOGIN' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('REGISTER'); setRegError(null); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeTab === 'REGISTER' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'REGISTER' ? '#343B36' : '#6E7770',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'REGISTER' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Create Account
                  </button>
                </div>

                {/* TAB 1: LOGIN FORM */}
                {activeTab === 'LOGIN' && (
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
                        Welcome Back
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#6E7770', marginTop: '2px', marginBottom: 0 }}>
                        Enter your credentials to access your designated StaySync portal.
                      </p>
                    </div>

                    {loginError && (
                      <div style={{
                        backgroundColor: '#FBF0EE',
                        border: '1px solid #F1C3BA',
                        color: '#B34A3A',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#5B6A53" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="name@staysync.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        required
                        style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36' }}
                      />
                    </div>

                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                          <Lock size={14} color="#5B6A53" />
                          <span>Password</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          style={{ background: 'none', border: 'none', color: '#5B6A53', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          required
                          style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36', paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6E7770',
                            padding: '4px'
                          }}
                          title={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#6E7770' }}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          style={{ accentColor: '#5B6A53' }}
                        />
                        <span>Remember my session</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingLogin}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '0.95rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        backgroundColor: '#5B6A53',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
                      }}
                    >
                      {submittingLogin ? 'Authenticating...' : 'Sign In to Portal'}
                    </button>

                    {/* Developer One-Click Demo Credentials */}
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '1rem',
                      borderTop: '1px dashed #E8E4DC',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#8C754E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        One-Click Demo Access (Dev Mode):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('guest@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Guest
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('reception@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Receptionist
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('manager@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Admin / Manager
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('housekeeping@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Housekeeping
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('maintenance@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Maintenance
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPortalRole('service@staysync.com')}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Service Staff
                        </button>
                      </div>
                    </div>

                    {/* Continue as Guest within login form */}
                    <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #E8E4DC' }}>
                      <Link
                        to="/search"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#5B6A53',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Compass size={15} />
                        <span>Continue as Guest (Browse Without Account) &rarr;</span>
                      </Link>
                    </div>

                  </form>
                )}

                {/* TAB 2: REGISTER FORM */}
                {activeTab === 'REGISTER' && (
                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
                        Create Guest Account
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#6E7770', marginTop: '2px', marginBottom: 0 }}>
                        Join StaySync to reserve luxury suites, unlock digital keys, and earn rewards.
                      </p>
                    </div>

                    {regError && (
                      <div style={{
                        backgroundColor: '#FBF0EE',
                        border: '1px solid #F1C3BA',
                        color: '#B34A3A',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{regError}</span>
                      </div>
                    )}

                    {regSuccessMsg && (
                      <div style={{
                        backgroundColor: '#EEF2EC',
                        border: '1px solid #D6DFD3',
                        color: '#5B6A53',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                        <span>{regSuccessMsg}</span>
                      </div>
                    )}

                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#5B6A53" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Vikramaditya Singhania"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        required
                        style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36' }}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#5B6A53" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="vikram@example.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        required
                        style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36' }}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#5B6A53" />
                        <span>Phone Number (for SMS & Digital Keys)</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        minLength={10}
                        className="input-field"
                        placeholder="Enter 10-digit mobile number"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36' }}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} color="#5B6A53" />
                        <span>Password (min. 8 characters)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36', paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6E7770', padding: '4px' }}
                        >
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      {regPassword && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ flex: 1, backgroundColor: passwordStrength >= 1 ? '#5B6A53' : '#E8E4DC' }} />
                            <div style={{ flex: 1, backgroundColor: passwordStrength >= 2 ? '#5B6A53' : '#E8E4DC' }} />
                            <div style={{ flex: 1, backgroundColor: passwordStrength >= 3 ? '#8C754E' : '#E8E4DC' }} />
                            <div style={{ flex: 1, backgroundColor: passwordStrength >= 4 ? '#2E7D32' : '#E8E4DC' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#6E7770' }}>
                            {passwordStrength < 2 ? 'Weak password' : passwordStrength === 3 ? 'Good password' : 'Strong password'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Confirm Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E4DC', color: '#343B36' }}
                      />
                    </div>

                    {/* Role Notice */}
                    <div style={{
                      backgroundColor: '#FAF9F6',
                      border: '1px solid #E8E4DC',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#6E7770',
                      lineHeight: 1.4
                    }}>
                      <strong style={{ color: '#8C754E' }}>Notice:</strong> Public self-signup creates Guest access. Staff & administrative accounts are provisioned by hotel administration.
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReg}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '0.95rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        backgroundColor: '#5B6A53',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
                      }}
                    >
                      {submittingReg ? 'Creating Guest Account...' : 'Create Guest Account'}
                    </button>

                    {/* Continue as Guest within register form */}
                    <div style={{ textAlign: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E8E4DC' }}>
                      <Link
                        to="/search"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#5B6A53',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Compass size={15} />
                        <span>Continue as Guest (Browse Without Account) &rarr;</span>
                      </Link>
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION: Choose Your StaySync Experience (6 Role Portal Cards) */}
      <section id="portal-selection-section" style={{
        padding: '5rem 1.5rem',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E4DC'
      }}>
        <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#8C754E',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Role-Based Architecture
            </span>
            <h2 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              fontFamily: 'Playfair Display, Georgia, serif',
              color: '#343B36',
              marginBottom: '1rem'
            }}>
              Choose Your StaySync Experience
            </h2>
            <p style={{ fontSize: '1rem', color: '#6E7770', lineHeight: 1.6 }}>
              Tailored interfaces engineered for every stakeholder across the luxury hospitality lifecycle.
              Select a portal below to sign in or explore designated operational capabilities.
            </p>
          </div>

          {/* 6 Portal Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem'
          }}>

            {/* PORTAL 1: GUEST */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #D6DFD3'
                  }}>
                    <Hotel size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    PUBLIC ACCESS
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  1. Guest Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Discover hotels, explore rooms, make reservations, manage your stay, access digital room keys, request services, and earn loyalty rewards.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Hotel discovery',
                    'Room search',
                    'Room booking',
                    'Payments',
                    'Online check-in',
                    'Digital room key',
                    'Room service',
                    'Booking history',
                    'Invoices',
                    'Loyalty rewards',
                    'Feedback'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => selectPortalRole('guest@staysync.com')}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    backgroundColor: '#5B6A53',
                    color: '#FFFFFF',
                    borderRadius: '8px'
                  }}
                >
                  Guest Portal Login <ArrowRight size={16} />
                </button>
                <Link
                  to="/search"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E4DC',
                    color: '#343B36',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Compass size={15} color="#5B6A53" /> Continue as Guest (Browse Suites)
                </Link>
              </div>
            </div>

            {/* PORTAL 2: RECEPTIONIST */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFDF9',
                    color: '#8C754E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #F1E5D1'
                  }}>
                    <ClipboardList size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#FFFDF9',
                    color: '#8C754E',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid #F1E5D1'
                  }}>
                    FRONT DESK
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  2. Receptionist Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Manage front-desk operations, reservations, guest check-ins, checkouts, and room allocation.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Guest management',
                    'Booking management',
                    'Walk-in reservations',
                    'Check-in/check-out',
                    'Room availability',
                    'Payment verification'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPortalRole('reception@staysync.com')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36'
                }}
              >
                Receptionist Login <ArrowRight size={16} />
              </button>
            </div>

            {/* PORTAL 3: HOTEL MANAGER / ADMIN */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F3EFEA',
                    color: '#8C754E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #E8DDCC'
                  }}>
                    <LayoutDashboard size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#F3EFEA',
                    color: '#8C754E',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid #E8DDCC'
                  }}>
                    EXECUTIVE ADMIN
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  3. Hotel Manager / Admin Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Monitor hotel performance, manage operations, analyse revenue, and oversee staff activities.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Hotel overview',
                    'Revenue analytics',
                    'Occupancy reports',
                    'Booking management',
                    'Room management',
                    'Staff management',
                    'Pricing management',
                    'Guest feedback',
                    'Reports'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPortalRole('manager@staysync.com')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36'
                }}
              >
                Admin Login <ArrowRight size={16} />
              </button>
            </div>

            {/* PORTAL 4: HOUSEKEEPING */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #D6DFD3'
                  }}>
                    <Sparkles size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    OPERATIONS
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  4. Housekeeping Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Manage room cleaning, room readiness, housekeeping assignments, and task completion.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Assigned cleaning tasks',
                    'Checkout cleaning',
                    'Room status',
                    'Priority tasks',
                    'Task updates'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPortalRole('housekeeping@staysync.com')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36'
                }}
              >
                Housekeeping Login <ArrowRight size={16} />
              </button>
            </div>

            {/* PORTAL 5: MAINTENANCE */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFDF9',
                    color: '#8C754E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #F1E5D1'
                  }}>
                    <Wrench size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#FFFDF9',
                    color: '#8C754E',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid #F1E5D1'
                  }}>
                    ENGINEERING
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  5. Maintenance Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Manage maintenance requests, guest complaints, technical issues, and room repairs.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Maintenance tickets',
                    'Room details',
                    'Priority management',
                    'Task assignment',
                    'Resolution updates'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPortalRole('maintenance@staysync.com')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36'
                }}
              >
                Maintenance Login <ArrowRight size={16} />
              </button>
            </div>

            {/* PORTAL 6: RESTAURANT / SERVICE STAFF */}
            <div
              className="luxury-card"
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                borderRadius: '14px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 14px rgba(52, 59, 54, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #D6DFD3'
                  }}>
                    <Utensils size={24} />
                  </div>
                  <span style={{
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    F&B & SERVICES
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.65rem' }}>
                  6. Restaurant / Service Staff Portal
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Coordinate restaurant orders, room service, laundry, spa appointments, and guest requests.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.75rem' }}>
                  {[
                    'Service orders',
                    'Room service',
                    'Restaurant reservations',
                    'Laundry',
                    'Spa requests',
                    'Order management',
                    'Billing updates'
                  ].map((feat, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#343B36'
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPortalRole('service@staysync.com')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36'
                }}
              >
                Service Staff Login <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Forgot Password Modal Helper */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div
            className="glass-panel animate-fade"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E4DC',
              borderRadius: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#EEF2EC',
              color: '#5B6A53',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <HelpCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.5rem' }}>
              Reset Credentials
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6E7770', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              For development and evaluation purposes, all six role accounts use password <code>StaySync@2026</code>.
              To reset credentials for a custom guest account, please contact hotel concierge at <strong>support@staysync.com</strong> or use the One-Click Demo Access buttons.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
