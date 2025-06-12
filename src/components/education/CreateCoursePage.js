import React, { useState } from "react";
import Layout from "../page_layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import "../../component-styles/CreateCoursePage.css";

const API_BASE_URL = "https://localhost:44388";
const COURSE_ROOT = `${API_BASE_URL}/api/app/course`;

// Helper to get XSRF cookie
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

function CreateCoursePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get XSRF token
      await fetch(`${API_BASE_URL}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");

      // Create course
      const response = await fetch(COURSE_ROOT, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Kurs oluşturma başarısız");
      }

      alert("Kurs başarıyla oluşturuldu!");
      navigate("/educationpage");
    } catch (err) {
      console.error("Create course error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/educationpage");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="create-course-container">
        <div className="create-course-header">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Geri Dön
          </button>
          <h1>Yeni Kurs Oluştur</h1>
        </div>

        <form onSubmit={handleSubmit} className="create-course-form">
          <div className="form-group">
            <label htmlFor="title">Kurs Başlığı *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={128}
              placeholder="Kursunuzun başlığını girin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Kurs Açıklaması</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={2048}
              rows={6}
              placeholder="Kursunuzun detaylı açıklamasını girin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnailUrl">Kapak Resmi URL'si</label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.thumbnailUrl && (
              <div className="thumbnail-preview">
                <img
                  src={formData.thumbnailUrl}
                  alt="Thumbnail preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Kursu hemen yayınla
            </label>
            <small>
              Bu seçeneği işaretlerseniz kurs hemen öğrencilere görünür
              olacaktır.
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !formData.title.trim()}
            >
              <Save size={18} />
              {loading ? "Oluşturuluyor..." : "Kursu Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CreateCoursePage;
