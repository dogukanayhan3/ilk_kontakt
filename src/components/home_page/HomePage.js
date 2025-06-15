import React, { useState, useEffect, useCallback } from "react";
import Layout from "../page_layout/Layout";
import Post from "./Post";
import { Send } from "lucide-react";
import "../../component-styles/HomePage.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/api";

// Helper to get a cookie value by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Utility to parse Gemini response robustly
function extractMatchesFromGeminiResponse(data) {
  try {
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Remove code block markers if present
    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return parsed.matches || [];
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return [];
  }
}

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [suggestedConnections, setSuggestedConnections] = useState(() => {
    const stored = localStorage.getItem("connectionSuggestions");
    return stored ? JSON.parse(stored) : [];
  });
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch user profile function
  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) return null;
    setProfileLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.API_BASE}/api/app/user-profile/by-user`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
        return profileData;
      } else if (response.status === 404) {
        setUserProfile(null);
        return null;
      } else {
        console.error("Failed to fetch user profile");
        return null;
      }
    } catch (err) {
      console.error("Fetch user profile error:", err);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser]);

  // Fetch all users and their details
  const fetchAllUserDetails = useCallback(async () => {
    try {
      // 1. Fetch all profiles
      const profilesRes = await fetch(
        `${API_CONFIG.API_BASE}/api/app/user-profile`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!profilesRes.ok) throw new Error("Profiller alınamadı.");
      const profilesData = await profilesRes.json();
      const profiles = profilesData.items || [];

      // 2. For each profile, fetch education, experience, skills
      const userDetails = await Promise.all(
        profiles.map(async (profile) => {
          // Fetch education
          const eduRes = await fetch(
            `${API_CONFIG.API_BASE}/api/app/education?ProfileId=${profile.id}`,
            { credentials: "include" }
          );
          const education = eduRes.ok ? (await eduRes.json()).items || [] : [];

          // Fetch experience
          const expRes = await fetch(
            `${API_CONFIG.API_BASE}/api/app/experience?ProfileId=${profile.id}`,
            { credentials: "include" }
          );
          const experience = expRes.ok ? (await expRes.json()).items || [] : [];

          // Fetch skills
          const skillRes = await fetch(
            `${API_CONFIG.API_BASE}/api/app/skill?ProfileId=${profile.id}`,
            { credentials: "include" }
          );
          const skills = skillRes.ok ? (await skillRes.json()).items || [] : [];

          return {
            ...profile,
            education,
            experience,
            skills,
          };
        })
      );
      return userDetails;
    } catch (err) {
      console.error("Error fetching all user details:", err);
      return [];
    }
  }, []);

  // Gemini API call
  const getConnectionSuggestions = useCallback(
    async (allUsers, currentUserProfile) => {
      if (!currentUserProfile || !allUsers.length) return [];
      try {
        const response = await fetch(
          `${API_CONFIG.GEMINI_API_URL}?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `
  Öncelikle benzer beceri setine göre en güçlü eşleşmeleri seçin. Eğitim geçmişi ve iş deneyimi
  önemsiz değil ama ikincil öncelikte kalsın.
  
  Aşağıda tüm kullanıcıların profilleri, becerileri, eğitim ve deneyimleri bulunuyor:
  ${JSON.stringify(allUsers, null, 2)}
  
  Mevcut kullanıcı:
  ${JSON.stringify(currentUserProfile, null, 2)}
  
  Lütfen yalnızca şu formatta ve ek açıklama olmadan yanıt verin. "matchReason" kısmı Türkçe olacak:
  {
    "matches": [
      {
        "id": "user_profile_id (not UserId)",
        "name": "user_name",
        "surname": "user_surname",
        "profilePictureUrl": "url",
        "matchReason": "5–6 kelime, neden bağlanmalı, varsa ortak olan yeteneklerin isimleri"
      }
    ]
  }
                      `,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const data = await response.json();
        return extractMatchesFromGeminiResponse(data);
      } catch (err) {
        console.error("Get connection suggestions error:", err);
        return [];
      }
    },
    []
  );

  // Fetch posts function
  const fetchPosts = useCallback(async () => {
    setError("");
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.API_BASE}/api/app/post?SkipCount=0&MaxResultCount=20`,
        {
          credentials: "include",
        }
      );
      if (response.status === 401 || response.redirected) {
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(`Gönderiler alınamadı (Durum: ${response.status})`);
      }
      const data = await response.json();
      setPosts(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, currentUser]);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!currentUser) {
        setLoading(false);
        setProfileLoading(false);
        setConnectionsLoading(false);
        return;
      }
      setLoading(true);
      setProfileLoading(true);
      setConnectionsLoading(true);

      try {
        // 1. Fetch current user profile
        const profileData = await fetchUserProfile();
        if (!isMounted) return;

        // 2. Fetch posts
        await fetchPosts();
        if (!isMounted) return;

        // 3. Fetch suggestions only if not already present in localStorage
        if (
          profileData &&
          (!suggestedConnections || suggestedConnections.length === 0)
        ) {
          const allUserData = await fetchAllUserDetails();
          if (!isMounted) return;
          const matches = await getConnectionSuggestions(
            allUserData,
            profileData
          );
          if (isMounted) {
            setSuggestedConnections(matches);
            localStorage.setItem(
              "connectionSuggestions",
              JSON.stringify(matches)
            );
          }
        }
      } catch (err) {
        if (isMounted) setError("Bağlantı önerileri yüklenemedi.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setProfileLoading(false);
          setConnectionsLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
    // Remove suggestedConnections from deps to avoid refetching
    // eslint-disable-next-line
  }, [
    currentUser,
    fetchUserProfile,
    fetchPosts,
    fetchAllUserDetails,
    getConnectionSuggestions,
  ]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPostContent.trim()) {
      setError("Gönderi içeriği boş olamaz.");
      return;
    }
    if (!currentUser) {
      setError("Gönderi oluşturmak için lütfen giriş yapın.");
      return;
    }

    try {
      await fetch(`${API_CONFIG.API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrfToken = getCookie("XSRF-TOKEN");
      if (!xsrfToken) {
        setError("İstek doğrulanamadı (XSRF token eksik).");
        return;
      }

      const response = await fetch(`${API_CONFIG.API_BASE}/api/app/post`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          content: newPostContent,
        }),
      });

      if (response.status === 401 || response.redirected) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        let errorMsg = "Gönderi oluşturulamadı.";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error?.message || errorMsg;
        } catch (parseError) {
          /* Ignore */
        }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }

      const createdPost = await response.json();
      setPosts((prevPosts) => [createdPost, ...prevPosts]);
      setNewPostContent("");
    } catch (err) {
      console.error("Gönderi oluşturma hatası:", err);
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
    return currentUser?.userName || "Misafir";
  };

  const getWelcomeName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (userProfile?.userName) {
      return userProfile.userName;
    }
    return currentUser?.userName || "Misafir";
  };

  const getProfileImage = () => {
    if (userProfile?.profilePictureUrl) {
      return userProfile.profilePictureUrl;
    }
    return currentUser?.profilePictureUrl || "/default-avatar.png";
  };

  const handleCreateProfile = () => {
    navigate("/create-profile");
  };

  const generatePost = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.GEMINI_API_URL}?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a professional social media post about career development or industry insights. The post should be:

1. Professional and informative
2. Engaging and shareable
3. Relevant to the tech industry
4. Include a call to action
5. Be in Turkish

Keep it concise and impactful.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      // ... rest of the code ...
    } catch (err) {
      console.error("Generate post error:", err);
    }
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
                <p>{userProfile.address || "Konum belirtilmemiş"}</p>
                <p className="profile-email">
                  {userProfile.email || currentUser?.email}
                </p>
                <button onClick={() => navigate("/profilepage")}>
                  Profili Düzenle
                </button>

                {/* Connection Suggestions Section */}
                <div className="profile-suggestions">
                  <div className="suggestions-header">
                    <h3>Bağlantı Önerileri</h3>
                    <span className="suggestions-count">
                      {suggestedConnections.length}
                    </span>
                  </div>
                  {connectionsLoading ? (
                    <div className="suggestions-loading">
                      <div className="loading-spinner"></div>
                      <p>Bağlantı önerileri yükleniyor...</p>
                    </div>
                  ) : suggestedConnections.length > 0 ? (
                    <div className="suggestions-list">
                      {suggestedConnections.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <div className="suggestion-profile">
                            <img
                              src={
                                suggestion.profilePictureUrl ||
                                "/default-avatar.png"
                              }
                              alt={suggestion.name}
                              className="suggestion-avatar"
                            />
                            <div className="suggestion-info">
                              <h4>
                                {suggestion.name} {suggestion.surname}
                              </h4>
                              <p className="suggestion-reason">
                                <span className="match-icon">✨</span>
                                {suggestion.matchReason}
                              </p>
                            </div>
                          </div>
                          <button
                            className="view-profile-btn"
                            onClick={() =>
                              navigate(`/profilepage/${suggestion.id}`)
                            }
                          >
                            Profili Görüntüle
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-suggestions">
                      <div className="no-suggestions-icon">🔍</div>
                      <p>Henüz bağlantı önerisi bulunmuyor.</p>
                      <p className="no-suggestions-subtext">
                        Profilinizi güncelleyerek daha fazla öneri
                        alabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-profile">
                <img
                  src="/default-avatar.png"
                  alt="Default Profile"
                  className="profile-image"
                />
                <h3>{currentUser?.userName || "Misafir"}</h3>
                <p>Profil oluşturulmamış</p>
                <button
                  onClick={handleCreateProfile}
                  className="create-profile-btn"
                >
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
            <div className="no-posts-message">
              Henüz gönderi yok. İlk gönderiyi sen paylaş!
            </div>
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
                profileImage={post.profilePictureUrl}
                userProfileImage={getProfileImage()}
                creatorUserId={post.creatorUserId}
              />
            ))
          )}
          {!loading && error && posts.length === 0 && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="feed-right">
          <div className="job-opportunities-card">
            <div className="opportunities-header">
              <h3>Açık Pozisyonlar</h3>
              <span className="opportunities-icon">💼</span>
            </div>
            <p>İlgilendiğiniz alanda açık olan pozisyonları görüntüleyin!</p>
            <button
              className="view-positions-btn"
              onClick={() => navigate("/joblistpage")}
            >
              Pozisyonları Görüntüle
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default HomePage;
