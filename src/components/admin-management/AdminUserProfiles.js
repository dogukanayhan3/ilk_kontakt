import React, { useEffect, useState } from "react";
const API_BASE = "https://localhost:44388";

export default function AdminUserProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function fetchProfiles() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/app/user-profile?MaxResultCount=1000`, {
      credentials: "include",
    });
    const data = await res.json();
    setProfiles(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  function startEdit(profile) {
    setEditing(profile.id);
    setForm({
      name: profile.name,
      surname: profile.surname,
      email: profile.email,
      address: profile.address,
      bio: profile.bio,
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/user-profile/${id}`, {
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
    fetchProfiles();
  }

  async function deleteProfile(id) {
    if (!window.confirm("Profil silinsin mi?")) return;
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/user-profile/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        RequestVerificationToken: xsrf,
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    fetchProfiles();
  }

  return (
    <div className="admin-section">
      <h2>Kullanıcı Profilleri</h2>
      {loading && <div>Yükleniyor...</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ad</th>
            <th>Soyad</th>
            <th>Email</th>
            <th>Adres</th>
            <th>Bio</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) =>
            editing === p.id ? (
              <tr key={p.id}>
                <td>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={() => saveEdit(p.id)}>Kaydet</button>
                  <button onClick={() => setEditing(null)}>İptal</button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.surname}</td>
                <td>{p.email}</td>
                <td>{p.address}</td>
                <td>{p.bio}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Düzenle</button>
                  <button onClick={() => deleteProfile(p.id)}>Sil</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}