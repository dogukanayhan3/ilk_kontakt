import React, { useState } from 'react';
import { Edit, Camera, Users, Paperclip, Star, X, Save } from 'lucide-react';
import Layout from "./Layout";
import ProfileImage from "./Profile-img";
import "../component-styles/ProfilePage.css";

// Dummy post data - replace with actual data source
const dummyPosts = [
    {
        id: 1,
        title: "My First Tech Conference Experience",
        content: "Last week, I attended the Annual Tech Summit and learned so much about the latest trends in software development...",
        date: "2 days ago",
        likes: 24,
        comments: 5
    },
    {
        id: 2,
        title: "Building My First React Application",
        content: "After months of learning, I finally completed my first full-stack React application. It was challenging but incredibly rewarding...",
        date: "1 week ago",
        likes: 42,
        comments: 12
    }
];

function ProfilePostCard({ post }) {
    return (
        <div className="profile-post-card">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div className="post-meta">
                <span>{post.date}</span>
                <div className="post-interactions">
                    <span><Paperclip size={16} /> {post.likes} Likes</span>
                    <span><Users size={16} /> {post.comments} Comments</span>
                </div>
            </div>
        </div>
    );
}

function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "John Doe",
        profession: "Software Engineer",
        connections: 120,
        posts: 45,
        followers: 230
    });

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = () => {
        // Here you would typically send the updated profile to a backend
        setIsEditing(false);
    };

    return (
        <Layout>
            <section className="profile-section">
                <div className="profile-card">
                    <div className="profile-image-container">
                        <ProfileImage />
                        <button className="change-photo-btn">
                            <Camera size={20} strokeWidth={1.5} />
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="profile-edit-form">
                            <input 
                                type="text" 
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                                placeholder="Full Name"
                            />
                            <input 
                                type="text" 
                                name="profession"
                                value={profileData.profession}
                                onChange={handleInputChange}
                                placeholder="Profession"
                            />
                        </div>
                    ) : (
                        <>
                            <h3 id="profile-name">{profileData.name}</h3>
                            <p id="profile-profession">{profileData.profession}</p>
                        </>
                    )}

                    <div className="profile-details">
                        <div className="profile-stat">
                            <Users size={24} strokeWidth={1.5} />
                            <div>
                                <h4>Connections</h4>
                                <p>{profileData.connections}</p>
                            </div>
                        </div>
                        <div className="profile-stat">
                            <Paperclip size={24} strokeWidth={1.5} />
                            <div>
                                <h4>Posts</h4>
                                <p>{profileData.posts}</p>
                            </div>
                        </div>
                        <div className="profile-stat">
                            <Star size={24} strokeWidth={1.5} />
                            <div>
                                <h4>Followers</h4>
                                <p>{profileData.followers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button 
                            id="edit-profile-btn" 
                            onClick={handleEditToggle}
                        >
                            {isEditing ? (
                                <>
                                    <X size={18} strokeWidth={1.5} />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Edit size={18} strokeWidth={1.5} />
                                    Edit Profile
                                </>
                            )}
                        </button>
                        {isEditing && (
                            <button 
                                className="save-profile-btn"
                                onClick={handleSaveProfile}
                            >
                                <Save size={18} strokeWidth={1.5} />
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>

                <section className="profile-posts-section">
                    <h3>Recent Posts</h3>
                    <div className="posts-grid">
                        {dummyPosts.map(post => (
                            <ProfilePostCard key={post.id} post={post} />
                        ))}
                    </div>
                </section>
            </section>
        </Layout>
    );
}

export default ProfilePage;