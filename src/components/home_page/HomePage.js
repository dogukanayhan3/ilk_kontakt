import React, { useState, useEffect } from "react";
import Layout from "../page_layout/Layout";
import Post from "./Post";
import { Send } from 'lucide-react';
import "../../component-styles/HomePage.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Helper to get a cookie value by name
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const API_URL = "https://localhost:44388/api/app/post";
function HomePage() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        }
    }, [currentUser, navigate]);

    // Move fetchPosts outside useEffect and make it a component function
    const fetchPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_URL}?SkipCount=0&MaxResultCount=20`, {
                credentials: "include"
            });
            if (response.status === 401 || response.redirected) {
                navigate("/login");
                return;
            }
            if (!response.ok) throw new Error("Gönderiler alınamadı");
            const data = await response.json();
            setPosts(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update useEffect to use the moved fetchPosts function
    useEffect(() => {
        fetchPosts();
    }, [navigate]); // Add fetchPosts to dependencies if needed

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!newPostContent.trim()) return;
        try {
            await fetch('https://localhost:44388/api/abp/application-configuration', {
                credentials: 'include'
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
                if (!xsrfToken) {
                    setError('XSRF token not found');
                    return;
                }
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: "include",
                body: JSON.stringify({
                    content: newPostContent
                })
            });

            if (response.status === 401 || response.redirected) {
                navigate("/login");
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Gönderi paylaşılamadı");
            }
            const createdPost = await response.json();
            setPosts([createdPost, ...posts]);
            setNewPostContent("");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Layout>
            <section className="welcome">
                <h1>Hoş Geldin {currentUser?.username || "Misafir"}!</h1>
                <p>Hayallerinize giden yolda ilk kontakt noktanız!</p>
            </section>
            <section className="feed">
                <div className="feed-left">
                    <div className="profile-card">
                        <img src={currentUser?.profileImage || "https://via.placeholder.com/150"} alt="Profile"/>
                        <h3>{currentUser?.username || 'Misafir'}</h3>
                        <p>Yazılım Mühendisi</p>
                        <button>Profil</button>
                    </div>
                </div>
                <div className="feed-main">
                    <div className="post-creation">
                        <form onSubmit={handlePostSubmit}>
                            <textarea
                                className="post-input"
                                placeholder="Düşüncelerinizi paylaşın..."
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                disabled={!currentUser}
                            />
                            <div className="post-submit">
                                <button type="submit" className="share-post-btn" disabled={!currentUser}>
                                    <Send size={18} />
                                    Paylaş
                                </button>
                            </div>
                        </form>
                        {error && <div className="error-message">{error}</div>}
                    </div>
                    {loading ? (
                        <div>Yükleniyor...</div>
                    ) : (
                        posts.map((post) => (
                            <Post
                                key={post.id}
                                id={post.id}
                                post_owner={post.creatorUserId}
                                post_content={post.content}
                                user_likes={post.userLikes}
                                user_comments={post.userComments}
                                publish_date={post.publishDate}
                                onPostUpdate={fetchPosts}  // Make sure this is passed
                            />
                        ))
                    )}
                </div>
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
