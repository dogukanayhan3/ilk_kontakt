// src/components/profile/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, UserCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/LoginPage.css';

const API_BASE = 'https://localhost:44388';

// Helper to get an XSRF cookie by name
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? m[2] : null;
}

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    about: '',
    address: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  // --- LOGIN handler (unchanged) ---
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Boot XSRF cookie
      await fetch(`${API_BASE}/api/abp/application-configuration`, { credentials: 'include' });
      const xsrf = getCookie('XSRF-TOKEN');
      if (!xsrf) throw new Error('XSRF token not found');

      // Login call
      const loginRes = await fetch(`${API_BASE}/api/account/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          userNameOrEmailAddress: formData.username,
          password: formData.password,
          rememberMe: true,
        }),
      });
      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.error?.message || 'Login failed');
      }

      // Fetch my-profile
      const profRes = await fetch(`${API_BASE}/api/account/my-profile`, { credentials: 'include' });
      if (!profRes.ok) throw new Error('Cannot fetch profile');
      const userData = await profRes.json();

      const userInfo = {
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phoneNumber: userData.phoneNumber,
        profileImage: userData.profilePictureUrl || '',
      };

      setCurrentUser(userInfo);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/homepage');
    } catch (err) {
      console.error(err);
      setError('Giriş başarısız: ' + err.message);
    }
  };

  // --- SIGNUP + CREATE PROFILE handler ---
  const handleSignup = async e => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    try {
      // Boot XSRF cookie
      await fetch(`${API_BASE}/api/abp/application-configuration`, { credentials: 'include' });
      const xsrf = getCookie('XSRF-TOKEN');
      if (!xsrf) throw new Error('XSRF token not found');

      // 1) Register ABP user
      const regRes = await fetch(`${API_BASE}/api/account/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          accept: 'text/plain',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          userName: formData.username,
          emailAddress: formData.email,
          password: formData.password,
          appName: 'IlkKontaktApp',
          extraProperties: {
            name: formData.name,
            surname: formData.surname,
            phoneNumber: formData.phoneNumber,
          },
        }),
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.error?.message || 'Kayıt başarısız');
      }

      // 2) Login so cookies & XSRF are set
      const loginRes = await fetch(`${API_BASE}/api/account/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          userNameOrEmailAddress: formData.username,
          password: formData.password,
          rememberMe: true,
        }),
      });
      if (!loginRes.ok) throw new Error('Auto-login failed');

      // 3) Fetch my-profile to get the new userId
      const profRes = await fetch(`${API_BASE}/api/account/my-profile`, { credentials: 'include' });
      if (!profRes.ok) throw new Error('Profil alınamadı');
      const userData = await profRes.json();

      const userInfo = {
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phoneNumber: userData.phoneNumber,
        profileImage: '',
      };
      setCurrentUser(userInfo);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      localStorage.setItem('isAuthenticated', 'true');

      // 4) Create the UserProfile entry
      const createProfRes = await fetch(`${API_BASE}/api/app/user-profile`, {
        credentials: 'include'
      });
      if (!createProfRes.ok) {
        console.warn('Profil oluşturulurken hata:', await createProfRes.text());
      }

      navigate('/homepage');
    } catch (err) {
      console.error(err);
      setError('Kayıt Hatası: ' + err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-card ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
        <h2>{isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        {error && <div className="error-message">{error}</div>}

        {isLoginMode ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label><User size={18} /> Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                placeholder="Kullanıcı adınızı girin"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><Lock size={18} /> Şifre</label>
              <input
                type="password"
                name="password"
                placeholder="Şifrenizi girin"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-button">Giriş Yap</button>
            <p className="toggle-text">
              Henüz bizi tanımıyor musunuz?{' '}
              <span className="toggle-link" onClick={() => setIsLoginMode(false)}>
                Hemen kayıt olun!
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-form">
            <div className="form-group">
              <label><User size={18} /> Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                placeholder="Kullanıcı adınızı belirleyin"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><UserCircle size={18} /> Ad</label>
              <input
                type="text"
                name="name"
                placeholder="Adınızı girin"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><UserCircle size={18} /> Soyad</label>
              <input
                type="text"
                name="surname"
                placeholder="Soyadınızı girin"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><Mail size={18} /> E-posta</label>
              <input
                type="email"
                name="email"
                placeholder="E-posta adresinizi girin"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><Phone size={18} /> Telefon</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Telefon numaranızı girin"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><Lock size={18} /> Şifre</label>
              <input
                type="password"
                name="password"
                placeholder="Şifrenizi belirleyin"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label><CheckCircle size={18} /> Şifre Tekrar</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Hakkında</label>
              <textarea
                name="about"
                placeholder="Kendinizden kısaca bahsedin"
                value={formData.about}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Adres</label>
              <input
                type="text"
                name="address"
                placeholder="Adresinizi girin"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Doğum Tarihi</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="login-button">Kayıt Ol</button>
            <p className="toggle-text">
              Zaten hesabınız var mı?{' '}
              <span className="toggle-link" onClick={() => setIsLoginMode(true)}>
                Giriş yapın
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
