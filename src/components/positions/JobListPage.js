import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Layout from "../page_layout/Layout";
import Job from "./Job";
import JobForm from "./JobForm";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/JobListings.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://localhost:44388";
const JOB_LISTINGS_ROOT = `${API_BASE}/api/app/job-listing`;

const APPLICATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: "Pending",
  [APPLICATION_STATUS.ACCEPTED]: "Accepted",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
};

const APPLICATION_STATUS_ICONS = {
  [APPLICATION_STATUS.PENDING]: Clock,
  [APPLICATION_STATUS.ACCEPTED]: CheckCircle2,
  [APPLICATION_STATUS.REJECTED]: XCircle,
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Status Progress Component
function StatusProgress({ status }) {
  const getStatusStep = (status) => {
    switch (status) {
      case 0:
        return 1; // Pending
      case 1:
        return 3; // Accepted
      case 2:
        return 0; // Rejected
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(status);

  return (
    <div className="status-progress">
      <div className="progress-line">
        {/* Rejected dot */}
        <div
          className={`progress-dot rejected ${
            currentStep === 0 ? "active" : ""
          }`}
        >
          <XCircle size={16} />
        </div>

        {/* Pending dot */}
        <div
          className={`progress-dot pending ${
            currentStep === 1 ? "active" : ""
          }`}
        >
          <Clock size={16} />
        </div>

        {/* Accepted dot */}
        <div
          className={`progress-dot accepted ${
            currentStep === 3 ? "active" : ""
          }`}
        >
          <CheckCircle2 size={16} />
        </div>

        {/* Progress line background */}
        <div className="progress-line-bg"></div>

        {/* Active progress line */}
        <div
          className={`progress-line-active ${
            currentStep === 0
              ? "rejected-line"
              : currentStep === 1
              ? "pending-line"
              : "accepted-line"
          }`}
          style={{
            width:
              currentStep === 0 ? "0%" : currentStep === 1 ? "50%" : "100%",
          }}
        ></div>
      </div>

      <div className="status-labels">
        <span className={`status-label ${currentStep === 0 ? "active" : ""}`}>
          Rejected
        </span>
        <span className={`status-label ${currentStep === 1 ? "active" : ""}`}>
          Pending
        </span>
        <span className={`status-label ${currentStep === 3 ? "active" : ""}`}>
          Accepted
        </span>
      </div>
    </div>
  );
}

function JobListPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [jobListings, setJobListings] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyJobsLoading, setCompanyJobsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");
  const [filterExperienceLevel, setFilterExperienceLevel] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // ... (keep all existing functions unchanged until the render section)

  async function fetchJobListings() {
    setLoading(true);
    setError("");
    try {
      // Fetch all job listings
      const res = await fetch(
        `${JOB_LISTINGS_ROOT}?SkipCount=0&MaxResultCount=100`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("İş ilanları yüklenemedi");
      const data = await res.json();
      setJobListings(data.items || []);

      // Fetch company jobs if user is a company
      if (currentUser?.isCompanyProfile) {
        setCompanyJobsLoading(true);
        try {
          // 1) hit config to set XSRF cookie
          await fetch(`${API_BASE}/api/abp/application-configuration`, {
            credentials: "include",
          });
          // 2) read token
          const xsrf = getCookie("XSRF-TOKEN");
          if (!xsrf) throw new Error("XSRF token bulunamadı");
          // 3) fetch company jobs
          const companyRes = await fetch(`${JOB_LISTINGS_ROOT}/by-creator`, {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              RequestVerificationToken: xsrf,
              "X-Requested-With": "XMLHttpRequest",
            },
          });
          if (!companyRes.ok) {
            const text = await companyRes.text();
            console.error(text);
            throw new Error("Şirket iş ilanları yüklenemedi");
          }
          const companyData = await companyRes.json();
          setCompanyJobs(companyData.items || []);
        } catch (e) {
          console.error(e);
          setCompanyJobs([]);
        } finally {
          setCompanyJobsLoading(false);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createJobListing(jobData) {
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");
      const res = await fetch(JOB_LISTINGS_ROOT, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) throw new Error("İş ilanı oluşturulamadı");
      await fetchJobListings();
      setShowJobForm(false);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }

  async function updateJobListing(id, jobData) {
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");
      const res = await fetch(`${JOB_LISTINGS_ROOT}/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) throw new Error("İş ilanı güncellenemedi");
      await fetchJobListings();
      setEditingJob(null);
      setShowJobForm(false);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }

  async function deleteJobListing(id) {
    if (!window.confirm("Bu iş ilanını silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");
      const res = await fetch(`${JOB_LISTINGS_ROOT}/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!res.ok) throw new Error("İş ilanı silinemedi");
      await fetchJobListings();
    } catch (e) {
      console.error(e);
      setError(e.message);
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

  const handleJobClick = (jobId) => {
    navigate(`/job-applicants/${jobId}`);
  };

  const filteredJobs = jobListings.filter((job) => {
    const lower = (s = "") => s.toLowerCase();
    const matchesSearch =
      lower(job.title).includes(lower(searchTerm)) ||
      lower(job.company).includes(lower(searchTerm)) ||
      (job.description && lower(job.description).includes(lower(searchTerm)));
    const matchesWorkType =
      !filterWorkType || job.workType.toString() === filterWorkType;
    const matchesExp =
      !filterExperienceLevel ||
      job.experienceLevel.toString() === filterExperienceLevel;
    const matchesLoc =
      !filterLocation ||
      (job.location && lower(job.location).includes(lower(filterLocation)));
    return matchesSearch && matchesWorkType && matchesExp && matchesLoc;
  });

  const fetchMyApplications = async () => {
    if (!currentUser || currentUser.isCompanyProfile) return;

    setLoadingApplications(true);
    try {
      // Get XSRF token first
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");

      const response = await fetch(
        `${API_BASE}/api/app/job-application/my-applications`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            RequestVerificationToken: xsrf,
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!response.ok) throw new Error("Başvurular alınamadı.");

      const applications = await response.json();

      // Fetch job details for each application
      const applicationsWithDetails = await Promise.all(
        applications.map(async (application) => {
          try {
            const jobResponse = await fetch(
              `${JOB_LISTINGS_ROOT}/${application.jobListingId}`,
              {
                credentials: "include",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );

            if (!jobResponse.ok) throw new Error("İş detayları alınamadı.");

            const jobDetails = await jobResponse.json();
            return {
              ...application,
              jobTitle: jobDetails.title,
              companyName: jobDetails.company,
              creationTime: application.creationTime,
            };
          } catch (err) {
            console.error("Error fetching job details:", err);
            return application;
          }
        })
      );

      setMyApplications(applicationsWithDetails);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const getStatusIcon = (status) => {
    const Icon =
      APPLICATION_STATUS_ICONS[status?.toLowerCase()] ||
      APPLICATION_STATUS_ICONS[APPLICATION_STATUS.PENDING];
    return <Icon size={16} />;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return APPLICATION_STATUS_LABELS[APPLICATION_STATUS.PENDING];
      case 1:
        return APPLICATION_STATUS_LABELS[APPLICATION_STATUS.ACCEPTED];
      case 2:
        return APPLICATION_STATUS_LABELS[APPLICATION_STATUS.REJECTED];
      default:
        return APPLICATION_STATUS_LABELS[APPLICATION_STATUS.PENDING];
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return APPLICATION_STATUS.PENDING;
      case 1:
        return APPLICATION_STATUS.ACCEPTED;
      case 2:
        return APPLICATION_STATUS.REJECTED;
      default:
        return APPLICATION_STATUS.PENDING;
    }
  };

  useEffect(() => {
    fetchJobListings();
    fetchMyApplications();
  }, [currentUser]);

  if (loading)
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-message">İş ilanları yükleniyor...</div>
        </div>
      </Layout>
    );
  if (error)
    return (
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
        {/* Left Sidebar */}
        <div className="job-listings-sidebar">
          {/* Search and Filters Section */}
          <section className="search-filter-section">
            <h2>Arama ve Filtreler</h2>
            <div className="search-box">
              <Search size={20} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="İş pozisyonu, şirket veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-groups">
              <div className="filter-group">
                <label>Çalışma Türü</label>
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
                <label>Deneyim Seviyesi</label>
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
                <label>Konum</label>
                <input
                  type="text"
                  placeholder="Konum filtrele..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* My Applications Section */}
          {currentUser && !currentUser.isCompanyProfile && (
            <section className="my-applications-sidebar-section">
              <h2>Başvurularım</h2>
              {loadingApplications ? (
                <div className="loading-message">Başvurular yükleniyor...</div>
              ) : myApplications.length === 0 ? (
                <div className="no-applications">
                  <p>Henüz hiçbir işe başvurmadınız.</p>
                </div>
              ) : (
                <div className="applications-list">
                  {myApplications.map((application) => (
                    <div
                      key={application.id}
                      className="application-sidebar-card"
                    >
                      <div className="application-sidebar-header">
                        <h4>{application.jobTitle}</h4>
                        <span className="company-name">
                          {application.companyName}
                        </span>
                      </div>

                      <StatusProgress status={application.status} />

                      <div className="application-date">
                        <span>
                          Başvuru:{" "}
                          {new Date(
                            application.creationTime
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Main Content */}
        <div className="job-listings-main-content">
          {currentUser?.isCompanyProfile && (
            <section className="company-listings-section">
              <div className="section-header">
                <h2>İlanlarım ({companyJobs.length})</h2>
                <button
                  className="create-job-btn"
                  onClick={() => setShowJobForm(true)}
                >
                  <Plus size={20} strokeWidth={2} /> Yeni İlan Ekle
                </button>
              </div>
              {companyJobsLoading ? (
                <div className="loading-message">
                  Şirket ilanları yükleniyor...
                </div>
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
                  {companyJobs.map((job) => (
                    <div
                      key={job.id}
                      className="company-job-card"
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="company-job-content">
                        <div className="company-job-info">
                          <h3>{job.title}</h3>
                          <div className="company-job-meta">
                            <span className="work-type">
                              {job.workType === 0
                                ? "Ofiste"
                                : job.workType === 1
                                ? "Uzaktan"
                                : "Hibrit"}
                            </span>
                            <span>{job.location}</span>
                          </div>
                          <p className="company-job-description">
                            {job.description
                              ? job.description.length > 100
                                ? job.description.substring(0, 100) + "..."
                                : job.description
                              : "Açıklama bulunmuyor"}
                          </p>
                        </div>
                        <div className="company-job-actions">
                          <button
                            className="edit-job-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditJob(job);
                            }}
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="delete-job-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteJobListing(job.id);
                            }}
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

          <section className="all-listings-section">
            <h2>Tüm İlanlar</h2>
            <div className="job-listings-grid">
              {filteredJobs.length === 0 ? (
                <div className="no-jobs-message">
                  <p>
                    {searchTerm ||
                    filterWorkType ||
                    filterExperienceLevel ||
                    filterLocation
                      ? "Arama kriterlerinize uygun iş ilanı bulunamadı."
                      : "Henüz iş ilanı bulunmuyor."}
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
        </div>
      </div>

      {showJobForm && (
        <JobForm
          job={editingJob}
          onSubmit={
            editingJob
              ? (data) => updateJobListing(editingJob.id, data)
              : createJobListing
          }
          onClose={handleCloseForm}
        />
      )}
    </Layout>
  );
}

export default JobListPage;
