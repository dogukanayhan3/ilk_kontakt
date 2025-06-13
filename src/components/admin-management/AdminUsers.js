import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Save, X } from "lucide-react";

const API_BASE = "https://localhost:44388";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/identity/users?MaxResultCount=1000`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function startEdit(user) {
    setEditing(user.id);
    setForm({
      userName: user.userName,
      email: user.email,
      name: user.name,
      surname: user.surname,
      isCompany: user.extraProperties?.IsCompanyProfile || false,
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    try {
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
          ...form,
          extraProperties: { IsCompanyProfile: form.isCompany },
        }),
      });
      setEditing(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Kullanıcı silinsin mi?")) return;
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      await fetch(`${API_BASE}/api/identity/users/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-section">
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı Adı</th>
              <th>Email</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Şirket?</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              editing === u.id ? (
                <tr key={u.id} className="editing-row">
                  <td>
                    <input
                      value={form.userName}
                      onChange={(e) =>
                        setForm({ ...form, userName: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.surname}
                      onChange={(e) =>
                        setForm({ ...form, surname: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={form.isCompany}
                      onChange={(e) =>
                        setForm({ ...form, isCompany: e.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => saveEdit(u.id)}>
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditing(null)}>
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={u.id}>
                  <td>{u.userName}</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.surname}</td>
                  <td>{u.extraProperties?.IsCompanyProfile ? "Evet" : "Hayır"}</td>
                  <td>
                    <button onClick={() => startEdit(u)}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteUser(u.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}