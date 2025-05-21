import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Layout from '../page_layout/Layout'; // Ensure path is correct
import Post from './Post'; // Ensure path is correct
import { Send } from 'lucide-react';
import '../../component-styles/HomePage.css'; // Ensure path is correct
import { useAuth } from '../../contexts/AuthContext'; // Ensure path is correct
import { useNavigate } from 'react-router-dom';

// Helper to get a cookie value by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const API_BASE_URL = 'https://localhost:44388'; // Define base URL

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch posts function using useCallback to stabilize its identity
  const fetchPosts = useCallback(async () => {
    // Don't set loading true here if called as a refresh,
    // only on initial load or explicit full refresh scenarios.
    // setLoading(true); // Consider removing this line if fetchPosts is only for refresh
    setError('');
    if (!currentUser) return; // Don't fetch if user logs out

    try {
      // Fetch posts list - adjust MaxResultCount as needed
      const response = await fetch(
        `${API_BASE_URL}/api/app/post?SkipCount=0&MaxResultCount=20`, // Use base URL
        {
          credentials: 'include', // Send cookies for authentication
        },
      );

      // Handle unauthorized or redirect
      if (response.status === 401 || response.redirected) {
        console.log('Unauthorized or redirected, navigating to login.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch posts (Status: ${response.status})`);
      }

      const data = await response.json();
      // Ensure data.items is an array before setting state
      setPosts(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Fetch posts error:', err);
      setError(err.message);
      setPosts([]); // Clear posts on error
    } finally {
      setLoading(false); // Set loading false after fetch attempt
    }
  }, [navigate, currentUser]); // Add currentUser dependency

  // Initial fetch on component mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      setLoading(true); // Set loading true for initial fetch
      fetchPosts();
    } else {
      setLoading(false); // Not logged in, not loading
    }
  }, [currentUser, fetchPosts]); // Depend on currentUser and fetchPosts

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
      // Get XSRF token
      await fetch(`${API_BASE_URL}/api/abp/application-configuration`, {
        credentials: 'include',
      });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        setError('Could not verify request (XSRF token missing).');
        return;
      }

      // POST request to create a new post
      const response = await fetch(`${API_BASE_URL}/api/app/post`, { // Use base URL
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newPostContent, // Send content in the expected DTO format
        }),
      });

      // Handle unauthorized or redirect
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

      // Add the newly created post (returned from API) to the top of the list
      const createdPost = await response.json();
      setPosts((prevPosts) => [createdPost, ...prevPosts]); // Prepend new post
      setNewPostContent(''); // Clear the input field
    } catch (err) {
      console.error('Create post error:', err);
      setError(err.message);
    }
  };

  // Render only if user is authenticated (or during initial load check)
  if (!currentUser && !loading) {
      // Or return a message, or rely on the redirect effect
      return null;
  }

  return (
    <Layout>
      <section className="welcome">
        {/* Display username from currentUser context */}
        <h1>Hoş Geldin {currentUser?.userName || 'Misafir'}!</h1>
        <p>Hayallerinize giden yolda ilk kontakt noktanız!</p>
      </section>
      <section className="feed">
        {/* Left Sidebar (Profile Card) */}
        <div className="feed-left">
          <div className="profile-card">
            <img
              src={currentUser?.profilePictureUrl || '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
            />
            <h3>{currentUser?.userName || 'Misafir'}</h3>
            <p>Yazılım Mühendisi</p>
            <button onClick={() => navigate('/profile')}>Profil</button>
          </div>
        </div>

        {/* Main Feed Area */}
        <div className="feed-main">
          {/* Post Creation Form */}
          <div className="post-creation">
            <form onSubmit={handlePostSubmit}>
              <div className="post-input-container">
                <img
                  src={currentUser?.profilePictureUrl || '/default-avatar.png'}
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
