import React, { useState, useEffect, useRef } from 'react'
import {
  Edit,
  Camera,
  X,
  Save,
  Info,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../page_layout/Layout'
import ProfileImage from './Profile-img'
import '../../component-styles/ProfilePage.css'

const API_BASE = 'https://localhost:44388'
const PROFILE_BY_USER = `${API_BASE}/api/app/user-profile/by-user`
const PROFILE_ROOT = `${API_BASE}/api/app/user-profile`
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`
const EDUCATION_ROOT = `${API_BASE}/api/app/education`
const SKILL_ROOT = `${API_BASE}/api/app/skill`
const LANGUAGE_ROOT = `${API_BASE}/api/app/language`
const PROJECT_ROOT = `${API_BASE}/api/app/project`

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FullTime', label: 'Full Time' },
  { value: 'PartTime', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' }
]

// Mirror of your enum; adjust labels as you wish:
const EDUCATION_DEGREE_OPTIONS = [
  { value: 'HighSchoolDiploma', label: 'High School Diploma' },
  { value: 'BachelorOfArts', label: 'Bachelor of Arts' },
  { value: 'BachelorOfScience', label: 'Bachelor of Science' },
  { value: 'BachelorOfFineArts', label: 'Bachelor of Fine Arts' },
  { value: 'BachelorOfEngineering', label: 'Bachelor of Engineering' },
  { value: 'BachelorOfBusinessAdministration', label: 'BBA' },
  { value: 'MasterOfArts', label: 'Master of Arts' },
  { value: 'MasterOfScience', label: 'Master of Science' },
  { value: 'MasterOfFineArts', label: 'Master of Fine Arts' },
  { value: 'MasterOfEngineering', label: 'Master of Engineering' },
  { value: 'MasterOfBusinessAdministration', label: 'MBA' },
  { value: 'DoctorOfPhilosophy', label: 'PhD' },
  { value: 'DoctorOfMedicine', label: 'MD' },
  { value: 'DoctorOfEducation', label: 'EdD' }
]

function getProficiencyLabel(level) {
  switch(level) {
    case 1: return "Başlangıç (1/5)";
    case 2: return "Temel (2/5)";
    case 3: return "Orta (3/5)";
    case 4: return "İleri (4/5)";
    case 5: return "Uzman (5/5)";
    default: return "Seviye seçiniz";
  }
}

const LANGUAGE_PROFICIENCY_OPTIONS = [
  { value: 'Elementary',          label: 'Elementary' },
  { value: 'LimitedWorking',      label: 'Limited Working' },
  { value: 'ProfessionalWorking', label: 'Professional Working' },
  { value: 'Fluent',              label: 'Fluent' },
  { value: 'Native',              label: 'Native' },
]

// Map numeric 1–5 to enum keys
const SKILL_ENUM = ['One', 'Two', 'Three', 'Four', 'Five']

// Helper to read XSRF cookie
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? m[2] : null
}

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  // PROFILE
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    about: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    profilePictureUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // EXPERIENCES
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
    employmentType: 'FullTime'
  })
  const [showExpModal, setShowExpModal] = useState(false)
  const [editingExp, setEditingExp] = useState(false)
  const [currentExp, setCurrentExp] = useState(null)

  // EDUCATIONS
  const [educations, setEducations] = useState([])
  const [eduLoading, setEduLoading] = useState(false)
  const [eduError, setEduError] = useState('')
  const [newEdu, setNewEdu] = useState({
    instutionName: '',
    degree: 'HighSchoolDiploma',
    startDate: '',
    endDate: '',
    gpa: '',
    description: '',
    isCurrentStudy: false
  })
  const [showEduModal, setShowEduModal] = useState(false)
  const [editingEdu, setEditingEdu] = useState(false)
  const [currentEdu, setCurrentEdu] = useState(null)

  // SKILLS
  const [skills, setSkills] = useState([])
  const [skillLoading, setSkillLoading] = useState(false)
  const [skillError, setSkillError] = useState('')
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiencyValue: 0
  })  // newSkill holds the name + numeric proficiency (0–5)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(false)
  const [currentSkill, setCurrentSkill] = useState(null)

  // LANGUAGES state
  const [languages, setLanguages] = useState([])
  const [langLoading,  setLangLoading]  = useState(false)
  const [langError,    setLangError]    = useState('')
  const [newLang,      setNewLang]      = useState({
    languageName: '',
    languageProficiency:
      LANGUAGE_PROFICIENCY_OPTIONS[0].value,
  })
  const [showLangModal,  setShowLangModal]  = useState(false)
  const [editingLang,    setEditingLang]    = useState(false)
  const [currentLang,    setCurrentLang]    = useState(null)

  // PROJECTS state
  const [projects,      setProjects]      = useState([])
  const [projLoading,   setProjLoading]   = useState(false)
  const [projError,     setProjError]     = useState('')
  const [newProj,       setNewProj]       = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    projectUrl: ''
  })
  const [showProjModal,   setShowProjModal]   = useState(false)
  const [editingProj,     setEditingProj]     = useState(false)
  const [currentProj,     setCurrentProj]     = useState(null)

  // load profile
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
          profilePictureUrl: dto.profilePictureUrl || ''
        })
      } else if (res.status === 404) {
        setProfile(null)
        setForm({
          about: '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          address: '',
          birthday: '',
          profilePictureUrl: currentUser.profileImage || ''
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

  // when we have a profile, fetch experiences & educations
  useEffect(() => {
    if (profile && profile.id) {
      fetchExperiences()
      fetchEducations()
      fetchLanguages()
      fetchProjects()
      fetchSkills()
    }
    // eslint-disable-next-line
  }, [profile])

  // --- SKILLS HANDLERS ---

  async function fetchSkills() {
    setSkillLoading(true)
    setSkillError('')
    try {
      const res = await fetch(
        `${SKILL_ROOT}?ProfileId=${profile.id}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Could not load skills')
      const data = await res.json()
      setSkills(data.items || [])
    } catch (e) {
      setSkillError(e.message)
    } finally {
      setSkillLoading(false)
    }
  }

  function openAddSkill() {
    setEditingSkill(false)
    setCurrentSkill(null)
    setNewSkill({ skillName: '', proficiencyValue: 0 })
    setShowSkillModal(true)
  }

  function openEditSkill(skill) {
    setEditingSkill(true);
    setCurrentSkill(skill);
    // derive numeric from enum key - add 1 because array is 0-indexed but our UI is 1-5
    const idx = SKILL_ENUM.indexOf(skill.skillProficiency) + 1;
    setNewSkill({ 
      skillName: skill.skillName, 
      proficiencyValue: idx 
    });
    setShowSkillModal(true);
  }


  function handleSkillNameChange(e) {
    setNewSkill(sk => ({ ...sk, skillName: e.target.value }))
  }

  function handleSkillProficiency(n) {
    setNewSkill(sk => ({ ...sk, proficiencyValue: n }))
  }

  async function handleSaveSkill(e) {
    e.preventDefault();
    setSkillError('');
    try {
      // fetch xsrf
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include'
      });
      const xsrf = getCookie('XSRF-TOKEN');
      if (!xsrf) throw new Error('XSRF token not found');
      
      // Make sure we have a valid proficiency value
      if (newSkill.proficiencyValue < 1 || newSkill.proficiencyValue > 5) {
        throw new Error('Please select a proficiency level');
      }
      
      // build payload
      const payload = {
        profileId: profile.id,
        skillName: newSkill.skillName,
        skillProficiency: SKILL_ENUM[newSkill.proficiencyValue - 1]
      };
      
      let url, method;
      if (editingSkill && currentSkill) {
        url = `${SKILL_ROOT}/${currentSkill.id}`;
        method = 'PUT';
      } else {
        url = SKILL_ROOT;
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrf,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'Failed to save skill');
      }
      
      await fetchSkills(); // Await before closing modal
      setShowSkillModal(false);
    } catch (e) {
      setSkillError(e.message);
    }
  }

  // --- LANGUAGES ---
  async function fetchLanguages() {
    setLangLoading(true)
    setLangError('')
    try {
      const res = await fetch(
        `${LANGUAGE_ROOT}?ProfileId=${profile.id}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error(
        'Diller yüklenemedi'
      )
      const data = await res.json()
      setLanguages(data.items || [])
    } catch (e) {
      setLangError(e.message)
    } finally {
      setLangLoading(false)
    }
  }
  function openAddLang() {
    setEditingLang(false)
    setNewLang({
      languageName: '',
      languageProficiency:
        LANGUAGE_PROFICIENCY_OPTIONS[0].value
    })
    setShowLangModal(true)
  }
  function openEditLang(lang) {
    setEditingLang(true)
    setCurrentLang(lang)
    setNewLang({
      languageName: lang.languageName,
      languageProficiency:
        lang.languageProficiency
    })
    setShowLangModal(true)
  }
  function handleLangInput(e) {
    const { name, value } = e.target
    setNewLang(l => ({ ...l, [name]: value }))
  }
  async function handleSaveLang(e) {
    e.preventDefault()
    setLangError('')
    try {
      await fetch(
        `${API_BASE}/api/abp/application-configuration`,
        { credentials: 'include' }
      )
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error(
        'XSRF token not found'
      )
      const payload = {
        ...newLang,
        profileId: profile.id
      }
      let res
      if (editingLang && currentLang) {
        res = await fetch(
          `${LANGUAGE_ROOT}/${currentLang.id}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              accept: 'application/json',
              'Content-Type':
                'application/json',
              RequestVerificationToken: xsrf,
              'X-Requested-With':
                'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
          }
        )
      } else {
        res = await fetch(LANGUAGE_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type':
              'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With':
              'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      }
      if (!res.ok) throw new Error(
        'Dil kaydı başarısız'
      )
      setShowLangModal(false)
      fetchLanguages()
    } catch (e) {
      setLangError(e.message)
    }
  }

  // --- PROJECTS ---
  async function fetchProjects() {
    setProjLoading(true)
    setProjError('')
    try {
      const res = await fetch(
        `${PROJECT_ROOT}?ProfileId=${profile.id}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error(
        'Projeler yüklenemedi'
      )
      const data = await res.json()
      setProjects(data.items || [])
    } catch (e) {
      setProjError(e.message)
    } finally {
      setProjLoading(false)
    }
  }
  function openAddProj() {
    setEditingProj(false)
    setNewProj({
      projectName: '',
      description: '',
      startDate: '',
      endDate: '',
      projectUrl: ''
    })
    setShowProjModal(true)
  }
  function openEditProj(p) {
    setEditingProj(true)
    setCurrentProj(p)
    setNewProj({
      projectName: p.projectName,
      description: p.description,
      startDate: p.startDate.split('T')[0],
      endDate: p.endDate
        ? p.endDate.split('T')[0]
        : '',
      projectUrl: p.projectUrl || ''
    })
    setShowProjModal(true)
  }
  function handleProjInput(e) {
    const { name, value } = e.target
    setNewProj(p => ({ ...p, [name]: value }))
  }
  async function handleSaveProj(e) {
    e.preventDefault()
    setProjError('')
    try {
      await fetch(
        `${API_BASE}/api/abp/application-configuration`,
        { credentials: 'include' }
      )
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error(
        'XSRF token not found'
      )
      const payload = {
        ...newProj,
        profileId: profile.id,
        startDate: new Date(newProj.startDate),
        endDate: newProj.endDate
          ? new Date(newProj.endDate)
          : null
      }
      let res
      if (editingProj && currentProj) {
        res = await fetch(
          `${PROJECT_ROOT}/${currentProj.id}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              accept: 'application/json',
              'Content-Type':
                'application/json',
              RequestVerificationToken: xsrf,
              'X-Requested-With':
                'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
          }
        )
      } else {
        res = await fetch(PROJECT_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type':
              'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With':
              'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      }
      if (!res.ok) throw new Error(
        'Proje kaydı başarısız'
      )
      setShowProjModal(false)
      fetchProjects()
    } catch (e) {
      setProjError(e.message)
    }
  }

  // --- EXPERIENCES HANDLERS ---
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

  function openAddExp() {
    setEditingExp(false)
    setNewExp({
      title: '',
      companyName: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentPosition: false,
      description: '',
      employmentType: 'FullTime'
    })
    setShowExpModal(true)
  }

  function openEditExp(exp) {
    setEditingExp(true)
    setCurrentExp(exp)
    setNewExp({
      title: exp.title,
      companyName: exp.companyName,
      location: exp.location,
      startDate: exp.startDate.split('T')[0],
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrentPosition: exp.isCurrentPosition,
      description: exp.description,
      employmentType: exp.employmentType
    })
    setShowExpModal(true)
  }

  function handleExpInput(e) {
    const { name, value, type, checked } = e.target
    setNewExp(exp => ({
      ...exp,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSaveExp(e) {
    e.preventDefault()
    setExpError('')
    try {
      // XSRF
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include'
      })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      const payload = {
        ...newExp,
        profileId: profile.id,
        startDate: new Date(newExp.startDate),
        endDate: newExp.endDate ? new Date(newExp.endDate) : null
      }

      let res
      if (editingExp && currentExp) {
        res = await fetch(`${EXPERIENCE_ROOT}/${currentExp.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(EXPERIENCE_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error('Deneyim kaydı başarısız')
      setShowExpModal(false)
      fetchExperiences()
    } catch (e) {
      setExpError(e.message)
    }
  }

  // --- EDUCATIONS HANDLERS ---
  async function fetchEducations() {
    setEduLoading(true)
    setEduError('')
    try {
      const res = await fetch(
        `${EDUCATION_ROOT}?ProfileId=${profile.id}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Eğitimler yüklenemedi')
      const data = await res.json()
      setEducations(data.items || [])
    } catch (e) {
      setEduError(e.message)
    } finally {
      setEduLoading(false)
    }
  }

  function openAddEdu() {
    setEditingEdu(false)
    setNewEdu({
      instutionName: '',
      degree: 'HighSchoolDiploma',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
      isCurrentStudy: false
    })
    setShowEduModal(true)
  }

  function openEditEdu(ed) {
    setEditingEdu(true)
    setCurrentEdu(ed)
    setNewEdu({
      instutionName: ed.instutionName,
      degree: ed.degree,
      startDate: ed.startDate.split('T')[0],
      endDate: ed.endDate ? ed.endDate.split('T')[0] : '',
      gpa: ed.gpa || '',
      description: ed.description || '',
      isCurrentStudy: !ed.endDate
    })
    setShowEduModal(true)
  }

  function handleEduInput(e) {
    const { name, value, type, checked } = e.target;
    setNewEdu(ed => ({
      ...ed,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSaveEdu(e) {
    e.preventDefault()
    setEduError('')
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, { credentials: 'include' })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      const payload = {
        ...newEdu,
        profileId: profile.id,
        startDate: new Date(newEdu.startDate),
        // if currently studying, send null; else parse date
        endDate: newEdu.isCurrentStudy
          ? null
          : newEdu.endDate
          ? new Date(newEdu.endDate)
          : null,
        gpa: parseFloat(newEdu.gpa)
      }

      let res
      if (editingEdu && currentEdu) {
        res = await fetch(`${EDUCATION_ROOT}/${currentEdu.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(EDUCATION_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error('Eğitim kaydı başarısız')
      setShowEduModal(false)
      fetchEducations()
    } catch (e) {
      setEduError(e.message)
    }
  }

  // --- PROFILE HANDLERS (unchanged) ---
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  const handleFileChange = e => {
    const f = e.target.files[0]
    if (!f) return
    setForm(f0 => ({
      ...f0,
      profilePictureUrl: URL.createObjectURL(f),
      _file: f
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
        birthday: profile.birthday
          ? profile.birthday.split('T')[0]
          : '',
        profilePictureUrl: profile.profilePictureUrl || ''
      })
    }
    setIsEditing(false)
  }
  const handleSave = async () => {
    setError('')
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: 'include'
      })
      const xsrf = getCookie('XSRF-TOKEN')
      if (!xsrf) throw new Error('XSRF token not found')

      const payload = {
        about: form.about,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        birthday: form.birthday
          ? new Date(form.birthday)
          : null,
        profilePictureUrl: form.profilePictureUrl
      }

      let res
      if (!profile) {
        res = await fetch(PROFILE_ROOT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(
          `${PROFILE_ROOT}/${profile.id}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              RequestVerificationToken: xsrf,
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
          }
        )
      }
      if (!res.ok) {
        throw new Error('Kaydetme başarısız: ' + res.status)
      }
      const updated = await res.json()
      setProfile(updated)
      setForm({
        about: updated.about || '',
        email: updated.email || '',
        phoneNumber: updated.phoneNumber || '',
        address: updated.address || '',
        birthday: updated.birthday
          ? updated.birthday.split('T')[0]
          : '',
        profilePictureUrl: updated.profilePictureUrl || ''
      })
      setIsEditing(false)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div>Profil yükleniyor…</div>

  return (
    <Layout>
      {/* PROFILE CARD */}
      <section className="profile-section">
        <div className="profile-card">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="profile-image-container">
            <ProfileImage src={form.profilePictureUrl} />
            {(isEditing || !profile) && (
              <>
                <button
                  className="change-photo-btn"
                  onClick={() =>
                    fileInputRef.current.click()
                  }
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
              <input
                type="text"
                name="profilePictureUrl"
                placeholder="Profil Fotoğrafı URL"
                value={form.profilePictureUrl}
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
                <button
                  className="save-profile-btn"
                  onClick={handleSave}
                >
                  <Save size={18} /> Kaydet
                </button>
                {profile && (
                  <button
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
              <h3 id="profile-name">
                {currentUser.userName}
              </h3>
              <div className="profile-info-list">
                <div>
                  <Info size={16} />
                  <span>{profile.about}</span>
                </div>
                <div>
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
                <div>
                  <Phone size={16} />
                  <span>{profile.phoneNumber}</span>
                </div>
                <div>
                  <MapPin size={16} />
                  <span>{profile.address}</span>
                </div>
                <div>
                  <Calendar size={16} />
                  <span>
                    {profile.birthday
                      ? new Date(
                          profile.birthday
                        ).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  id="edit-profile-btn"
                  onClick={handleEdit}
                >
                  <Edit size={18} /> Düzenle
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="experience-section">
        <h2>Deneyimler</h2>
        {expError && (
          <div className="error-message">
            {expError}
          </div>
        )}
        {expLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="experiences-grid">
            {experiences.map(exp => (
              <div
                className="experience-card"
                key={exp.id}
              >
                <div className="experience-card-header">
                  <span className="experience-title">
                    {exp.title}
                  </span>
                  <span className="experience-company">
                    @ {exp.companyName}
                  </span>
                  <button
                    className="edit-btn"
                    onClick={() => openEditExp(exp)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="experience-dates">
                  {new Date(
                    exp.startDate
                  ).toLocaleDateString()}{' '}
                  -{' '}
                  {exp.isCurrentPosition
                    ? 'Devam Ediyor'
                    : exp.endDate
                    ? new Date(
                        exp.endDate
                      ).toLocaleDateString()
                    : ''}
                </div>
                <div className="experience-location">
                  {exp.location}
                </div>
                <div className="experience-type">
                  {
                    EMPLOYMENT_TYPE_OPTIONS.find(
                      o =>
                        o.value === exp.employmentType
                    )?.label
                  }
                </div>
                <div className="experience-description">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        )}
        {profile && (
          <div className="add-experience-btn-row">
            <button
              className="add-experience-btn"
              onClick={openAddExp}
            >
              + Yeni Deneyim Ekle
            </button>
          </div>
        )}
      </section>

      {/* EDUCATION SECTION */}
      <section className="experience-section">
        <h2>Eğitim Bilgileri</h2>
        {eduError && (
          <div className="error-message">
            {eduError}
          </div>
        )}
        {eduLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="experiences-grid">
            {educations.map(ed => (
              <div
                className="experience-card"
                key={ed.id}
              >
                <div className="experience-card-header">
                  <span className="experience-title">
                    {ed.instutionName}
                  </span>
                  <span className="experience-company">
                    {EDUCATION_DEGREE_OPTIONS.find(
                      o => o.value === ed.degree
                    )?.label}
                  </span>
                  <button
                    className="edit-btn"
                    onClick={() => openEditEdu(ed)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="experience-dates">
                  {new Date(
                    ed.startDate
                  ).toLocaleDateString()}{' '}
                  -{' '}
                  {ed.endDate
                    ? new Date(
                        ed.endDate
                      ).toLocaleDateString()
                    : 'Devam Ediyor'}
                </div>
                <div className="experience-description">
                  GPA: {ed.gpa?.toFixed(2) || '-'}<br />
                  {ed.description}
                </div>
              </div>
            ))}
          </div>
        )}
        {profile && (
          <div className="add-experience-btn-row">
            <button
              className="add-experience-btn"
              onClick={openAddEdu}
            >
              + Yeni Eğitim Ekle
            </button>
          </div>
        )}
      </section>

      {/* SKILL SECTION */}
      <section className="skill-section">
        <h2>Yetenekler</h2>
        {skillError && <div className="error-message">{skillError}</div>}
        {skillLoading
          ? <div>Yükleniyor...</div>
          : <div className="skills-grid">
              {skills.map((sk) => {
                // Use the number directly
                let level = Number(sk.skillProficiency);
                if (isNaN(level) || level < 1 || level > 5) level = 1; // fallback

                return (
                  <div key={sk.id} className="skill-card">
                    <div className="skill-card-header">
                      <span className="skill-name">{sk.skillName}</span>
                      <button className="edit-btn" onClick={() => openEditSkill(sk)}>
                        <Edit size={16}/>
                      </button>
                    </div>
                    <div className="skill-proficiency-text">
                      {getProficiencyLabel(level)}
                    </div>
                  </div>
                );
              })}
            </div>
        }
        {profile && (
          <div className="add-skill-btn-row">
            <button className="add-skill-btn" onClick={openAddSkill}>
              + Yeni Yetenek Ekle
            </button>
          </div>
        )}
      </section>

      {/* LANGUAGE SECTION */}
      <section className="language-section">
        <h2>Diller</h2>
        {langError && <div className="error-message">{langError}</div>}
        {langLoading
          ? <div>Yükleniyor...</div>
          : <div className="languages-grid">
              {languages.map((l) => {
                // Find the label for this proficiency level
                const proficiencyLabel = LANGUAGE_PROFICIENCY_OPTIONS.find(
                  opt => opt.value === l.languageProficiency
                )?.label || l.languageProficiency;
                
                return (
                  <div key={l.id} className="language-card">
                    <div className="language-card-header">
                      <span className="language-name">{l.languageName}</span>
                      <button className="edit-btn"
                              onClick={() => openEditLang(l)}>
                        <Edit size={16}/>
                      </button>
                    </div>
                    <div className="language-proficiency-text">
                      Seviye: {proficiencyLabel + 1}/5  
                    </div>
                  </div>
                );
              })}
            </div>
        }
        {profile && (
          <div className="add-language-btn-row">
            <button className="add-language-btn" onClick={openAddLang}>
              + Yeni Dil Ekle
            </button>
          </div>
        )}
      </section>

      {/* PROJECT SECTION */}
      <section className="project-section">
        <h2>Projeler</h2>
        {projError && (
          <div className="error-message">
            {projError}
          </div>
        )}
        {projLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => (
              <div
                key={p.id}
                className="project-card"
              >
                <div className="project-card-header">
                  <span className="project-name">
                    {p.projectName}
                  </span>
                  <button
                    className="edit-btn"
                    onClick={() => openEditProj(p)}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="project-dates">
                  {new Date(
                    p.startDate
                  ).toLocaleDateString()}{' '}
                  -{' '}
                  {p.endDate
                    ? new Date(
                        p.endDate
                      ).toLocaleDateString()
                    : 'Devam Ediyor'}
                </div>
                <div className="project-description">
                  {p.description}
                </div>
                {p.projectUrl && (
                  <div className="project-link">
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.projectUrl}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {profile && (
          <div className="add-project-btn-row">
            <button
              className="add-project-btn"
              onClick={openAddProj}
            >
              + Yeni Proje Ekle
            </button>
          </div>
        )}
      </section>

      {/* EXPERIENCE MODAL */}
      {showExpModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowExpModal(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() =>
                setShowExpModal(false)
              }
            >
              <X size={22} />
            </button>
            <form
              className="experience-form"
              onSubmit={handleSaveExp}
            >
              <h3>
                {editingExp
                  ? 'Deneyimi Düzenle'
                  : 'Yeni Deneyim Ekle'}
              </h3>
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
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
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
                disabled={
                  newExp.isCurrentPosition
                }
              />
              <label>
                <input
                  type="checkbox"
                  name="isCurrentPosition"
                  checked={
                    newExp.isCurrentPosition
                  }
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
              <button
                type="submit"
                className="save-profile-btn"
                style={{ marginTop: 8 }}
              >
                <Save size={18} />{' '}
                {editingExp ? 'Güncelle' : 'Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {showEduModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEduModal(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() =>
                setShowEduModal(false)
              }
            >
              <X size={22} />
            </button>
            <form
              className="experience-form"
              onSubmit={handleSaveEdu}
            >
              <h3>
                {editingEdu
                  ? 'Eğitimi Düzenle'
                  : 'Yeni Eğitim Ekle'}
              </h3>
              <input
                type="text"
                name="instutionName"
                placeholder="Kurum Adı"
                value={newEdu.instutionName}
                onChange={handleEduInput}
                required
              />
              <select
                name="degree"
                value={newEdu.degree}
                onChange={handleEduInput}
                required
              >
                {EDUCATION_DEGREE_OPTIONS.map(
                  opt => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  )
                )}
              </select>
              <input
                type="date"
                name="startDate"
                value={newEdu.startDate}
                onChange={handleEduInput}
                required
              />
              <input
                type="date"
                name="endDate"
                value={newEdu.endDate}
                onChange={handleEduInput}
                disabled={newEdu.isCurrentStudy}
              />
              <label>
                <input
                  type="checkbox"
                  name="isCurrentStudy"
                  checked={newEdu.isCurrentStudy}
                  onChange={handleEduInput}
                />
                Halen burada okuyorum
              </label>
              <input
                type="number"
                name="gpa"
                step="0.01"
                placeholder="GPA"
                value={newEdu.gpa}
                onChange={handleEduInput}
              />
              <textarea
                name="description"
                placeholder="Açıklama"
                value={newEdu.description}
                onChange={handleEduInput}
              />
              <button
                type="submit"
                className="save-profile-btn"
                style={{ marginTop: 8 }}
              >
                <Save size={18} />{' '}
                {editingEdu ? 'Güncelle' : 'Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SKILL MODAL */}
      {showSkillModal && (
        <div className="modal-overlay" onClick={() => setShowSkillModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowSkillModal(false)}
            >
              <X size={22} />
            </button>
            <form className="experience-form" onSubmit={handleSaveSkill}>
              <h3>{editingSkill ? 'Yetenek Düzenle' : 'Yeni Yetenek Ekle'}</h3>
              <input
                type="text"
                name="skillName"
                placeholder="Yetenek Adı"
                value={newSkill.skillName}
                onChange={handleSkillNameChange}
                required
              />
              
              <div className="skill-proficiency-selector">
                <label>Yetenek Seviyesi:</label>
                <div className="proficiency-dots">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`dot-button ${n <= newSkill.proficiencyValue ? 'filled' : ''}`}
                      onClick={() => handleSkillProficiency(n)}
                    >
                      <span className="dot"></span>
                    </button>
                  ))}
                </div>
                <div className="proficiency-label">
                  {getProficiencyLabel(newSkill.proficiencyValue)}
                </div>
              </div>
              
              <button type="submit" className="save-profile-btn">
                <Save size={18} /> {editingSkill ? 'Güncelle' : 'Ekle'}
              </button>
              {skillError && <div className="error-message">{skillError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* LANGUAGE MODAL */}
      {showLangModal && (
        <div className="modal-overlay" onClick={() => setShowLangModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn"
                    onClick={() => setShowLangModal(false)}>
              <X size={22}/>
            </button>
            <form className="experience-form" onSubmit={handleSaveLang}>
              <h3>{editingLang ? 'Dili Düzenle' : 'Yeni Dil Ekle'}</h3>
              <input type="text"
                    name="languageName"
                    placeholder="Dil Adı"
                    value={newLang.languageName}
                    onChange={handleLangInput}
                    required />
              <select name="languageProficiency"
                      value={newLang.languageProficiency}
                      onChange={handleLangInput}
                      required>
                {LANGUAGE_PROFICIENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="save-profile-btn">
                <Save size={18}/> {editingLang ? 'Güncelle' : 'Ekle'}
              </button>
              {langError && <div className="error-message">{langError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProjModal(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() =>
                setShowProjModal(false)
              }
            >
              <X size={22} />
            </button>
            <form
              className="experience-form"
              onSubmit={handleSaveProj}
            >
              <h3>
                {editingProj
                  ? 'Projeyi Düzenle'
                  : 'Yeni Proje Ekle'}
              </h3>
              <input
                type="text"
                name="projectName"
                placeholder="Proje Adı"
                value={newProj.projectName}
                onChange={handleProjInput}
                required
              />
              <textarea
                name="description"
                placeholder="Açıklama"
                value={newProj.description}
                onChange={handleProjInput}
              />
              <input
                type="date"
                name="startDate"
                value={newProj.startDate}
                onChange={handleProjInput}
                required
              />
              <input
                type="date"
                name="endDate"
                value={newProj.endDate}
                onChange={handleProjInput}
              />
              <input
                type="url"
                name="projectUrl"
                placeholder="Proje URL"
                value={newProj.projectUrl}
                onChange={handleProjInput}
              />
              <button
                type="submit"
                className="save-profile-btn"
              >
                <Save size={18} />{' '}
                {editingProj
                  ? 'Güncelle'
                  : 'Ekle'}
              </button>
              {projError && (
                <div className="error-message">
                  {projError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
