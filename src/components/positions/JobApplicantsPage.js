import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Star,
} from "lucide-react";
import "../../component-styles/JobApplicantsPage.css";
import Layout from "../page_layout/Layout";

const API_BASE = "https://localhost:44388";
const APPLICATION_ROOT = `${API_BASE}/api/app/job-application`;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

function JobApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      // Fetch job details
      const jobResponse = await fetch(
        `${API_BASE}/api/app/job-listing/${jobId}`,
        {
          credentials: "include",
        }
      );

      if (!jobResponse.ok) {
        throw new Error("İş detayları alınamadı.");
      }

      const jobData = await jobResponse.json();
      setJob(jobData);
      setJobTitle(jobData.title);

      // Fetch applicants
      const applicantsResponse = await fetch(
        `${APPLICATION_ROOT}/by-job-id/${jobId}` +
          `?SkipCount=0&MaxResultCount=1000`,
        { credentials: "include" }
      );

      if (!applicantsResponse.ok) {
        throw new Error("Başvuranlar alınamadı.");
      }

      const dto = await applicantsResponse.json();
      const applicantsData = dto.items;
      setApplicants(applicantsData);
      setFilteredApplicants(applicantsData);
    } catch (err) {
      setError("Veriler yüklenemedi. Lütfen tekrar deneyin.");
      console.error("Error:", err);
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
    setError("");
    setHasSearched(true);

    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Given these job applicants' profiles: ${JSON.stringify(
                      applicants
                    )}, 
                                   find the best matches for this search query: "${searchQuery}". 
                                   Consider the job title: "${jobTitle}".
                                   Return only the IDs of the top matching applicants (maximum 5) in a JSON array format.
                                   Focus on relevance to the search criteria and job requirements.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Başvuranlar filtrelenemedi.");
      }

      const data = await response.json();
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      raw = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const matchingIds = JSON.parse(raw);
      const matches = applicants.filter((a) =>
        matchingIds.includes(a.applicantId)
      );
      setBestMatches(matches);
    } catch (err) {
      console.error("Error filtering applicants:", err);
      setError("Başvuranlar filtrelenemedi. Lütfen tekrar deneyin.");
      setBestMatches([]);
    } finally {
      setIsFiltering(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setBestMatches([]);
    setHasSearched(false);
    setError("");
  };

  const renderApplicantCard = (applicant, isBestMatch = false) => (
    <div
      key={applicant.applicationId}
      className={`applicant-card ${isBestMatch ? "best-match" : ""}`}
    >
      <div className="applicant-header">
        {isBestMatch && <Star size={16} className="star-icon" />}
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
        {applicant.latestExperience && (
          <div className="detail-item">
            <Briefcase size={16} />
            <span>
              {applicant.latestExperience.title} @{" "}
              {applicant.latestExperience.companyName}
            </span>
          </div>
        )}
        {applicant.latestEducation && (
          <div className="detail-item">
            <GraduationCap size={16} />
            <span>
              {applicant.latestEducation.degree} @{" "}
              {applicant.latestEducation.institution}
            </span>
          </div>
        )}
      </div>
      <div className="application-date">
        Başvuru tarihi: {new Date(applicant.creationTime).toLocaleDateString()}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="job-applicants-page">
        <div className="loading-message">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="job-applicants-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            İşlere Geri Dön
          </button>
          <h1>Başvuranlar: {job?.title}</h1>
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
              <button
                type="submit"
                className="filter-btn"
                disabled={isFiltering}
              >
                <Filter size={20} />
                {isFiltering ? "Filtering..." : "Filter"}
              </button>
              {hasSearched && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearSearch}
                >
                  Temizle
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
              <h2>En Uygun Eşleşmeler: "{searchQuery}"</h2>
              <span className="match-count">({bestMatches.length} found)</span>
            </div>
            <div className="best-matches-grid">
              {bestMatches.length === 0 ? (
                <div className="no-matches">
                  Arama kriterlerinize uygun başvuran bulunamadı.
                </div>
              ) : (
                bestMatches.map((applicant) =>
                  renderApplicantCard(applicant, true)
                )
              )}
            </div>
          </div>
        )}

        {/* All Applicants Section */}
        <div className="all-applicants-section">
          <div className="section-header">
            <User size={20} />
            <h2>Tüm Başvuranlar</h2>
            <span className="applicant-count">({applicants.length} total)</span>
          </div>
          <div className="applicants-grid">
            {applicants.length === 0 ? (
              <div className="no-applicants">Henüz başvuran yok.</div>
            ) : (
              applicants.map((applicant) => renderApplicantCard(applicant))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JobApplicantsPage;
