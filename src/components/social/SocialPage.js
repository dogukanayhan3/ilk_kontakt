import React, { useState, useEffect } from 'react';
import { 
    Briefcase, 
    ArrowUpRight, 
    GraduationCap, 
    MapPin, 
    Calendar,
    User,
    Mail,
    Phone
} from 'lucide-react';
import Layout from "../page_layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import "../../component-styles/SocialPage.css";

const API_BASE = 'https://localhost:44388';
const PROFILE_ROOT = `${API_BASE}/api/app/user-profile`;
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`;
const EDUCATION_ROOT = `${API_BASE}/api/app/education`;
const PROJECT_ROOT = `${API_BASE}/api/app/project`;
const CONNECTION_ROOT = `${API_BASE}/api/app/connection`;
const CONNECTION_USER_ROOT = `${CONNECTION_ROOT}/user-connections`;

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function UserCard({ user, onConnect, connectionStatus }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/profilepage/${user.id}`);
    };

    const handleConnectClick = (e) => {
        e.stopPropagation();
        onConnect(user.userId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long'
        });
    };

    const getConnectionButton = () => {
        const statusObj = connectionStatus;
        let status = statusObj;
        
        if (typeof statusObj === 'object' && statusObj !== null) {
            status = statusObj.status;
        }

        switch (status) {
            case 'connected':
                return (
                    <span className="connection-badge connected">
                        Bağlantı kuruldu
                    </span>
                );
            case 'pending-outgoing':
                return (
                    <span className="connection-badge pending">
                        Beklemede
                    </span>
                );
            case 'none':
                return (
                    <button className="connect-btn" onClick={handleConnectClick}>
                        Bağlantı Kur
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="user-card" onClick={handleCardClick}>
            <div className="user-card-header">
                <img
                    src={user.profilePictureUrl || '/default-avatar.png'}
                    alt={user.userName}
                    className="user-profile-image"
                />
                <div className="user-basic-info">
                    <h3>{user.userName}</h3>
                    {user.email && (
                        <div className="user-contact-info">
                            <Mail size={14} strokeWidth={1.5} />
                            <span>{user.email}</span>
                        </div>
                    )}
                    {user.phoneNumber && (
                        <div className="user-contact-info">
                            <Phone size={14} strokeWidth={1.5} />
                            <span>{user.phoneNumber}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="user-card-content">
                {/* Current Position */}
                {user.latestExperience && (
                    <div className="user-section">
                        <div className="section-header">
                            <Briefcase size={16} strokeWidth={1.5} />
                            <h4>Mevcut Pozisyon</h4>
                        </div>
                        <div className="section-content">
                            <div className="experience-item">
                                <h5>{user.latestExperience.title}</h5>
                                <p className="company-name">
                                    {user.latestExperience.companyName}
                                </p>
                                <div className="experience-details">
                                    {user.latestExperience.location && (
                                        <span className="location">
                                            <MapPin size={12} strokeWidth={1.5} />
                                            {user.latestExperience.location}
                                        </span>
                                    )}
                                    <span className="duration">
                                        <Calendar size={12} strokeWidth={1.5} />
                                        {formatDate(user.latestExperience.startDate)} - 
                                        {user.latestExperience.endDate ? 
                                            formatDate(user.latestExperience.endDate) : 
                                            ' Devam ediyor'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Latest Education */}
                {user.latestEducation && (
                    <div className="user-section">
                        <div className="section-header">
                            <GraduationCap size={16} strokeWidth={1.5} />
                            <h4>Eğitim</h4>
                        </div>
                        <div className="section-content">
                            <div className="education-item">
                                <h5>{user.latestEducation.description}</h5>
                                <p className="institution-name">
                                    {user.latestEducation.instutionName}
                                </p>
                                <div className="education-details">
                                    <span className="duration">
                                        <Calendar size={12} strokeWidth={1.5} />
                                        {formatDate(user.latestEducation.startDate)} - 
                                        {user.latestEducation.endDate ? 
                                            formatDate(user.latestEducation.endDate) : 
                                            ' Devam ediyor'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Projects */}
                {user.projects && user.projects.length > 0 && (
                    <div className="user-section">
                        <div className="section-header">
                            <User size={16} strokeWidth={1.5} />
                            <h4>Son Projeler</h4>
                        </div>
                        <div className="section-content">
                            {user.projects.slice(0, 2).map(project => (
                                <div key={project.id} className="project-item">
                                    <div className="project-details">
                                        <h5>{project.projectName}</h5>
                                        <p>{project.description}</p>
                                        {project.technologies && (
                                            <div className="project-technologies">
                                                {project.technologies.split(',').map((tech, index) => (
                                                    <span key={index} className="tech-tag">
                                                        {tech.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {project.projectUrl && (
                                        <a
                                            href={project.projectUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="project-link-btn"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <ArrowUpRight size={14} strokeWidth={2} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bio/About */}
                {user.bio && (
                    <div className="user-section">
                        <div className="section-header">
                            <User size={16} strokeWidth={1.5} />
                            <h4>Hakkında</h4>
                        </div>
                        <div className="section-content">
                            <p className="user-bio">{user.bio}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="user-card-footer">
                {getConnectionButton()}
            </div>
        </div>
    );
}

function SocialPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchConnections();
        // eslint-disable-next-line
    }, []);

    async function fetchUsers() {
        setLoading(true);
        setError('');
        try {
            const profilesRes = await fetch(PROFILE_ROOT, { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!profilesRes.ok) {
                throw new Error('Failed to fetch profiles');
            }
            
            const profilesData = await profilesRes.json();
            
            // Debug logging to see the structure
            console.log('Current user:', currentUser);
            console.log('All profiles:', profilesData.items);
            
            // Filter out the current user - check both userId and id fields
            const profiles = (profilesData.items || []).filter(profile => {
                // Check multiple possible identifier fields
                const isCurrentUser = 
                    profile.userId === currentUser.id || 
                    profile.userId === currentUser.userId ||
                    profile.id === currentUser.id ||
                    profile.id === currentUser.userId ||
                    profile.userName === currentUser.userName ||
                    profile.email === currentUser.email;
                
                console.log(`Profile ${profile.userName}: isCurrentUser = ${isCurrentUser}`);
                return !isCurrentUser;
            });
    
            console.log('Filtered profiles:', profiles);
    
            const usersWithDetails = await Promise.all(
                profiles.map(async (profile) => {
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
                    
                    let latestExperience = null;
                    if (expRes.ok) {
                        const expData = await expRes.json();
                        const experiences = expData.items || [];
                        latestExperience = experiences.sort((a, b) => 
                            new Date(b.startDate) - new Date(a.startDate)
                        )[0];
                    }
    
                    // Fetch education
                    const eduRes = await fetch(
                        `${EDUCATION_ROOT}?ProfileId=${profile.id}`,
                        { 
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    let latestEducation = null;
                    if (eduRes.ok) {
                        const eduData = await eduRes.json();
                        const educations = eduData.items || [];
                        latestEducation = educations.sort((a, b) => 
                            new Date(b.startDate) - new Date(a.startDate)
                        )[0];
                    }
    
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
                    
                    let projects = [];
                    if (projRes.ok) {
                        const projData = await projRes.json();
                        projects = projData.items || [];
                    }
    
                    return {
                        ...profile,
                        latestExperience,
                        latestEducation,
                        projects
                    };
                })
            );
    
            setUsers(usersWithDetails);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchConnections() {
        try {
            // Fetch incoming requests
            const incomingRes = await fetch(`${CONNECTION_ROOT}/incoming-list?SkipCount=0&MaxResultCount=100`, { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (incomingRes.ok) {
                const incomingData = await incomingRes.json();
                setIncomingRequests(incomingData.items || []);
            }
        
            // Fetch outgoing requests
            const outgoingRes = await fetch(`${CONNECTION_ROOT}/outgoing-list?SkipCount=0&MaxResultCount=100`, { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (outgoingRes.ok) {
                const outgoingData = await outgoingRes.json();
                setOutgoingRequests(outgoingData.items || []);
            }
    
            // Fetch all connections - this should only return accepted connections
            const allConnectionsRes = await fetch(`${CONNECTION_USER_ROOT}?SkipCount=0&MaxResultCount=1000`, { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (allConnectionsRes.ok) {
                const allConnectionsData = await allConnectionsRes.json();
                // Filter to only include accepted connections (status === 1)
                const acceptedConnections = (allConnectionsData.items || []).filter(c => c.status === 1);
                setConnections(acceptedConnections);
            }
        } catch (e) {
            console.error('Failed to fetch connections:', e);
        }
    }
    

    async function sendConnectionRequest(receiverUserId) {
        try {
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('Could not verify request (XSRF token missing).');
                return;
            }
    
            const response = await fetch(CONNECTION_ROOT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ receiverId: receiverUserId }),
            });
    
            if (!response.ok) {
                throw new Error(`Bu kullanıcıya daha önce bağlantı isteği gönderdiniz!`);
            }
    
            fetchConnections();
        } catch (err) {
            console.error('Send connection request error:', err);
            setError(err.message);
        }
    }
    
    async function respondToRequest(connectionId, status) {
        try {
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('Could not verify request (XSRF token missing).');
                return;
            }
    
            const response = await fetch(`${CONNECTION_ROOT}/${connectionId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ status }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to respond to connection request (Status: ${response.status})`);
            }
    
            // Refresh all connection data after responding
            await fetchConnections();
            
            // Also refresh users to update their connection status
            await fetchUsers();
            
        } catch (err) {
            console.error('Respond to connection request error:', err);
            setError(err.message);
        }
    }
    
    function getConnectionStatus(userAbpId) {
        console.log(`Checking connection status for user ${userAbpId}`);
        console.log('Current user ID:', currentUser.id);
        console.log('All connections:', connections);
        console.log('Incoming requests:', incomingRequests);
        console.log('Outgoing requests:', outgoingRequests);
    
        // Check if user is in accepted connections (status === 1 means accepted)
        const acceptedConnection = connections.find(c =>
            (c.senderId === userAbpId || c.receiverId === userAbpId) && c.status === 1
        );
        
        if (acceptedConnection) {
            console.log(`Found accepted connection:`, acceptedConnection);
            return 'connected';
        }
    
        // Check outgoing pending requests (status === 0 means pending)
        const outgoingPending = outgoingRequests.find(c => c.receiverId === userAbpId && c.status === 0);
        if (outgoingPending) {
            console.log(`Found outgoing pending request:`, outgoingPending);
            return 'pending-outgoing';
        }
    
        // Check incoming pending requests (status === 0 means pending)
        const incomingPending = incomingRequests.find(c => c.senderId === userAbpId && c.status === 0);
        if (incomingPending) {
            console.log(`Found incoming pending request:`, incomingPending);
            return { status: 'pending-incoming', connectionId: incomingPending.id };
        }
    
        console.log(`No connection found for user ${userAbpId}`);
        return 'none';
    }
    
    

    if (loading) return (
        <Layout>
            <div className="loading-container">
                <div className="loading-message">Kullanıcılar yükleniyor...</div>
            </div>
        </Layout>
    );
    
    if (error) return (
        <Layout>
            <div className="error-container">
                <div className="error-message">Hata: {error}</div>
            </div>
        </Layout>
    );

    const pendingIncomingRequests = incomingRequests.filter(req => req.status === 0);

    return (
        <Layout>
            <section className="welcome">
                <h1>Profesyonel Ağ</h1>
                <p>Alanınızdaki profesyonelleri keşfedin ve bağlantı kurun!</p>
            </section>

            <div className="social-page-container">
                {/* Incoming Requests Section */}
                {pendingIncomingRequests.length > 0 && (
                    <section className="incoming-requests-section">
                        <h2>Gelen Bağlantı İstekleri ({pendingIncomingRequests.length})</h2>
                        <div className="incoming-requests-list">
                            {pendingIncomingRequests.map(req => {
                                const sender = users.find(u => u.userId === req.senderId);
                                if (!sender) return null;
                                return (
                                    <div key={req.id} className="incoming-request-card">
                                        <img
                                            src={sender.profilePictureUrl || '/default-avatar.png'}
                                            alt={sender.userName}
                                            className="request-profile-image"
                                        />
                                        <div className="request-info">
                                            <h4>{sender.userName}</h4>
                                            {sender.latestExperience && (
                                                <p>
                                                    <Briefcase size={14} strokeWidth={1.5} />
                                                    {sender.latestExperience.title} @ {sender.latestExperience.companyName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="request-actions">
                                            <button
                                                className="accept-btn"
                                                onClick={() => respondToRequest(req.id, "Accepted")}
                                            >
                                                Kabul Et
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => respondToRequest(req.id, "Rejected")}
                                            >
                                                Reddet
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Main Users Grid */}
                <section className="users-grid-container">
                    <div className="users-grid">
                        {users.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onConnect={sendConnectionRequest}
                                connectionStatus={getConnectionStatus(user.userId)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default SocialPage;
