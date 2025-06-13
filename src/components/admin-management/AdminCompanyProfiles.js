import React, { useEffect, useState } from "react";
const API_BASE = "https://localhost:44388";

export default function AdminCompanyProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchCompanies() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/identity/users?MaxResultCount=1000`, {
      credentials: "include",
    });
    const data = await res.json();
    setUsers((data.items || []).filter(u => u.extraProperties?.IsCompanyProfile));
    setLoading(false);
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function setCompanyStatus(id, isCompany) {
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/identity/users/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        RequestVerificationToken: xsrf,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        extraProperties: { IsCompanyProfile: isCompany },
      }),
    });
    fetchCompanies();
  }

  return (
    <div className="admin-section">
      <h2>Şirket Profilleri</h2>
      {loading && <div>Yükleniyor...</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Email</th>
            <th>Ad</th>
            <th>Onaylı mı?</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.userName}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.extraProperties?.IsCompanyProfile ? "Evet" : "Hayır"}</td>
              <td>
                <button onClick={() => setCompanyStatus(u.id, true)}>Onayla</button>
                <button onClick={() => setCompanyStatus(u.id, false)}>Reddet</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}