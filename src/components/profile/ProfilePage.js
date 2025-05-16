import React, { useState, useEffect, useRef } from 'react'
import {
  Edit, Camera, X, Save, Info, Mail, Phone, MapPin, Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../page_layout/Layout'
import ProfileImage from './Profile-img'
import '../../component-styles/ProfilePage.css'

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FullTime', label: 'Full Time' },
  { value: 'PartTime', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
]

const API_BASE = 'https://localhost:44388'
const PROFILE_BY_USER = `${API_BASE}/api/app/user-profile/by-user`
const PROFILE_ROOT = `${API_BASE}/api/app/user-profile`
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`
// Helper function to get cookies

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
  const [showExpModal, setShowExpModal] = useState(false);

  // Experience state
  const [experiences, setExperiences] = useState([])
  const [expLoading, setExpLoading] = useState(false)
  const [expError, setExpError] = useState('')
  const [newExp, setNewExp] = useState({
    title: '',
    companyName: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentPosition: false,
    description: '',
    employmentType: 'FullTime',
  })

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

  // Fetch experiences when profile is loaded
useEffect(() => {
  if (profile && profile.id) {
    fetchExperiences()
  }
  // eslint-disable-next-line
}, [profile])

async function fetchExperiences() {
  setExpLoading(true)
  setExpError('')
  try {
    const res = await fetch(
      `${EXPERIENCE_ROOT}?ProfileId=${profile.id}`,
      { credentials: 'include' }
    )
    if (!res.ok) throw new Error('Deneyimler yüklenemedi')
    const data = await res.json()
    setExperiences(data.items || [])
  } catch (e) {
    setExpError(e.message)
  } finally {
    setExpLoading(false)
  }
}

function handleExpInput(e) {
  const { name, value, type, checked } = e.target
  setNewExp((exp) => ({
    ...exp,
    [name]: type === 'checkbox' ? checked : value,
  }))
}

async function handleAddExperience(e) {
  e.preventDefault()
  setExpError('')
  try {
    await fetch(`${API_BASE}/api/abp/application-configuration`, {
      credentials: 'include',
    })
    const xsrf = getCookie('XSRF-TOKEN')
    if (!xsrf) throw new Error('XSRF token not found')

    const payload = {
      ...newExp,
      profileId: profile.id,
      startDate: newExp.startDate ? new Date(newExp.startDate) : null,
      endDate: newExp.endDate ? new Date(newExp.endDate) : null,
    }

    const res = await fetch(EXPERIENCE_ROOT, {
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
    if (!res.ok) throw new Error('Deneyim eklenemedi')
    setNewExp({
      title: '',
      companyName: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentPosition: false,
      description: '',
      employmentType: 'FullTime',
    })
    fetchExperiences()
  } catch (e) {
    setExpError(e.message)
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

      <section className="experience-section">
        <h2>Deneyimlerim</h2>
        {expError && <div className="error-message">{expError}</div>}
        {expLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="experiences-grid">
            {experiences.map((exp) => (
              <div className="experience-card" key={exp.id}>
                <div className="experience-card-header">
                  <span className="experience-title">{exp.title}</span>
                  <span className="experience-company">@ {exp.companyName}</span>
                </div>
                <div className="experience-dates">
                  {new Date(exp.startDate).toLocaleDateString()} -{' '}
                  {exp.isCurrentPosition
                    ? 'Devam Ediyor'
                    : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString()
                    : ''}
                </div>
                <div className="experience-location">{exp.location}</div>
                <div className="experience-type">
                  {EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === exp.employmentType)?.label || exp.employmentType}
                </div>
                <div className="experience-description">{exp.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Experience Button */}
        {profile && (
          <div className="add-experience-btn-row">
            <button
              className="add-experience-btn"
              onClick={() => setShowExpModal(true)}
            >
              + Yeni Deneyim Ekle
            </button>
          </div>
        )}

        {/* Add Experience Form */}
        {showExpModal && (
          <div className="modal-overlay" onClick={() => setShowExpModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowExpModal(false)}>
                <X size={22} />
              </button>
              <form className="experience-form" onSubmit={async (e) => {
                await handleAddExperience(e);
                setShowExpModal(false);
              }}>
                <h3>Yeni Deneyim Ekle</h3>
                <input
                  type="text"
                  name="title"
                  placeholder="Pozisyon"
                  value={newExp.title}
                  onChange={handleExpInput}
                  required
                />
                <input
                  type="text"
                  name="companyName"
                  placeholder="Şirket"
                  value={newExp.companyName}
                  onChange={handleExpInput}
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Lokasyon"
                  value={newExp.location}
                  onChange={handleExpInput}
                />
                <select
                  name="employmentType"
                  value={newExp.employmentType}
                  onChange={handleExpInput}
                  required
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="startDate"
                  value={newExp.startDate}
                  onChange={handleExpInput}
                  required
                />
                <input
                  type="date"
                  name="endDate"
                  value={newExp.endDate}
                  onChange={handleExpInput}
                  disabled={newExp.isCurrentPosition}
                />
                <label>
                  <input
                    type="checkbox"
                    name="isCurrentPosition"
                    checked={newExp.isCurrentPosition}
                    onChange={handleExpInput}
                  />
                  Halen bu pozisyonda çalışıyorum
                </label>
                <textarea
                  name="description"
                  placeholder="Açıklama"
                  value={newExp.description}
                  onChange={handleExpInput}
                />
                <button type="submit" className="save-profile-btn" style={{ marginTop: 8 }}>
                  <Save size={18} /> Ekle
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

    </Layout>
  )
}
