import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, Star, Check, X } from 'lucide-react';
import '../../component-styles/JobApplicantsPage.css';
import Layout from "../page_layout/Layout";

const API_BASE = 'https://localhost:44388';
const APPLICATION_ROOT = `${API_BASE}/api/app/job-application`;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Add this helper function at the top
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? match[2] : null;
}

function JobApplicantsPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [bestMatches, setBestMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({}); // Track which applications are being updated

    useEffect(() => {
        fetchJobAndApplicants();
    }, [jobId]);

    // Add this function to update application status
    const updateApplicationStatus = async (applicationId, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [applicationId]: true }));
        
        try {
            // Get XSRF token
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include'
            });
            const xsrf = getCookie('XSRF-TOKEN');
            if (!xsrf) throw new Error('XSRF token not found');

            const response = await fetch(`${APPLICATION_ROOT}/${applicationId}/set-status`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrf,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            // Refresh the applicants list
            await fetchJobAndApplicants();
            
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update application status. Please try again.');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [applicationId]: false }));
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'Accepted';
            case 2: return 'Rejected';
            default: return 'Unknown';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return 'status-pending';
            case 1: return 'status-accepted';
            case 2: return 'status-rejected';
            default: return 'status-unknown';
        }
    };

    // Keep all your existing functions (fetchJobAndApplicants, handleSearch, clearSearch, etc.)
    const fetchJobAndApplicants = async () => {
        try {
            // Fetch job details
            const jobResponse = await fetch(`${API_BASE}/api/app/job-listing/${jobId}`, {
                credentials: 'include'
            });

            if (!jobResponse.ok) {
                throw new Error('Failed to fetch job details');
            }

            const jobData = await jobResponse.json();
            setJob(jobData);
            setJobTitle(jobData.title);

            // Fetch applicants
            const applicantsResponse = await fetch(
                `${APPLICATION_ROOT}/by-job-id/${jobId}` + 
                `?SkipCount=0&MaxResultCount=1000`,
                { credentials: 'include' }
            );
            
            if (!applicantsResponse.ok) {
                throw new Error('Failed to fetch applicants');
            }
            
            const dto = await applicantsResponse.json();
            const applicantsData = dto.items;
            setApplicants(applicantsData);
            setFilteredApplicants(applicantsData);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setBestMatches([]);
            setHasSearched(false);
            return;
        }
        
        setIsFiltering(true);
        setError('');
        setHasSearched(true);
        
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Given these job applicants' profiles: ${JSON.stringify(applicants)}, 
                                   find the best matches for this search query: "${searchQuery}". 
                                   Consider the job title: "${jobTitle}".
                                   Return only the IDs of the top matching applicants (maximum 5) in a JSON array format.
                                   Focus on relevance to the search criteria and job requirements.`
                        }]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to filter applicants');
            }
            
            const data = await response.json();
            let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const matchingIds = JSON.parse(raw);
            const matches = applicants.filter(a => matchingIds.includes(a.applicantId));
            setBestMatches(matches);
        } catch (err) {
            console.error('Error filtering applicants:', err);
            setError('Failed to filter applicants. Please try again.');
            setBestMatches([]);
        } finally {
            setIsFiltering(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setBestMatches([]);
        setHasSearched(false);
        setError('');
    };

    const renderApplicantCard = (applicant, isBestMatch = false) => (
        <div key={applicant.applicationId} className={`applicant-card ${isBestMatch ? 'best-match' : ''}`}>
            <div className="applicant-header">
                {isBestMatch && <Star size={16} className="star-icon" />}
                <User size={20} />
                <h3>{applicant.userName}</h3>
                <div className={`status-badge ${getStatusClass(applicant.status)}`}>
                    {getStatusText(applicant.status)}
                </div>
            </div>
            <div className="applicant-details">
                <div className="detail-item">
                    <Mail size={16} />
                    <span>{applicant.email}</span>
                </div>
                {applicant.phoneNumber && (
                    <div className="detail-item">
                        <Phone size={16} />
                        <span>{applicant.phoneNumber}</span>
                    </div>
                )}
                {applicant.latestExperience && (
                    <div className="detail-item">
                        <Briefcase size={16} />
                        <span>
                            {applicant.latestExperience.title} @ {applicant.latestExperience.companyName}
                        </span>
                    </div>
                )}
                {applicant.latestEducation && (
                    <div className="detail-item">
                        <GraduationCap size={16} />
                        <span>
                            {applicant.latestEducation.degree} @ {applicant.latestEducation.institution}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Action buttons */}
            <div className="applicant-actions">
                <button
                    className="accept-btn"
                    onClick={() => updateApplicationStatus(applicant.applicationId, 1)}
                    disabled={applicant.status === 1 || updatingStatus[applicant.applicationId]}
                >
                    <Check size={16} />
                    {updatingStatus[applicant.applicationId] ? 'Updating...' : 'Accept'}
                </button>
                <button
                    className="reject-btn"
                    onClick={() => updateApplicationStatus(applicant.applicationId, 2)}
                    disabled={applicant.status === 2 || updatingStatus[applicant.applicationId]}
                >
                    <X size={16} />
                    {updatingStatus[applicant.applicationId] ? 'Updating...' : 'Reject'}
                </button>
            </div>
            
            <div className="application-date">
                Applied on: {new Date(applicant.creationTime).toLocaleDateString()}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="job-applicants-page">
                <div className="loading-message">Loading...</div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="job-applicants-page">
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back to Jobs
                    </button>
                    <h1>Applicants for {job?.title}</h1>
                </div>

                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search applicants by skills, experience, education..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="filter-btn" disabled={isFiltering}>
                                <Filter size={20} />
                                {isFiltering ? 'Filtering...' : 'Filter'}
                            </button>
                            {hasSearched && (
                                <button type="button" className="clear-btn" onClick={clearSearch}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Best Matches Section */}
                {hasSearched && (
                    <div className="best-matches-section">
                        <div className="section-header">
                            <Star size={20} />
                            <h2>Best Matches for "{searchQuery}"</h2>
                            <span className="match-count">({bestMatches.length} found)</span>
                        </div>
                        <div className="best-matches-grid">
                            {bestMatches.length === 0 ? (
                                <div className="no-matches">
                                    No matching applicants found for your search criteria.
                                </div>
                            ) : (
                                bestMatches.map(applicant => renderApplicantCard(applicant, true))
                            )}
                        </div>
                    </div>
                )}

                {/* All Applicants Section */}
                <div className="all-applicants-section">
                    <div className="section-header">
                        <User size={20} />
                        <h2>All Applicants</h2>
                        <span className="applicant-count">({applicants.length} total)</span>
                    </div>
                    <div className="applicants-grid">
                        {applicants.length === 0 ? (
                            <div className="no-applicants">
                                No applicants yet.
                            </div>
                        ) : (
                            applicants.map(applicant => renderApplicantCard(applicant))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default JobApplicantsPage;