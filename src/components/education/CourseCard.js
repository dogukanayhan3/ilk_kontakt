// src/components/CourseCard.jsx
import { Users, Award, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../component-styles/EducationPage.css";

const API_BASE = "https://localhost:44388";
const ENROLLMENT_ROOT = `${API_BASE}/api/app/enrollment`;

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

export default function CourseCard({ course }) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 1. Find and remove "URL: ..." from description
  //    Supports instructors writing e.g. "Some text. URL: https://example.com/path"
  const urlRegex = /URL:\s*(https?:\/\/\S+)/i;
  const match = course.description.match(urlRegex);
  const linkUrl = match ? match[1] : null;

  // 2. Strip that part out of the displayed description
  const displayedDescription = linkUrl
    ? course.description.replace(urlRegex, "").trim()
    : course.description;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEnrollment = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsEnrolling(true);
    setError("");
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");

      const res = await fetch(ENROLLMENT_ROOT, {
        method: "POST",
        credentials: "include",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          courseId: course.id,
          studentId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Kayıt işlemi başarısız");
      }
      alert("Kursa başarıyla kaydoldunuz!");
    } catch (err) {
      console.error(err);
      setError("Bu kursa zaten kayıtlısınız.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCardClick = () => {
    if (linkUrl) {
      window.open(linkUrl, "_blank", "noopener");
    }
  };

  const getInstructorDisplayName = () => {
    if (course.instructorFullName?.trim()) return course.instructorFullName;
    const name = course.instructorName || "";
    const surname = course.instructorSurname || "";
    return (name + " " + surname).trim() || "Bilinmeyen Eğitmen";
  };

  return (
    <div
      className="course-listing"
      onClick={handleCardClick}
      style={{ cursor: linkUrl ? "pointer" : "default" }}
    >
      <div className="course-image">
        <img
          src={course.thumbnailUrl || "/default-course-image.jpg"}
          alt={course.title}
        />
      </div>

      <div className="course-details">
        <h3>{course.title}</h3>
        <p>{displayedDescription}</p>

        <div className="course-meta">
          <div className="instructor-info">
            <Users size={18} strokeWidth={1.5} />
            <div>
              <strong>Eğitmen: {getInstructorDisplayName()}</strong>
              <p>Oluşturulma: {formatDate(course.creationTime)}</p>
            </div>
          </div>
          <div className="course-status">
            <Award size={18} strokeWidth={1.5} />
            <p>{course.isPublished ? "Yayında" : "Taslak"}</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="course-footer">
          <button
            className="apply-btn"
            disabled={isEnrolling}
            onClick={(e) => {
              e.stopPropagation();
              handleEnrollment();
            }}
          >
            {isEnrolling ? "Kaydediliyor..." : "Kursa Kayıt Ol"}
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}