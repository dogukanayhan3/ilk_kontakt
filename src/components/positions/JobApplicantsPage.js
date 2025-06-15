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
  Check,
  X,
  CheckCircle,
} from "lucide-react";
import "../../component-styles/JobApplicantsPage.css";
import Layout from "../page_layout/Layout";

const API_BASE = "https://localhost:44388";
const APPLICATION_ROOT = `${API_BASE}/api/app/job-application`;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Add this helper function at the top
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
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
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [celebratingApplicant, setCelebratingApplicant] = useState(null);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  // Filter out accepted applicants
  const availableApplicants = applicants.filter(
    (applicant) => applicant.status !== 1
  );

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [applicationId]: true }));

    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token not found");

      const response = await fetch(
        `${APPLICATION_ROOT}/${applicationId}/set-status`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            RequestVerificationToken: xsrf,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      // If accepting an applicant, trigger celebration animation
      if (newStatus === 1) {
        setCelebratingApplicant(applicationId);
        // Remove celebration after animation completes
        setTimeout(() => {
          setCelebratingApplicant(null);
        }, 2000);
      }

      await fetchJobAndApplicants();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update application status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Beklemede";
      case 1:
        return "Kabul Edildi";
      case 2:
        return "Reddedildi";
      default:
        return "Bilinmiyor";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return "status-pending";
      case 1:
        return "status-accepted";
      case 2:
        return "status-rejected";
      default:
        return "status-unknown";
    }
  };

  const fetchJobAndApplicants = async () => {
    try {
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
                    text: `You are an expert HR assistant. Analyze these job applicants and find the best matches for the search criteria.

Job Title: "${jobTitle}"
Search Query: "${searchQuery}"

Applicants Data:
${JSON.stringify(availableApplicants, null, 2)}

Instructions:
1. Analyze each applicant's profile (experience, education, skills)
2. Match them against the search query and job requirements
3. Select the top 5 most relevant candidates
4. Return ONLY a JSON array of applicant IDs, nothing else

Example response format:
["id1", "id2", "id3"]

Response:`,
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
      let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      console.log("Raw Gemini response:", responseText);

      // Extract JSON array from the response
      let matchingIds = [];
      try {
        // Try to find JSON array in the response
        const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          matchingIds = JSON.parse(jsonString);
          console.log("Extracted IDs:", matchingIds);
        } else {
          throw new Error("No JSON array found in response");
        }
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        // Fallback: try to extract IDs using regex
        const idPattern = /"([a-f0-9-]{36})"/gi;
        const matches = responseText.match(idPattern);
        if (matches) {
          matchingIds = matches
            .map((match) => match.replace(/"/g, ""))
            .slice(0, 5);
          console.log("Fallback extracted IDs:", matchingIds);
        }
      }

      if (matchingIds.length === 0) {
        setBestMatches([]);
        setError("No matching applicants found for your search criteria.");
        return;
      }

      // Find matching applicants using applicantId from available applicants only
      const matches = availableApplicants.filter((applicant) =>
        matchingIds.includes(applicant.applicantId)
      );

      console.log("Matched applicants:", matches);
      setBestMatches(matches);

      if (matches.length === 0) {
        setError(
          "Found matching IDs but couldn't locate corresponding applicants."
        );
      }
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

  const renderApplicantCard = (applicant, isBestMatch = false) => {
    const isCelebrating = celebratingApplicant === applicant.applicationId;
    const isAccepted = applicant.status === 1;

    return (
      <div
        key={applicant.applicationId}
        className={`applicant-card ${isBestMatch ? "best-match" : ""} ${
          isCelebrating ? "celebrating" : ""
        } ${isAccepted ? "accepted-card" : ""}`}
      >
        {isCelebrating && (
          <div className="celebration-overlay">
            <div className="celebration-content">
              <CheckCircle size={48} className="celebration-icon" />
              <div className="celebration-text">Tebrikler!</div>
              <div className="celebration-subtext">
                {applicant.userName} kabul edildi!
              </div>
            </div>
            <div className="confetti">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`confetti-piece confetti-${i}`}></div>
              ))}
            </div>
          </div>
        )}

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

        {/* Only show action buttons for pending and rejected applicants */}
        {(applicant.status === 0 || applicant.status === 2) && (
          <div className="applicant-actions">
            <button
              className="accept-btn"
              onClick={() =>
                updateApplicationStatus(applicant.applicationId, 1)
              }
              disabled={updatingStatus[applicant.applicationId]}
            >
              <Check size={16} />
              {updatingStatus[applicant.applicationId]
                ? "Kabul Ediliyor..."
                : "Kabul Et"}
            </button>
            <button
              className="reject-btn"
              onClick={() =>
                updateApplicationStatus(applicant.applicationId, 2)
              }
              disabled={updatingStatus[applicant.applicationId]}
            >
              <X size={16} />
              {updatingStatus[applicant.applicationId]
                ? "Reddediliyor..."
                : "Reddet"}
            </button>
          </div>
        )}

        {/* Show accepted message for accepted applicants */}
        {applicant.status === 1 && (
          <div className="accepted-message">
            <CheckCircle size={20} className="accepted-icon" />
            <span>Bu başvuru pozisyon için kabul edildi!</span>
          </div>
        )}

        <div className="application-date">
          Başvuru Tarihi: {new Date(applicant.creationTime).toLocaleDateString()}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="job-applicants-page">
        <div className="loading-message">Yükleniyor...</div>
      </div>
    );
  }

  const acceptedCount = applicants.filter(
    (applicant) => applicant.status === 1
  ).length;

  return (
    <Layout>
      <div className="job-applicants-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            İşlere Geri Dön
          </button>
          <h1>Başvuranlar: {job?.title}</h1>
          {acceptedCount > 0 && (
            <div className="accepted-count-badge">
              <CheckCircle size={16} />
              {acceptedCount} Kabul Edildi
            </div>
          )}
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Adayları yeteneklerine, deneyimlerine ve eğitim geçmişlerine göre filtreleyin!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="filter-btn"
                disabled={isFiltering}
              >
                <Filter size={20} />
                {isFiltering ? "Filtreleniyor..." : "Filtrele"}
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
              <span className="match-count">({bestMatches.length} bulundu)</span>
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

        {/* All Available Applicants Section */}
        <div className="all-applicants-section">
          <div className="section-header">
            <User size={20} />
            <h2>Mevcut Başvuranlar</h2>
            <span className="applicant-count">
              ({availableApplicants.length} mevcut)
            </span>
          </div>
          <div className="applicants-grid">
            {availableApplicants.length === 0 ? (
              <div className="no-applicants">
                {acceptedCount > 0
                  ? "Tüm başvuranlar değerlendirildi."
                  : "Henüz başvuran yok."}
              </div>
            ) : (
              availableApplicants.map((applicant) =>
                renderApplicantCard(applicant)
              )
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JobApplicantsPage;