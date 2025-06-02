import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import Layout from "../page_layout/Layout";
import Job from "./Job";
import JobForm from "./JobForm";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/JobListings.css";

const API_BASE = 'https://localhost:44388';
const JOB_LISTINGS_ROOT = `${API_BASE}/api/app/job-listing`;

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function JobListPage() {
    const [jobListings, setJobListings] = useState([]);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companyJobsLoading, setCompanyJobsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWorkType, setFilterWorkType] = useState('');
    const [filterExperienceLevel, setFilterExperienceLevel] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const { currentUser } = useAuth();

    // Helper function for authenticated requests
    async function makeAuthenticatedRequest(url, options = {}) {
        // Get XSRF token
        await fetch(`${API_BASE}/api/abp/application-configuration`, {
            credentials: 'include',
        });
        const xsrfToken = getCookie('XSRF-TOKEN');
        
        if (!xsrfToken) {
            throw new Error('XSRF token bulunamadı');
        }

        // Merge headers
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'RequestVerificationToken': xsrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        };

        const mergedOptions = {
            credentials: 'include',
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        return fetch(url, mergedOptions);
    }

    const fetchCompanyJobs = useCallback(async () => {
        if (!currentUser?.id) return;
        
        setCompanyJobsLoading(true);
        try {
            const response = await makeAuthenticatedRequest(
                `${JOB_LISTINGS_ROOT}/by-creator`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Şirket iş ilanları yüklenemedi');
            }

            const data = await response.json();
            console.log('Company jobs fetched:', data);
            setCompanyJobs(data.items || []);
        } catch (e) {
            console.error('Error fetching company jobs:', e);
            setCompanyJobs([]);
        } finally {
            setCompanyJobsLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        fetchJobListings();
        if (currentUser?.isCompanyProfile && currentUser?.id) {
            fetchCompanyJobs();
        }
    }, [currentUser, fetchCompanyJobs]);

    async function fetchJobListings() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${JOB_LISTINGS_ROOT}?SkipCount=0&MaxResultCount=100`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('İş ilanları yüklenemedi');
            }

            const data = await response.json();
            setJobListings(data.items || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function createJobListing(jobData) {
        try {
            const response = await makeAuthenticatedRequest(JOB_LISTINGS_ROOT, {
                method: 'POST',
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('İş ilanı oluşturulamadı');
            }

            // Refresh both lists
            await fetchJobListings();
            if (currentUser?.isCompanyProfile) {
                await fetchCompanyJobs();
            }
            setShowJobForm(false);
        } catch (err) {
            console.error('Create job listing error:', err);
            setError(err.message);
        }
    }

    async function updateJobListing(id, jobData) {
        try {
            const response = await makeAuthenticatedRequest(`${JOB_LISTINGS_ROOT}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('İş ilanı güncellenemedi');
            }

            // Refresh both lists
            await fetchJobListings();
            if (currentUser?.isCompanyProfile) {
                await fetchCompanyJobs();
            }
            setEditingJob(null);
            setShowJobForm(false);
        } catch (err) {
            console.error('Update job listing error:', err);
            setError(err.message);
        }
    }

    async function deleteJobListing(id) {
        if (!window.confirm('Bu iş ilanını silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await makeAuthenticatedRequest(`${JOB_LISTINGS_ROOT}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('İş ilanı silinemedi');
            }

            // Refresh both lists
            await fetchJobListings();
            if (currentUser?.isCompanyProfile) {
                await fetchCompanyJobs();
            }
        } catch (err) {
            console.error('Delete job listing error:', err);
            setError(err.message);
        }
    }

    const handleEditJob = (job) => {
        setEditingJob(job);
        setShowJobForm(true);
    };

    const handleCloseForm = () => {
        setShowJobForm(false);
        setEditingJob(null);
    };

    // Filter all jobs for the main listing
    const filteredJobs = jobListings.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesWorkType = !filterWorkType || job.workType.toString() === filterWorkType;
        const matchesExperienceLevel = !filterExperienceLevel || job.experienceLevel.toString() === filterExperienceLevel;
        const matchesLocation = !filterLocation || 
                              (job.location && job.location.toLowerCase().includes(filterLocation.toLowerCase()));

        return matchesSearch && matchesWorkType && matchesExperienceLevel && matchesLocation;
    });

    if (loading) return (
        <Layout>
            <div className="loading-container">
                <div className="loading-message">İş ilanları yükleniyor...</div>
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

    return (
        <Layout>
            <section className="welcome">
                <h1>Açık Pozisyonlar</h1>
                <p>Yeni kariyer fırsatınızı bulun!</p>
            </section>

            <div className="job-listings-page-container">
                {/* Company's Own Listings Section */}
                {currentUser?.isCompanyProfile && (
                    <section className="company-listings-section">
                        <div className="section-header">
                            <h2>İlanlarım ({companyJobs.length})</h2>
                            <button
                                className="create-job-btn"
                                onClick={() => setShowJobForm(true)}
                            >
                                <Plus size={20} strokeWidth={2} />
                                Yeni İlan Ekle
                            </button>
                        </div>
                        
                        {companyJobsLoading ? (
                            <div className="loading-message">Şirket ilanları yükleniyor...</div>
                        ) : companyJobs.length === 0 ? (
                            <div className="no-company-jobs">
                                <p>Henüz iş ilanınız bulunmuyor.</p>
                                <button
                                    className="create-first-job-btn"
                                    onClick={() => setShowJobForm(true)}
                                >
                                    İlk İlanınızı Oluşturun
                                </button>
                            </div>
                        ) : (
                            <div className="company-jobs-row">
                                {companyJobs.map(job => (
                                    <div key={job.id} className="company-job-card">
                                        <div className="company-job-content">
                                            <div className="company-job-info">
                                                <h3>{job.title}</h3>
                                                <p className="company-job-meta">
                                                    {job.location && <span>{job.location}</span>}
                                                    <span className="work-type">
                                                        {job.workType === 0 ? 'Ofiste' : 
                                                         job.workType === 1 ? 'Uzaktan' : 'Hibrit'}
                                                    </span>
                                                </p>
                                                <p className="company-job-description">
                                                    {job.description ? 
                                                        (job.description.length > 100 ? 
                                                            job.description.substring(0, 100) + '...' : 
                                                            job.description
                                                        ) : 
                                                        'Açıklama bulunmuyor'
                                                    }
                                                </p>
                                            </div>
                                            <div className="company-job-actions">
                                                <button
                                                    className="edit-job-btn"
                                                    onClick={() => handleEditJob(job)}
                                                    title="Düzenle"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="delete-job-btn"
                                                    onClick={() => deleteJobListing(job.id)}
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Controls Section */}
                <div className="job-controls-section">
                    <div className="search-filter-container">
                        <div className="search-box">
                            <Search size={20} strokeWidth={1.5} />
                            <input
                                type="text"
                                placeholder="İş pozisyonu, şirket veya açıklama ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-container">
                            <div className="filter-group">
                                <Filter size={16} strokeWidth={1.5} />
                                <select
                                    value={filterWorkType}
                                    onChange={(e) => setFilterWorkType(e.target.value)}
                                >
                                    <option value="">Tüm Çalışma Türleri</option>
                                    <option value="0">Ofiste</option>
                                    <option value="1">Uzaktan</option>
                                    <option value="2">Hibrit</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <Filter size={16} strokeWidth={1.5} />
                                <select
                                    value={filterExperienceLevel}
                                    onChange={(e) => setFilterExperienceLevel(e.target.value)}
                                >
                                    <option value="">Tüm Deneyim Seviyeleri</option>
                                    <option value="0">Staj</option>
                                    <option value="1">Giriş Seviyesi</option>
                                    <option value="2">Orta Seviye</option>
                                    <option value="3">Üst Seviye</option>
                                    <option value="4">Direktör</option>
                                    <option value="5">Yönetici</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <Filter size={16} strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Konum filtrele..."
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Job Listings */}
                <section className="all-listings-section">
                    <h2>Tüm İlanlar</h2>
                    <div className="job-listings-grid">
                        {filteredJobs.length === 0 ? (
                            <div className="no-jobs-message">
                                <p>
                                    {searchTerm || filterWorkType || filterExperienceLevel || filterLocation
                                        ? 'Arama kriterlerinize uygun iş ilanı bulunamadı.'
                                        : 'Henüz iş ilanı bulunmuyor.'
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredJobs.map((job) => (
                                <Job
                                    key={job.id}
                                    job={job}
                                    onEdit={handleEditJob}
                                    onDelete={deleteJobListing}
                                    currentUser={currentUser}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Job Form Modal */}
                {showJobForm && (
                    <JobForm
                        job={editingJob}
                        onSubmit={editingJob ? 
                            (data) => updateJobListing(editingJob.id, data) : 
                            createJobListing
                        }
                        onClose={handleCloseForm}
                    />
                )}
            </div>
        </Layout>
    );
}

export default JobListPage;