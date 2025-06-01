// src/components/profile/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Lock,
  Mail,
  CheckCircle,
  Building,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import '../../component-styles/LoginPage.css'

const API_BASE = 'https://localhost:44388'

// Helper to get an XSRF cookie by name
function getCookie(name) {
  const m = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  )
  return m ? m[2] : null
}

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isCompanySignup, setIsCompanySignup] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    companyName: '', // Only for company signup
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((fd) => ({ ...fd, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      companyName: '',
    })
    setError('')
  }

  const switchMode = (loginMode, companyMode = false) => {
    setIsLoginMode(loginMode)
    setIsCompanySignup(companyMode)
    resetForm()
  }

  // ---------- LOGIN ----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Boot XSRF cookie
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include',
      })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      // Login
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
      })
      if (!loginRes.ok) {
        const err = await loginRes.json()
        throw new Error(err.error?.message || 'Login failed')
      }

      // Fetch my-profile
      const profRes = await fetch(
        `${API_BASE}/api/account/my-profile`,
        { credentials: 'include' }
      )
      if (!profRes.ok) throw new Error('Cannot fetch profile')
      const userData = await profRes.json()

      const userInfo = {
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phoneNumber: userData.phoneNumber,
        profileImage: userData.profilePictureUrl || '',
        isCompanyProfile: userData.extraProperties?.IsCompanyProfile || false,
      }
      setCurrentUser(userInfo)
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      localStorage.setItem('isAuthenticated', 'true')
      navigate('/homepage')
    } catch (err) {
      console.error(err)
      setError('Giriş başarısız: ' + err.message)
    }
  }

  // ---------- SIGNUP ----------
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!')
      return
    }

    // For company signup, validate company name
    if (isCompanySignup && !formData.companyName.trim()) {
      setError('Şirket adı gereklidir!')
      return
    }

    try {
      // 1) Boot XSRF cookie
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include',
      })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      // 2) Prepare registration data
      const registrationData = {
        userName: isCompanySignup ? formData.companyName : formData.username,
        emailAddress: formData.email,
        password: formData.password,
        appName: 'IlkKontaktApp',
        extraProperties: {
          IsCompanyProfile: isCompanySignup,
        },
      }

      // 3) Register via /api/account/register
      const regRes = await fetch(`${API_BASE}/api/account/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          accept: 'text/plain',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(registrationData),
      })
      if (!regRes.ok) {
        const err = await regRes.json()
        throw new Error(err.error?.message || 'Kayıt başarısız')
      }

      // 4) Auto-login
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
          userNameOrEmailAddress: isCompanySignup ? formData.companyName : formData.username,
          password: formData.password,
          rememberMe: true,
        }),
      })
      if (!loginRes.ok) throw new Error('Auto-login failed')

      // 5) Fetch my-profile
      const profRes = await fetch(
        `${API_BASE}/api/account/my-profile`,
        { credentials: 'include' }
      )
      if (!profRes.ok) throw new Error('Profil alınamadı')
      const userData = await profRes.json()

      const userInfo = {
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        phoneNumber: userData.phoneNumber,
        profileImage: '',
        isCompanyProfile: userData.extraProperties?.IsCompanyProfile || false,
      }
      setCurrentUser(userInfo)
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      localStorage.setItem('isAuthenticated', 'true')

      // 6) Navigate to homepage
      navigate('/homepage')
    } catch (err) {
      console.error(err)
      setError('Kayıt Hatası: ' + err.message)
    }
  }

  const renderSignupForm = () => (
    <form onSubmit={handleSignup} className="login-form">
      {/* Account Type Selector */}
      <div className="form-group account-type-selector">
        <div className="account-type-buttons">
          <button
            type="button"
            className={`account-type-btn ${!isCompanySignup ? 'active' : ''}`}
            onClick={() => setIsCompanySignup(false)}
          >
            <User size={18} /> Bireysel Hesap
          </button>
          <button
            type="button"
            className={`account-type-btn ${isCompanySignup ? 'active' : ''}`}
            onClick={() => setIsCompanySignup(true)}
          >
            <Building size={18} /> Şirket Hesabı
          </button>
        </div>
      </div>

      {/* Username or Company Name */}
      <div className="form-group">
        <label>
          {isCompanySignup ? <Building size={18} /> : <User size={18} />} 
          {isCompanySignup ? ' Şirket Adı' : ' Kullanıcı Adı'}
        </label>
        <input
          type="text"
          name={isCompanySignup ? 'companyName' : 'username'}
          placeholder={isCompanySignup ? 'Şirket adınızı girin' : 'Kullanıcı adınızı belirleyin'}
          value={isCompanySignup ? formData.companyName : formData.username}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label>
          <Mail size={18} /> E-posta
        </label>
        <input
          type="email"
          name="email"
          placeholder="E-posta adresinizi girin"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Password */}
      <div className="form-group">
        <label>
          <Lock size={18} /> Şifre
        </label>
        <input
          type="password"
          name="password"
          placeholder="Şifrenizi belirleyin"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {/* Confirm Password */}
      <div className="form-group">
        <label>
          <CheckCircle size={18} /> Şifre Tekrar
        </label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Şifrenizi tekrar girin"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="login-button">
        {isCompanySignup ? 'Şirket Hesabı Oluştur' : 'Bireysel Hesap Oluştur'}
      </button>

      <p className="toggle-text">
        Zaten hesabınız var mı?{' '}
        <span
          className="toggle-link"
          onClick={() => switchMode(true)}
        >
          Giriş yapın
        </span>
      </p>
    </form>
  )

  return (
    <div className="login-wrapper">
      <div
        className={`login-card ${
          isLoginMode ? 'login-mode' : 'signup-mode'
        }`}
      >
        <h2>
          {isLoginMode 
            ? 'Giriş Yap' 
            : isCompanySignup 
              ? 'Şirket Hesabı Oluştur' 
              : 'Bireysel Hesap Oluştur'
          }
        </h2>
        {error && <div className="error-message">{error}</div>}

        {isLoginMode ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                <User size={18} /> Kullanıcı Adı
              </label>
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
              <label>
                <Lock size={18} /> Şifre
              </label>
              <input
                type="password"
                name="password"
                placeholder="Şifrenizi girin"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Giriş Yap
            </button>
            <p className="toggle-text">
              Henüz bizi tanımıyor musunuz?{' '}
              <span
                className="toggle-link"
                onClick={() => switchMode(false, false)}
              >
                Bireysel hesap oluşturun
              </span>{' '}
              veya{' '}
              <span
                className="toggle-link"
                onClick={() => switchMode(false, true)}
              >
                Şirket hesabı oluşturun
              </span>
            </p>
          </form>
        ) : (
          renderSignupForm()
        )}
      </div>
    </div>
  )
}