import React, { useState, useEffect, useRef } from 'react'
import {
  Edit, Camera, X, Save, Info, Mail, Phone, MapPin, Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../page_layout/Layout'
import ProfileImage from './Profile-img'
import '../../component-styles/ProfilePage.css'

const API_BASE = 'https://localhost:44388'
const PROFILE_BY_USER = `${API_BASE}/api/app/user-profile/by-user`
const PROFILE_ROOT = `${API_BASE}/api/app/user-profile`

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? m[2] : null
}

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    about: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    profilePictureUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // On mount: load profile or prepare for creation
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    loadProfile()
    // eslint-disable-next-line
  }, [currentUser])

  async function loadProfile() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(PROFILE_BY_USER, { credentials: 'include' })
      if (res.ok) {
        const dto = await res.json()
        setProfile(dto)
        setForm({
          about: dto.about || '',
          email: dto.email || '',
          phoneNumber: dto.phoneNumber || '',
          address: dto.address || '',
          birthday: dto.birthday ? dto.birthday.split('T')[0] : '',
          profilePictureUrl: dto.profilePictureUrl || '',
        })
      } else if (res.status === 404) {
        setProfile(null)
        setForm({
          about: '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          address: '',
          birthday: '',
          profilePictureUrl: currentUser.profileImage || '',
        })
      } else {
        throw new Error('Profil yüklenemedi: ' + res.status)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setForm((f0) => ({
      ...f0,
      profilePictureUrl: URL.createObjectURL(f),
      _file: f,
    }))
  }

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    if (profile) {
      setForm({
        about: profile.about || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
        profilePictureUrl: profile.profilePictureUrl || '',
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    setError('')
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include',
      })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      const payload = {
        about: form.about,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        birthday: form.birthday ? new Date(form.birthday) : null,
        profilePictureUrl: form.profilePictureUrl,
      }

      let res, updated
      if (!profile) {
        // Create
        res = await fetch(PROFILE_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        })
      } else {
        // Update
        res = await fetch(`${PROFILE_ROOT}/${profile.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        throw new Error('Kaydetme başarısız: ' + res.status)
      }
      updated = await res.json()
      setProfile(updated)
      setForm({
        about: updated.about || '',
        email: updated.email || '',
        phoneNumber: updated.phoneNumber || '',
        address: updated.address || '',
        birthday: updated.birthday ? updated.birthday.split('T')[0] : '',
        profilePictureUrl: updated.profilePictureUrl || '',
      })
      setIsEditing(false)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div>Profil yükleniyor…</div>

  return (
    <Layout>
      <section className="profile-section">
        <div className="profile-card">
          {error && <div className="error-message">{error}</div>}

          <div className="profile-image-container">
            <ProfileImage src={form.profilePictureUrl} />
            {(isEditing || !profile) && (
              <>
                <button
                  className="change-photo-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera size={20} strokeWidth={1.5} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>

          {/* Always show the form for create or edit */}
          {(isEditing || !profile) ? (
            <div className="profile-edit-form">
              <textarea
                name="about"
                placeholder="Hakkında"
                value={form.about}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={form.email}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Telefon"
                value={form.phoneNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Adres"
                value={form.address}
                onChange={handleChange}
              />
              <div className="date-input-group">
                <Calendar size={18} />
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-actions">
                <button className="save-profile-btn" onClick={handleSave}>
                  <Save size={18} /> Kaydet
                </button>
                {profile && (
                  <button
                    id="edit-profile-btn"
                    onClick={handleCancel}
                    style={{ marginLeft: 8 }}
                  >
                    <X size={18} /> Vazgeç
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <h3 id="profile-name">{currentUser.userName}</h3>
              <div className="profile-info-list">
                <div><Info size={16} /><span>{profile.about}</span></div>
                <div><Mail size={16} /><span>{profile.email}</span></div>
                <div><Phone size={16} /><span>{profile.phoneNumber}</span></div>
                <div><MapPin size={16} /><span>{profile.address}</span></div>
                <div><Calendar size={16} /><span>{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : ''}</span></div>
              </div>
              <div className="profile-actions">
                <button id="edit-profile-btn" onClick={handleEdit}>
                  <Edit size={18} /> Düzenle
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
