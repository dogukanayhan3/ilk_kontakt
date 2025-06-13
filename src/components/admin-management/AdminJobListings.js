import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Save, X, RefreshCw, Briefcase, MapPin, Building, Calendar } from "lucide-react";

const API_BASE = "https://localhost:44388";

export default function AdminJobListings() {
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/app/job-listing?MaxResultCount=1000`, {
        credentials: "include",
      });
      const data = await res.json();
      setJobs(data.items || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function startEdit(job) {
    setEditing(job.id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      location: job.location || "",
      salary: job.salary || "",
      jobType: job.jobType || "",
      experienceLevel: job.experienceLevel || "",
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      contactEmail: job.contactEmail || "",
      applicationDeadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      await fetch(`${API_BASE}/api/app/job-listing/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          ...form,
          applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : null,
        }),
      });
      setEditing(null);
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("İş ilanı silinsin mi?")) return;
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      await fetch(`${API_BASE}/api/app/job-listing/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  }

  const toggleJobExpansion = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "N/A";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-stats">
          <span className="stat-item">
            <Briefcase size={16} />
            Toplam İlan: <strong>{jobs.length}</strong>
          </span>
          <span className="stat-item">
            Aktif: <strong>{jobs.filter(j => new Date(j.applicationDeadline) > new Date()).length}</strong>
          </span>
        </div>
        <button className="refresh-btn" onClick={fetchJobs}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="no-data">
          <Briefcase size={48} />
          <p>İş ilanı bulunamadı.</p>
        </div>
      ) : (
        <div className="enhanced-table-container">
          <div className="table-wrapper">
            <table className="enhanced-admin-table">
              <thead>
                <tr>
                  <th>İş Başlığı</th>
                  <th>Şirket</th>
                  <th>Konum</th>
                  <th>Maaş</th>
                  <th>Tür</th>
                  <th>Deneyim</th>
                  <th>Son Başvuru</th>
                  <th>Açıklama</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) =>
                  editing === job.id ? (
                    <tr key={job.id} className="editing-row">
                      <td colSpan="9">
                        <div className="edit-form-container">
                          <div className="edit-form-grid">
                            <div className="form-group">
                              <label>İş Başlığı</label>
                              <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="İş başlığı"
                              />
                            </div>
                            <div className="form-group">
                              <label>Şirket</label>
                              <input
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                placeholder="Şirket adı"
                              />
                            </div>
                            <div className="form-group">
                              <label>Konum</label>
                              <input
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                placeholder="Çalışma konumu"
                              />
                            </div>
                            <div className="form-group">
                              <label>Maaş</label>
                              <input
                                value={form.salary}
                                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                placeholder="Maaş bilgisi"
                              />
                            </div>
                            <div className="form-group">
                              <label>İş Türü</label>
                              <select
                                value={form.jobType}
                                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                              >
                                <option value="">Seçiniz</option>
                                <option value="Tam Zamanlı">Tam Zamanlı</option>
                                <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Staj">Staj</option>
                                <option value="Uzaktan">Uzaktan</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Deneyim Seviyesi</label>
                              <select
                                value={form.experienceLevel}
                                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                              >
                                <option value="">Seçiniz</option>
                                <option value="Giriş Seviyesi">Giriş Seviyesi</option>
                                <option value="Orta Seviye">Orta Seviye</option>
                                <option value="Üst Seviye">Üst Seviye</option>
                                <option value="Uzman">Uzman</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>İletişim E-postası</label>
                              <input
                                type="email"
                                value={form.contactEmail}
                                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                placeholder="İletişim e-postası"
                              />
                            </div>
                            <div className="form-group">
                              <label>Son Başvuru Tarihi</label>
                              <input
                                type="date"
                                value={form.applicationDeadline}
                                onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                              />
                            </div>
                            <div className="form-group full-width">
                              <label>İş Açıklaması</label>
                              <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="İş açıklaması"
                                rows="4"
                              />
                            </div>
                            <div className="form-group full-width">
                              <label>Gereksinimler</label>
                              <textarea
                                value={form.requirements}
                                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                placeholder="İş gereksinimleri"
                                rows="3"
                              />
                            </div>
                            <div className="form-group full-width">
                              <label>Yan Haklar</label>
                              <textarea
                                value={form.benefits}
                                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                                placeholder="Yan haklar ve avantajlar"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="form-actions">
                            <button className="save-btn" onClick={() => saveEdit(job.id)}>
                              <Save size={16} />
                              Kaydet
                            </button>
                            <button className="cancel-btn" onClick={() => setEditing(null)}>
                              <X size={16} />
                              İptal
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={job.id} className="data-row">
                      <td>
                        <div className="job-title">
                          <Briefcase size={16} />
                          <strong>{job.title || "N/A"}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="company-info">
                          <Building size={14} />
                          {job.company || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="location-info">
                          <MapPin size={14} />
                          {job.location || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="salary-info">
                          {job.salary || "Belirtilmemiş"}
                        </div>
                      </td>
                      <td>
                        <span className={`job-type-badge ${job.jobType || 'default'}`}>
                          {job.jobType || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`experience-badge ${job.experienceLevel || 'default'}`}>
                          {job.experienceLevel || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="deadline-info">
                          <Calendar size={14} />
                          {formatDate(job.applicationDeadline)}
                        </div>
                      </td>
                      <td>
                        <div className="description-cell">
                          <div className="description-preview">
                            {expandedJob === job.id
                              ? job.description || "Açıklama yok"
                              : truncateText(job.description, 80)}
                          </div>
                          {job.description && job.description.length > 80 && (
                            <button
                              className="expand-description-btn"
                              onClick={() => toggleJobExpansion(job.id)}
                            >
                              {expandedJob === job.id ? "Daha Az" : "Daha Fazla"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => startEdit(job)}>
                            <Edit2 size={16} />
                            Düzenle
                          </button>
                          <button className="delete-btn" onClick={() => deleteJob(job.id)}>
                            <Trash2 size={16} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}