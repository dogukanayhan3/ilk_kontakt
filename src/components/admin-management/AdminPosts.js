import React, { useEffect, useState } from "react";
const API_BASE = "https://localhost:44388";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/app/post?MaxResultCount=1000`, {
      credentials: "include",
    });
    const data = await res.json();
    setPosts(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function startEdit(post) {
    setEditing(post.id);
    setForm({ content: post.content });
  }

  async function saveEdit(id) {
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/post/${id}`, {
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
    fetchPosts();
  }

  async function deletePost(id) {
    if (!window.confirm("Gönderi silinsin mi?")) return;
    setLoading(true);
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    await fetch(`${API_BASE}/api/app/post/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        RequestVerificationToken: xsrf,
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    fetchPosts();
  }

  return (
    <div className="admin-section">
      <h2>Gönderiler</h2>
      {loading && <div>Yükleniyor...</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>İçerik</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) =>
            editing === p.id ? (
              <tr key={p.id}>
                <td>{p.userName}</td>
                <td>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </td>
                <td>{new Date(p.publishDate).toLocaleString()}</td>
                <td>
                  <button onClick={() => saveEdit(p.id)}>Kaydet</button>
                  <button onClick={() => setEditing(null)}>İptal</button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.userName}</td>
                <td>{p.content}</td>
                <td>{new Date(p.publishDate).toLocaleString()}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Düzenle</button>
                  <button onClick={() => deletePost(p.id)}>Sil</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}