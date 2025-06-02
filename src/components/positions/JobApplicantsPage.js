import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap } from 'lucide-react';
import '../../component-styles/JobApplicantsPage.css';

const API_BASE = 'https://localhost:44388';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

function JobApplicantsPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        fetchJobAndApplicants();
    }, [jobId]);

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

            // Fetch applicants
            const applicantsResponse = await fetch(`${API_BASE}/api/app/job-application/by-job/${jobId}`, {
                credentials: 'include'
            });

            if (!applicantsResponse.ok) {
                throw new Error('Failed to fetch applicants');
            }

            const applicantsData = await applicantsResponse.json();
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
            setFilteredApplicants(applicants);
            return;
        }

        setIsFiltering(true);
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Given these job applicants' profiles: ${JSON.stringify(applicants)}, 
                                  find the best matches for this search query: "${searchQuery}". 
                                  Return only the IDs of matching applicants in a JSON array.`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to filter applicants');
            }

            const data = await response.json();
            const matchingIds = JSON.parse(data.candidates[0].content.parts[0].text);
            const filtered = applicants.filter(applicant => matchingIds.includes(applicant.id));
            setFilteredApplicants(filtered);
        } catch (err) {
            console.error('Error filtering applicants:', err);
            setError('Failed to filter applicants. Please try again.');
        } finally {
            setIsFiltering(false);
        }
    };

    if (isLoading) {
        return (
            <div className="job-applicants-page">
                <div className="loading-message">Loading...</div>
            </div>
        );
    }

    return (
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
                    </div>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="applicants-grid">
                {filteredApplicants.length === 0 ? (
                    <div className="no-applicants">
                        {searchQuery ? 'No matching applicants found.' : 'No applicants yet.'}
                    </div>
                ) : (
                    filteredApplicants.map(applicant => (
                        <div key={applicant.id} className="applicant-card">
                            <div className="applicant-header">
                                <User size={20} />
                                <h3>{applicant.userName}</h3>
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
                                {applicant.experience && (
                                    <div className="detail-item">
                                        <Briefcase size={16} />
                                        <span>{applicant.experience}</span>
                                    </div>
                                )}
                                {applicant.education && (
                                    <div className="detail-item">
                                        <GraduationCap size={16} />
                                        <span>{applicant.education}</span>
                                    </div>
                                )}
                            </div>
                            <div className="application-date">
                                Applied on: {new Date(applicant.creationTime).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default JobApplicantsPage; 