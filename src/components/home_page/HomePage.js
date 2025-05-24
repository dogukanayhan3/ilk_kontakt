import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../page_layout/Layout';
import Post from './Post';
import { Send } from 'lucide-react';
import '../../component-styles/HomePage.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Helper to get a cookie value by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const API_BASE_URL = 'https://localhost:44388';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch user profile function
  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/app/user-profile/by-user`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      } else if (response.status === 404) {
        // User doesn't have a profile yet
        setUserProfile(null);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Fetch user profile error:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser]);

  // Fetch posts function using useCallback to stabilize its identity
  const fetchPosts = useCallback(async () => {
    setError('');
    if (!currentUser) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/app/post?SkipCount=0&MaxResultCount=20`,
        {
          credentials: 'include',
        },
      );

      if (response.status === 401 || response.redirected) {
        console.log('Unauthorized or redirected, navigating to login.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch posts (Status: ${response.status})`);
      }

      const data = await response.json();
      setPosts(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Fetch posts error:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, currentUser]);

  // Initial fetch on component mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setProfileLoading(true);
      fetchPosts();
      fetchUserProfile();
    } else {
      setLoading(false);
      setProfileLoading(false);
    }
  }, [currentUser, fetchPosts, fetchUserProfile]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPostContent.trim()) {
        setError("Post content cannot be empty.");
        return;
    };
    if (!currentUser) {
        setError("Please log in to create a post.");
        return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/abp/application-configuration`, {
        credentials: 'include',
      });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        setError('Could not verify request (XSRF token missing).');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/app/post`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newPostContent,
        }),
      });

      if (response.status === 401 || response.redirected) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        let errorMsg = 'Failed to create post.';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error?.message || errorMsg;
        } catch (parseError) { /* Ignore */ }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }

      const createdPost = await response.json();
      setPosts((prevPosts) => [createdPost, ...prevPosts]);
      setNewPostContent('');
    } catch (err) {
      console.error('Create post error:', err);
      setError(err.message);
    }
  };

  // Helper functions for display
  const getDisplayName = () => {
    if (userProfile) {
      if (userProfile.name && userProfile.surname) {
        return `${userProfile.name} ${userProfile.surname}`;
      }
      if (userProfile.userName) {
        return userProfile.userName;
      }
      if (userProfile.name) {
        return userProfile.name;
      }
    }
    return currentUser?.userName || 'Misafir';
  };

  const getWelcomeName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (userProfile?.userName) {
      return userProfile.userName;
    }
    return currentUser?.userName || 'Misafir';
  };

  const getProfileImage = () => {
    // You can add a profilePictureUrl field to UserProfile if needed
    // For now, using a default or generated avatar
    if (userProfile?.profilePictureUrl) {
      return userProfile.profilePictureUrl;
    }
    return currentUser?.profilePictureUrl || '/default-avatar.png';
  };

  const handleCreateProfile = () => {
    navigate('/create-profile'); // You'll need to create this route/component
  };

  // Render only if user is authenticated (or during initial load check)
  if (!currentUser && !loading) {
      return null;
  }

  return (
    <Layout>
      <section className="welcome">
        <h1>Hoş Geldin {getWelcomeName()}!</h1>
        <p>Hayallerinize giden yolda ilk kontakt noktanız!</p>
      </section>
      <section className="feed">
        {/* Left Sidebar (Profile Card) */}
        <div className="feed-left">
          <div className="profile-card">
            {profileLoading ? (
              <div className="profile-loading">
                <div className="profile-image-placeholder"></div>
                <p>Profil yükleniyor...</p>
              </div>
            ) : userProfile ? (
              <>
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="profile-image"
                />
                <h3>{getDisplayName()}</h3>
                <p>{userProfile.address || 'Konum belirtilmemiş'}</p>
                <p className="profile-email">{userProfile.email || currentUser?.email}</p>
                <button onClick={() => navigate('/profilepage')}>Profili Düzenle</button>
              </>
            ) : (
              <div className="no-profile">
                <img
                  src="/default-avatar.png"
                  alt="Default Profile"
                  className="profile-image"
                />
                <h3>{currentUser?.userName || 'Misafir'}</h3>
                <p>Profil oluşturulmamış</p>
                <button onClick={handleCreateProfile} className="create-profile-btn">
                  Profil Oluştur
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Feed Area */}
        <div className="feed-main">
          {/* Post Creation Form */}
          <div className="post-creation">
            <form onSubmit={handlePostSubmit}>
              <div className="post-input-container">
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="post-profile-image"
                />
              <textarea
                className="post-input"
                placeholder="Düşüncelerinizi paylaşın..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                  disabled={!currentUser}
                  rows={3}
              />
              </div>
              <div className="post-submit">
                <button
                  type="submit"
                  className="share-post-btn"
                  disabled={!currentUser || !newPostContent.trim()}
                >
                  <Send size={18} />
                  Paylaş
                </button>
              </div>
            </form>
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Display Posts */}
          {loading ? (
            <div className="loading-message">Gönderiler Yükleniyor...</div>
          ) : posts.length === 0 && !error ? (
             <div className="no-posts-message">Henüz gönderi yok. İlk gönderiyi sen paylaş!</div>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                userName={post.userName}
                content={post.content}
                userLikes={post.userLikes}
                numberOfLikes={post.numberOfLikes}
                userComments={post.userComments}
                publishDate={post.publishDate}
                onPostUpdate={fetchPosts}
                profileImage={post.profilePictureUrl || '/default-avatar.png'}
              />
            ))
          )}
           {!loading && error && posts.length === 0 && <div className="error-message">{error}</div>}
        </div>

        {/* Right Sidebar (Suggestions) */}
        <div className="feed-right">
          <div className="profile-card">
            <h3>Bağlantı Önerileri</h3>
            <p>Yeni profesyonellerle tanışarak ağınızı genişletin!</p>
            <button>Bağlantılar</button>
          </div>
          <div className="profile-card">
            <h3>Açık Pozisyonlar</h3>
            <p>İlgilendiğiniz alanda açık olan pozisyonları görüntüleyin!</p>
            <button>Pozisyonlar</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default HomePage;
