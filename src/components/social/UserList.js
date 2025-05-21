import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import Layout from "../page_layout/Layout";
import "../../component-styles/SocialPage.css";

const API_BASE = 'https://localhost:44388';
const PROFILE_ROOT = `${API_BASE}/api/app/user-profile`;
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`;
const PROJECT_ROOT = `${API_BASE}/api/app/project`;

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('UserList component mounted');
        fetchUsers();
    }, []);

    async function fetchUsers() {
        console.log('Starting to fetch users...');
        setLoading(true);
        setError('');
        try {
            // Fetch all user profiles
            console.log('Fetching profiles from:', PROFILE_ROOT);
            const profilesRes = await fetch(PROFILE_ROOT, { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!profilesRes.ok) {
                console.error('Profile fetch failed:', profilesRes.status, profilesRes.statusText);
                throw new Error('Failed to fetch profiles');
            }
            
            const profilesData = await profilesRes.json();
            console.log('Profiles fetched:', profilesData);
            const profiles = profilesData.items || [];

            // For each profile, fetch their latest experience and projects
            console.log('Fetching details for', profiles.length, 'profiles');
            const usersWithDetails = await Promise.all(
                profiles.map(async (profile) => {
                    console.log('Fetching details for profile:', profile.id);
                    
                    // Fetch experiences
                    const expRes = await fetch(
                        `${EXPERIENCE_ROOT}?ProfileId=${profile.id}`,
                        { 
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    if (!expRes.ok) {
                        console.error('Experience fetch failed for profile', profile.id);
                        return profile;
                    }
                    const expData = await expRes.json();
                    const experiences = expData.items || [];
                    
                    // Sort experiences by start date to get the latest
                    const latestExperience = experiences.sort((a, b) => 
                        new Date(b.startDate) - new Date(a.startDate)
                    )[0];

                    // Fetch projects
                    const projRes = await fetch(
                        `${PROJECT_ROOT}?ProfileId=${profile.id}`,
                        { 
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    if (!projRes.ok) {
                        console.error('Project fetch failed for profile', profile.id);
                        return { ...profile, latestExperience, projects: [] };
                    }
                    const projData = await projRes.json();
                    const projects = projData.items || [];

                    return {
                        ...profile,
                        latestExperience,
                        projects
                    };
                })
            );

            console.log('All user details fetched:', usersWithDetails);
            setUsers(usersWithDetails);
        } catch (e) {
            console.error('Error in fetchUsers:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Layout>
            <section className="welcome">
                <h1>Profesyonel Ağ</h1>
                <p>Alanınızdaki profesyonelleri keşfedin ve bağlantı kurun!</p>
            </section>
            <section className="social-connections-container">
                <div className="connections-grid">
                    {users.map(user => (
                        <div key={user.id} className="social-connection-card">
                            <div className="connection-header">
                                <img 
                                    src={user.profilePictureUrl || '/default-avatar.png'} 
                                    alt={user.userName} 
                                    className="connection-profile-image"
                                />
                                <div className="connection-info">
                                    <h3>{user.userName}</h3>
                                    {user.latestExperience && (
                                        <p>
                                            <Briefcase size={16} strokeWidth={1.5} /> 
                                            {user.latestExperience.title} @ {user.latestExperience.companyName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {user.projects && user.projects.length > 0 && (
                                <div className="connection-projects">
                                    <h4>Projeler</h4>
                                    {user.projects.map(project => (
                                        <div key={project.id} className="project-item">
                                            <div className="project-details">
                                                <h5>{project.projectName}</h5>
                                                <p>{project.description}</p>
                                            </div>
                                            {project.projectUrl && (
                                                <a 
                                                    href={project.projectUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="project-link-btn"
                                                >
                                                    Detaylar <ArrowUpRight size={16} strokeWidth={2} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}

export default UserList; 