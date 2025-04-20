import { useState } from "react";
import Layout from "../page_layout/Layout";
import Post from "./Post";
import { Send } from 'lucide-react';
import data from "../../data.json";
import "../../component-styles/HomePage.css"

function HomePage() {
    const [posts, setPosts] = useState(data);
    const [newPostContent, setNewPostContent] = useState("");

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        const newPost = {
            post_owner: "Doğukan Ayhan", // Currently logged in user
            post_content: newPostContent,
            post_likes: 0,
            post_comments: []
        };

        setPosts([newPost, ...posts]);
        setNewPostContent("");
    };

    return(
        <Layout>
            <section className="welcome">
                <h1>Hoş Geldiniz</h1>
                <p>Hayallerinize giden yolda ilk kontakt noktanız!</p>
            </section>
            <section className="feed">
                <div className="feed-left">
                    <div className="profile-card">
                        <img src="https://via.placeholder.com/150" alt="Profile"/>
                        <h3>Doğukan Ayhan</h3>
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
                            />
                            <div className="post-submit">
                                <button type="submit" className="share-post-btn">
                                    <Send size={18} />
                                    Paylaş
                                </button>
                            </div>
                        </form>
                    </div>

                    {posts.map((post, index) => (
                        <Post key={index}
                            post_owner={post.post_owner} 
                            post_content={post.post_content} 
                            post_likes={post.post_likes} 
                            post_comments={post.post_comments}
                        />
                    ))}
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