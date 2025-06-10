import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap } from 'lucide-react';
import '../../component-styles/JobApplicantsPage.css';
import Layout from "../page_layout/Layout";

const API_BASE = 'https://localhost:44388';
const APPLICATION_ROOT = `${API_BASE}/api/app/job-application`;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

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
    const [jobTitle, setJobTitle] = useState('');

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

            const applicantsResponse = await fetch(
                `${APPLICATION_ROOT}/by-job-id/${jobId}`
                + `?SkipCount=0&MaxResultCount=1000`,
                { credentials: 'include' }
              );
              if (!applicantsResponse.ok) {
                throw new Error('Failed to fetch applicants');
              }
              const dto = await applicantsResponse.json();
              const applicantsData = dto.items;   // <-- our new DTOs
              setApplicants(applicantsData);
              setFilteredApplicants(applicantsData);

            // Fetch job title
            if (jobResponse.ok) {
                const jobData = await jobResponse.json();
                setJobTitle(jobData.title);
            }
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
        setError('');
        try {
          const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
          // grab the raw LLM text
          let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // strip code fences
          raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          // parse the JSON array
          const matchingIds = JSON.parse(raw);
          // build matched + rest
          const matched = applicants.filter(a => matchingIds.includes(a.id));
          const others  = applicants.filter(a => !matchingIds.includes(a.id));
          setFilteredApplicants([...matched, ...others]);
        } catch (err) {
          console.error('Error filtering applicants:', err);
          setError('Failed to filter applicants. Please try again.');
        } finally {
          setIsFiltering(false);
        }
      };

    const analyzeApplicant = async (applicant) => {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Analyze this job applicant's profile and provide a brief assessment:

Applicant Name: ${applicant.name}
Experience: ${applicant.experience}
Education: ${applicant.education}
Skills: ${applicant.skills}
Job Title: ${jobTitle}

Please provide:
1. Overall assessment
2. Key strengths
3. Potential concerns
4. Recommendation (Strong, Moderate, or Weak)

Keep the response concise and professional.`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze applicant');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            console.error('Error analyzing applicant:', err);
            return 'Unable to analyze applicant at this time.';
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
                    </div>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="applicants-grid">
                {filteredApplicants.length === 0 ? (
                    <div className="no-applicants">
                        {searchQuery ? 'No matching applicants found.' : 'No applicants yet.'}
                    </div>
                ) : (  filteredApplicants.map(a => (
                        <div key={a.applicationId} className="applicant-card">
                        <div className="applicant-header">
                        <User size={20} />
                        <h3>{a.userName}</h3>
                        </div>
                        <div className="applicant-details">
                        <div className="detail-item">
                            <Mail size={16} /><span>{a.email}</span>
                        </div>
                        {a.phoneNumber && (
                            <div className="detail-item">
                            <Phone size={16} /><span>{a.phoneNumber}</span>
                            </div>
                        )}
                        {a.latestExperience && (
                            <div className="detail-item">
                            <Briefcase size={16} />
                            <span>
                                {a.latestExperience.title} @ {a.latestExperience.companyName}
                            </span>
                            </div>
                        )}
                        {a.latestEducation && (
                            <div className="detail-item">
                            <GraduationCap size={16} />
                            <span>
                                {a.latestEducation.degree} @ {a.latestEducation.institution}
                            </span>
                            </div>
                        )}
                        </div>
                        <div className="application-date">
                        Applied on: {new Date(a.creationTime).toLocaleDateString()}
                        </div>
                    </div>
                        ))
                    )}
            </div>
        </div>
        </Layout>
    );
}

export default JobApplicantsPage; 