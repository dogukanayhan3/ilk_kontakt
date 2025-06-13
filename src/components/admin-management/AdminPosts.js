import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Save, X, RefreshCw, FileText, User, Calendar, Heart, MessageCircle } from "lucide-react";

const API_BASE = "https://localhost:44388";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/app/post?MaxResultCount=1000`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch posts");
      
      const data = await res.json();
      setPosts(data.items || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function startEdit(post) {
    setEditing(post.id);
    setForm({ 
      content: post.content || "",
      title: post.title || "",
      tags: post.tags || "",
      isPublic: post.isPublic !== undefined ? post.isPublic : true,
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token not found");

      const res = await fetch(`${API_BASE}/api/app/post/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message || "Failed to update post");
      }

      setEditing(null);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
    }
    setLoading(false);
  }

  async function deletePost(id) {
    if (!window.confirm("Gönderi silinsin mi?")) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token not found");

      const res = await fetch(`${API_BASE}/api/app/post/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    setLoading(false);
  }

  const togglePostExpansion = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "İçerik yok";
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
            <FileText size={16} />
            Toplam Gönderi: <strong>{posts.length}</strong>
          </span>
          <span className="stat-item">
            Genel: <strong>{posts.filter(p => p.isPublic).length}</strong>
          </span>
          <span className="stat-item">
            Özel: <strong>{posts.filter(p => !p.isPublic).length}</strong>
          </span>
        </div>
        <button className="refresh-btn" onClick={fetchPosts}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="no-data">
          <FileText size={48} />
          <p>Gönderi bulunamadı.</p>
        </div>
      ) : (
        <div className="enhanced-table-container">
          <div className="table-wrapper">
            <table className="enhanced-admin-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Başlık</th>
                  <th>İçerik</th>
                  <th>Etiketler</th>
                  <th>Görünürlük</th>
                  <th>Beğeni</th>
                  <th>Yorum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) =>
                  editing === post.id ? (
                    <tr key={post.id} className="editing-row">
                      <td colSpan="9">
                        <div className="edit-form-container">
                          <div className="edit-form-grid">
                            <div className="form-group">
                              <label>Başlık</label>
                              <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Gönderi başlığı (opsiyonel)"
                              />
                            </div>
                            <div className="form-group">
                              <label>Etiketler</label>
                              <input
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="Etiketler (virgülle ayırın)"
                              />
                            </div>
                            <div className="form-group">
                              <label>Görünürlük</label>
                              <select
                                value={form.isPublic}
                                onChange={(e) => setForm({ ...form, isPublic: e.target.value === 'true' })}
                              >
                                <option value="true">Genel</option>
                                <option value="false">Özel</option>
                              </select>
                            </div>
                            <div className="form-group full-width">
                              <label>İçerik</label>
                              <textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="Gönderi içeriği"
                                rows="6"
                              />
                            </div>
                          </div>
                          <div className="form-actions">
                            <button className="save-btn" onClick={() => saveEdit(post.id)}>
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
                    <tr key={post.id} className="data-row">
                      <td>
                        <div className="user-info">
                          <User size={16} />
                          <strong>{post.userName || "Bilinmeyen"}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="post-title">
                          {post.title || "Başlıksız"}
                        </div>
                      </td>
                      <td>
                        <div className="content-cell">
                          <div className="content-preview">
                            {expandedPost === post.id
                              ? post.content || "İçerik yok"
                              : truncateText(post.content, 120)}
                          </div>
                          {post.content && post.content.length > 120 && (
                            <button
                              className="expand-content-btn"
                              onClick={() => togglePostExpansion(post.id)}
                            >
                              {expandedPost === post.id ? "Daha Az" : "Daha Fazla"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="tags-cell">
                          {post.tags ? (
                            post.tags.split(',').map((tag, index) => (
                              <span key={index} className="tag-badge">
                                {tag.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="no-tags">Etiket yok</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`visibility-badge ${post.isPublic ? 'public' : 'private'}`}>
                          {post.isPublic ? "Genel" : "Özel"}
                        </span>
                      </td>
                      <td>
                        <div className="stat-cell">
                          <Heart size={14} />
                          {post.numberOfLikes || 0}
                        </div>
                      </td>
                      <td>
                        <div className="stat-cell">
                          <MessageCircle size={14} />
                          {post.userComments?.length || 0}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14} />
                          {formatDate(post.publishDate || post.creationTime)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => startEdit(post)}>
                            <Edit2 size={16} />
                            Düzenle
                          </button>
                          <button className="delete-btn" onClick={() => deletePost(post.id)}>
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