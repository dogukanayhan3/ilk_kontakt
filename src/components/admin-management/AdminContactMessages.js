// AdminContactMessages.jsx (Updated)
import React, { useEffect, useState } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";

const API_BASE = "https://localhost:44388";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to filter out password reset requests
  const filterContactMessages = (messages) => {
    return messages.filter(message => {
      const messageContent = message.message?.toLowerCase() || '';
      const nameContent = message.name?.toLowerCase() || '';
      
      // Exclude password reset requests
      return !(
        messageContent.includes('password reset') ||
        messageContent.includes('şifre sıfırlama') ||
        messageContent.includes('password reset request') ||
        nameContent.includes('password reset') ||
        (messageContent.includes('reset') && messageContent.includes('password')) ||
        (messageContent.includes('sıfırla') && messageContent.includes('şifre')) ||
        messageContent.includes('password reset request for user') ||
        messageContent.includes('password reset request for username')
      );
    });
  };

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/app/contact-us?MaxResultCount=1000`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      const allMessages = data.items || [];
      
      // Filter out password reset requests
      const contactMessages = filterContactMessages(allMessages);
      setMessages(contactMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function deleteMessage(id) {
    if (!window.confirm("Mesaj silinsin mi?")) return;
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      await fetch(`${API_BASE}/api/app/contact-us/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-stats">
          <span className="stat-item">
            Toplam Mesaj: <strong>{messages.length}</strong>
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="no-data">
          <p>İletişim mesajı bulunamadı.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Email</th>
                <th>Mesaj</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <div className="name-cell">
                      {message.name}
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      {message.email}
                    </div>
                  </td>
                  <td>
                    <div className="message-content">
                      <div className="message-preview">
                        {expandedMessage === message.id
                          ? message.message
                          : `${message.message?.substring(0, 100)}${
                              message.message?.length > 100 ? "..." : ""
                            }`}
                      </div>
                      {message.message?.length > 100 && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleMessageExpansion(message.id)}
                        >
                          {expandedMessage === message.id ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {formatDate(message.creationTime)}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => deleteMessage(message.id)}
                      className="delete-btn"
                      title="Mesajı Sil"
                    >
                      <Trash2 size={16} />
                    </button>
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