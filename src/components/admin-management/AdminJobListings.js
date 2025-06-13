import React, { useEffect, useState } from "react";
const API_BASE = "https://localhost:44388";

export default function AdminJobListings() {
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function fetchJobs() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/app/job-listing?MaxResultCount=1000`, {
      credentials: "include",
    });
    const data = await res.json();
    setJobs(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function startEdit(job) {
    setEditing(job.id);
    setForm({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/job-listing/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        RequestVerificationToken: xsrf,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(form),
    });
    setEditing(null);
    fetchJobs();
  }

  async function deleteJob(id) {
    if (!window.confirm("İş ilanı silinsin mi?")) return;
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/job-listing/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        RequestVerificationToken: xsrf,
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    fetchJobs();
  }

  return (
    <div className="admin-section">
      <h2>İş İlanları</h2>
      {loading && <div>Yükleniyor...</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Başlık</th>
            <th>Şirket</th>
            <th>Açıklama</th>
            <th>Konum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) =>
            editing === j.id ? (
              <tr key={j.id}>
                <td>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={() => saveEdit(j.id)}>Kaydet</button>
                  <button onClick={() => setEditing(null)}>İptal</button>
                </td>
              </tr>
            ) : (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.company}</td>
                <td>{j.description}</td>
                <td>{j.location}</td>
                <td>
                  <button onClick={() => startEdit(j)}>Düzenle</button>
                  <button onClick={() => deleteJob(j.id)}>Sil</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}