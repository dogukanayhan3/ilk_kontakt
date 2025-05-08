// src/components/profile/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit, Camera, X, Save, Info, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../page_layout/Layout';
import ProfileImage from './Profile-img';
import '../../component-styles/ProfilePage.css';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef();

  // Redirect if not logged in & bootstrap profile from currentUser
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setProfile({
      id: currentUser.id,
      userId: currentUser.id,
      about: currentUser.about || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      address: currentUser.address || '',
      birthday: currentUser.birthday
        ? currentUser.birthday.split('T')[0]
        : '',
      profilePictureUrl: currentUser.profileImage || '',
    });
  }, [currentUser, navigate]);

  const toggleEdit = () => setIsEditing((f) => !f);
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProfile((p) => ({
      ...p,
      profilePictureUrl: URL.createObjectURL(f),
      _file: f,
    }));
  };
  const saveProfile = () => {
    // TODO: XSRF + PUT logic here
    setIsEditing(false);
  };

  if (!profile) return null;

  return (
    <Layout>
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-image-container">
            <ProfileImage src={profile.profilePictureUrl} />
            {isEditing && (
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

          {isEditing ? (
            <div className="profile-edit-form">
              <textarea
                name="about"
                placeholder="Hakkında"
                value={profile.about}
                onChange={handleProfileChange}
              />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={profile.email}
                onChange={handleProfileChange}
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Telefon"
                value={profile.phoneNumber}
                onChange={handleProfileChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Adres"
                value={profile.address}
                onChange={handleProfileChange}
              />
              <div className="date-input-group">
                <Calendar size={18} />
                <input
                  type="date"
                  name="birthday"
                  value={profile.birthday}
                  onChange={handleProfileChange}
                />
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
                <div><Calendar size={16} /><span>{new Date(profile.birthday).toLocaleDateString()}</span></div>
              </div>
            </>
          )}

          <div className="profile-actions">
            <button id="edit-profile-btn" onClick={toggleEdit}>
              {isEditing
                ? <><X size={18} />Vazgeç</>
                : <><Edit size={18} />Düzenle</>}
            </button>
            {isEditing && (
              <button className="save-profile-btn" onClick={saveProfile}>
                <Save size={18} />Kaydet
              </button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
