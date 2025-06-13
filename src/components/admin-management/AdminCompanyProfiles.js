import React, { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";

const API_BASE = "https://localhost:44388";

export default function AdminCompanyProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/identity/users?MaxResultCount=1000`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers((data.items || []).filter(u => u.extraProperties?.IsCompanyProfile));
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function setCompanyStatus(id, isCompany) {
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      await fetch(`${API_BASE}/api/identity/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          extraProperties: { IsCompanyProfile: isCompany },
        }),
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error updating company status:", error);
    }
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-stats">
          <span className="stat-item">
            Toplam Şirket: <strong>{users.length}</strong>
          </span>
          <span className="stat-item">
            Onaylı: <strong>{users.filter(u => u.extraProperties?.IsCompanyProfile).length}</strong>
          </span>
        </div>
        <button className="refresh-btn" onClick={fetchCompanies}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {users.length === 0 ? (
        <div className="no-data">
          <p>Şirket profili bulunamadı.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>Email</th>
                <th>Şirket Adı</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="username-cell">{u.userName}</div>
                  </td>
                  <td>
                    <div className="email-cell">{u.email}</div>
                  </td>
                  <td>
                    <div className="name-cell">{u.name}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${u.extraProperties?.IsCompanyProfile ? 'status-completed' : 'status-pending'}`}>
                      {u.extraProperties?.IsCompanyProfile ? "Onaylı" : "Bekliyor"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}