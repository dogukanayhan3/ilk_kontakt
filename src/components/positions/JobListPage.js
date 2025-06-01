import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWorkType, setFilterWorkType] = useState('');
    const [filterExperienceLevel, setFilterExperienceLevel] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchJobListings();
    }, []);

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
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                throw new Error('XSRF token bulunamadı');
            }

            const response = await fetch(JOB_LISTINGS_ROOT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('İş ilanı oluşturulamadı');
            }

            await fetchJobListings();
            setShowJobForm(false);
        } catch (err) {
            console.error('Create job listing error:', err);
            setError(err.message);
        }
    }

    async function updateJobListing(id, jobData) {
        try {
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                throw new Error('XSRF token bulunamadı');
            }

            const response = await fetch(`${JOB_LISTINGS_ROOT}/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('İş ilanı güncellenemedi');
            }

            await fetchJobListings();
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
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                throw new Error('XSRF token bulunamadı');
            }

            const response = await fetch(`${JOB_LISTINGS_ROOT}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('İş ilanı silinemedi');
            }

            await fetchJobListings();
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
                                <input
                                    type="text"
                                    placeholder="Konum filtrele..."
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {currentUser && currentUser.isCompanyProfile && (
                        <button
                            className="create-job-btn"
                            onClick={() => setShowJobForm(true)}
                        >
                            <Plus size={20} strokeWidth={2} />
                            Yeni İlan Ekle
                        </button>
                    )}
                </div>

                {/* Job Listings */}
                <section className="job-listings-container">
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
