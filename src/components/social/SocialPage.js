import React, { useState, useEffect, useCallback } from 'react';
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
        <div className={`user-card ${user.isCompanyProfile ? 'company-profile' : ''}`} onClick={handleCardClick}>
            <div className="user-card-header">
                {user.isCompanyProfile && (
                    <div className="company-badge">
                        <Briefcase size={14} strokeWidth={2} />
                        <span>Şirket</span>
                    </div>
                )}
                <img
                    src={user.profilePictureUrl || '/default-avatar.png'}
                    alt={user.userName}
                    className="user-profile-image"
                />
                <div className="user-basic-info">
                    <h3>{user.name + " " + user.surname}</h3>
                    {user.userName && (
                        <div className="user-contact-info">
                            @<span>{user.userName}</span>
                        </div>
                    )}
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

// Utility to parse Gemini response robustly
function extractMatchesFromGeminiResponse(data) {
  try {
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Remove code block markers if present
    text = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed.matches || [];
  } catch (e) {
    console.error('Failed to parse Gemini response:', e);
    return [];
  }
}

function SocialPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(4);
    const [profileTypeFilter, setProfileTypeFilter] = useState('all');
    const [suggestedConnections, setSuggestedConnections] = useState(() => {
        const stored = localStorage.getItem('socialConnectionSuggestions');
        return stored ? JSON.parse(stored) : [];
        });
    const [connectionsLoading, setConnectionsLoading] = useState(false);

    // Add this somewhere in your component (remove after testing)
    useEffect(() => {
    // Clear existing suggestions to force a refresh
    localStorage.removeItem('socialConnectionSuggestions');
    setSuggestedConnections([]);
    }, []);

    // Fetch all users and their details (profile, education, experience)
    const fetchAllUserDetails = useCallback(async () => {
    try {
        // We already have profiles fetched, just need to add additional details
        const userDetails = await Promise.all(
        users.map(async (profile) => {

            // Skills fetch - add it back with error handling and timeout
            let skills = [];
            try {
            const skillRes = await fetch(
                `${API_BASE}/api/app/skill?ProfileId=${profile.id}`,
                { 
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    // Add a timeout signal
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                }
            );
            
            if (skillRes.ok) {
                const skillData = await skillRes.json();
                skills = skillData.items || [];
            }
            } catch (err) {
            console.log(`Error fetching skills for user ${profile.id}: ${err.message}`);
            // Continue even if skills fetch fails
            }

            return {
            ...profile,
            education: profile.latestEducation ? [profile.latestEducation] : [],
            experience: profile.latestExperience ? [profile.latestExperience] : [],
            skills
            };
        })
        );
        return userDetails;
    } catch (err) {
        console.error('Error fetching all user details:', err);
        return [];
    }
    }, [users]);

    // Add this function to SocialPage.js
    const fetchUserProfile = useCallback(async () => {
    if (!currentUser) return null;
    try {
        const response = await fetch(
        `${API_BASE}/api/app/user-profile/by-user`,
        {
            credentials: 'include',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            }
        }
        );
        if (response.ok) {
        return await response.json();
        }
        return null;
    } catch (err) {
        console.error('Fetch user profile error:', err);
        return null;
    }
    }, [currentUser]);

    // Modify getConnectionSuggestions to accept currentUserProfile
    const getConnectionSuggestions = useCallback(async (allUsers, currentUserProfile) => {
    if (!currentUser || !allUsers.length || !currentUserProfile) return [];
    
    try {
        console.log("Making Gemini API call with:", {
        usersCount: allUsers.length,
        currentUserProfile: currentUserProfile.name
        });
        
        const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            contents: [
                {
                parts: [
                    {
                    text: `
                        Analyse these users and their companies & positions they worked at or still currently working at, the skills they have, and match 2 of them with ${currentUserProfile.name} ${currentUserProfile.surname}. Explain the reason why you matched, such as: 'similar skillset' or 'similar educational background'.

                        Here are all the users data:
                        ${JSON.stringify(allUsers, null, 2)}

                        Current user to match with:
                        ${JSON.stringify(currentUserProfile, null, 2)}

                        Please return ONLY the following JSON object, without any code block or extra text. Give the match reason part in Turkish language!:
                        {
                        "matches": [
                            {
                            "id": "user_profile_id (not UserId)",
                            "name": "user_name",
                            "surname": "user_surname", 
                            "profilePictureUrl": "url",
                            "matchReason": "5-6 words reason why they should connect"
                            }
                        ]
                        }
                    `
                    }
                ]
                }
            ]
            })
        }
        );
        console.log("Gemini API response received");
        const data = await response.json();
        return extractMatchesFromGeminiResponse(data);
    } catch (err) {
        console.error('Get connection suggestions error:', err);
        return [];
    }
    }, [currentUser]);

    // Modified useEffect
    useEffect(() => {
        // Only fetch all users once when component mounts
        if (users.length === 0) {
            fetchAllUsers();
        }
        fetchConnections();
        // eslint-disable-next-line
    }, []);

    // Add this effect to update currentUsers when page changes
    useEffect(() => {
        // This effect runs when currentPage changes
        console.log('Page changed to', currentPage);
    }, [currentPage]);

    // Add this effect to fetch recommendations
    useEffect(() => {
    async function fetchRecommendations() {
        if (users.length > 0 && suggestedConnections.length === 0) {
            console.log("Starting fetchRecommendations");
            setConnectionsLoading(true);
            try {
            // Get current user profile first
            const currentUserProfile = await fetchUserProfile();
            console.log("Current user profile:", currentUserProfile?.name);
            
            if (!currentUserProfile) {
                console.error("No current user profile found");
                return;
            }
            
            const userDetails = await fetchAllUserDetails();
            console.log("User details fetched, count:", userDetails.length);
            
            // Pass both parameters
            const matches = await getConnectionSuggestions(userDetails, currentUserProfile);
            console.log("Suggestion matches received:", matches.length);
            
            setSuggestedConnections(matches);
            localStorage.setItem('socialConnectionSuggestions', JSON.stringify(matches));
            } catch (err) {
            console.error('Failed to load connection suggestions:', err);
            } finally {
            setConnectionsLoading(false);
            }
        }
    }
        
    fetchRecommendations();
    // eslint-disable-next-line
    }, [users, fetchAllUserDetails, getConnectionSuggestions]);

    async function fetchAllUsers() {
        setLoading(true);
        setError('');
        try {
            // First fetch user profiles
            const profilesRes = await fetch(
                `${PROFILE_ROOT}?SkipCount=0&MaxResultCount=1000`, 
                { 
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!profilesRes.ok) {
                throw new Error('Failed to fetch profiles');
            }
            
            const profilesData = await profilesRes.json();
            
            // Then fetch identity users to get isCompanyProfile data
            const identityRes = await fetch(
                `${API_BASE}/api/identity/users?SkipCount=0&MaxResultCount=1000`,
                {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!identityRes.ok) {
                throw new Error('Failed to fetch identity users');
            }

            const identityData = await identityRes.json();
            
            // Create a map of userId to isCompanyProfile
            const companyProfileMap = new Map(
                identityData.items.map(user => [
                    user.id,
                    user.extraProperties?.IsCompanyProfile || false
                ])
            );
            
            // Filter out current user and add isCompanyProfile data
            const profiles = (profilesData.items || []).filter(profile => {
                const isCurrentUser = 
                    profile.userId === currentUser.id || 
                    profile.userId === currentUser.userId ||
                    profile.id === currentUser.id ||
                    profile.id === currentUser.userId ||
                    profile.userName === currentUser.userName ||
                    profile.email === currentUser.email;
                
                return !isCurrentUser;
            }).map(profile => ({
                ...profile,
                isCompanyProfile: companyProfileMap.get(profile.userId) || false
            }));

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

                    // Add this code here - Skills fetch
                    const skillRes = await fetch(
                        `${API_BASE}/api/app/skill?ProfileId=${profile.id}`,
                        { 
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    let skills = [];
                    if (skillRes.ok) {
                        const skillData = await skillRes.json();
                        skills = skillData.items || [];
                    }

                    return {
                        ...profile,
                        latestExperience,
                        latestEducation,
                        projects,
                        skills,
                    };
                })
            );

            setUsers(usersWithDetails);
            
            console.log('All users fetched:', usersWithDetails.length);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchConnections() {
        setConnectionsLoading(true); // Set to true when starting
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
        } finally {
            setConnectionsLoading(false); // Set to false when done
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
            await fetchAllUsers();
            
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

    // Add this function after fetchAllUsers
    const getFilteredUsers = () => {
        switch (profileTypeFilter) {
            case 'company':
                return users.filter(user => user.isCompanyProfile);
            case 'individual':
                return users.filter(user => !user.isCompanyProfile);
            default:
                return users;
        }
    };

    // Modify the pagination section to use filtered users
    const filteredUsers = getFilteredUsers();
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

    const handlePreviousPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    };

    return (
    <Layout>
        <section className="welcome">
            <h1>Profesyonel Ağ</h1>
            <p>Alanınızdaki profesyonelleri keşfedin ve bağlantı kurun!</p>
        </section>

        <div className="social-page-container">
            {/* Left Column */}
            <div className="social-sidebar">
                {/* Profile Type Filter */}
                <section className="profile-filter-section">
                    <h2>Profil Türü</h2>
                    <div className="profile-filter-options">
                        <button
                            className={`filter-btn ${profileTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setProfileTypeFilter('all')}
                        >
                            Tümü
                        </button>
                        <button
                            className={`filter-btn ${profileTypeFilter === 'individual' ? 'active' : ''}`}
                            onClick={() => setProfileTypeFilter('individual')}
                        >
                            Bireysel
                        </button>
                        <button
                            className={`filter-btn ${profileTypeFilter === 'company' ? 'active' : ''}`}
                            onClick={() => setProfileTypeFilter('company')}
                        >
                            Şirket
                        </button>
                    </div>
                </section>

                {/* Incoming Requests Section */}
                <section className="incoming-requests-section">
                    <h2>Gelen Bağlantı İstekleri ({pendingIncomingRequests.length || 0})</h2>
                    <div className="incoming-requests-list">
                        {pendingIncomingRequests.length > 0 ? (
                            pendingIncomingRequests.map(req => {
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
                                            <h4>{sender.name + " " + sender.surname}</h4>
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
                            })
                        ) : (
                            <p className="no-requests-message">Şu anda bekleyen bağlantı isteği yok.</p>
                        )}
                    </div>
                </section>

                {/* Connection Recommendations Section (Placeholder) */}
                <section className="recommendations-section">
                <h2>Bağlantı Önerileri</h2>
                <div className="recommendations-list">
                    {connectionsLoading ? (
                    <div className="loading-recommendations">Öneriler yükleniyor...</div>
                    ) : suggestedConnections.length > 0 ? (
                    suggestedConnections.map((suggestion) => {
                        // Find the full user object for this suggestion
                        const suggestedUser = users.find(u => u.id === suggestion.id);
                        if (!suggestedUser) return null;

                        // Get connection status for this user
                        const connectionStatus = getConnectionStatus(suggestedUser.userId);

                        return (
                            <div key={suggestion.id} className="recommendation-card">
                                <img
                                    src={suggestion.profilePictureUrl || '/default-avatar.png'}
                                    alt={suggestion.name}
                                    className="recommendation-profile-image"
                                />
                                <div className="recommendation-info">
                                    <h4>{suggestion.name} {suggestion.surname}</h4>
                                    <p className="match-reason">{suggestion.matchReason}</p>
                                </div>
                                <div className="recommendation-actions">
                                    {connectionStatus === 'connected' ? (
                                        <span className="connection-badge connected">
                                            Bağlantı kuruldu
                                        </span>
                                    ) : connectionStatus === 'pending-outgoing' ? (
                                        <span className="connection-badge pending">
                                            Beklemede
                                        </span>
                                    ) : (
                                        <button
                                            className="connect-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sendConnectionRequest(suggestedUser.userId);
                                            }}
                                        >
                                            Bağlantı Kur
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                    ) : (
                    <p className="no-recommendations-message">
                        Şu anda mevcut bağlantı önerisi bulunamadı.
                    </p>
                    )}
                </div>
                </section>
            </div>

            {/* Right Column - User Grid with Pagination */}
            <div className="users-main-content">
                <section className="users-grid-container">
                    <h2>
                        {profileTypeFilter === 'all' ? 'Tüm Kullanıcılar' :
                         profileTypeFilter === 'company' ? 'Şirket Profilleri' :
                         'Bireysel Profiller'}
                    </h2>
                    <div className="users-grid">
                        {currentUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onConnect={sendConnectionRequest}
                                connectionStatus={getConnectionStatus(user.userId)}
                            />
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Önceki
                        </button>
                        <span className="pagination-info">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Sonraki
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </Layout>
);
}

export default SocialPage;
