import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { authenticateUser, createUser } from '../../store/slices/userSlice';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode = 'login',
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.user);
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
      }
      
      const result = await dispatch(createUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }));
      
      if (createUser.fulfilled.match(result)) {
        alert('Account created successfully! Please log in.');
        setMode('login');
        setFormData({
          username: formData.username,
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } else {
      const result = await dispatch(authenticateUser({
        username: formData.username.trim(),
        password: formData.password,
      }));
      
      if (authenticateUser.fulfilled.match(result)) {
        onClose();
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={closeButtonStyle}
          type="button"
        >
          ✕
        </button>

        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p style={subtitleStyle}>
            {mode === 'login' 
              ? 'Welcome back to Planetary Chess!' 
              : 'Join the Planetary Chess community!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={inputStyle}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={inputStyle}
              placeholder="Enter your password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...primaryButtonStyle,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading 
              ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {/* Mode toggle */}
          <div style={toggleStyle}>
            <span style={toggleTextStyle}>
              {mode === 'login' 
                ? "Don't have an account? " 
                : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              style={linkButtonStyle}
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

const modalStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
  borderRadius: '12px',
  padding: '32px',
  width: '100%',
  maxWidth: '420px',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: '1px solid #404040',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  position: 'relative',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  color: '#a0a0a0',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
};

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const subtitleStyle: React.CSSProperties = {
  color: '#a0a0a0',
  fontSize: '14px',
  margin: 0,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
};

const inputStyle: React.CSSProperties = {
  backgroundColor: '#262626',
  border: '1px solid #404040',
  borderRadius: '6px',
  padding: '12px 16px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s ease',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 77, 79, 0.1)',
  border: '1px solid #ff4d4f',
  borderRadius: '6px',
  padding: '12px',
  color: '#ff7875',
  fontSize: '14px',
  textAlign: 'center',
};

const primaryButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
};

const toggleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '8px',
};

const toggleTextStyle: React.CSSProperties = {
  color: '#a0a0a0',
  fontSize: '14px',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#1890ff',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
};

export default AuthModal;