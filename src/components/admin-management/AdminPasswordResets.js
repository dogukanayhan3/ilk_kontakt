// AdminPasswordResets.jsx
import React, { useEffect, useState } from "react";
import { Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";

const API_BASE = "https://localhost:44388";

export default function AdminPasswordResets() {
  const [resetRequests, setResetRequests] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to parse and identify password reset requests
  const parsePasswordResetRequests = (messages) => {
    return messages.filter(message => {
      // Check if the message is a password reset request
      const messageContent = message.message?.toLowerCase() || '';
      const nameContent = message.name?.toLowerCase() || '';
      
      return (
        messageContent.includes('password reset') ||
        messageContent.includes('şifre sıfırlama') ||
        messageContent.includes('password reset request') ||
        nameContent.includes('password reset') ||
        // Check if the message contains typical password reset patterns
        (messageContent.includes('reset') && messageContent.includes('password')) ||
        (messageContent.includes('sıfırla') && messageContent.includes('şifre')) ||
        // Check for specific patterns like "Password reset request for user:"
        messageContent.includes('password reset request for user') ||
        messageContent.includes('password reset request for username')
      );
    }).map(message => {
      // Parse additional information from the message content
      const messageContent = message.message || '';
      
      // Extract username if present in the message
      let extractedUsername = '';
      const usernameMatch = messageContent.match(/for user(?:name)?:\s*(\S+)/i);
      if (usernameMatch) {
        extractedUsername = usernameMatch[1];
      }
      
      // Determine status based on message age and content
      let status = 'pending';
      const messageDate = new Date(message.creationTime);
      const now = new Date();
      const hoursDiff = (now - messageDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        status = 'expired';
      } else if (messageContent.includes('completed') || messageContent.includes('tamamlandı')) {
        status = 'completed';
      }
      
      return {
        ...message,
        extractedUsername,
        status,
        requestType: 'Password Reset'
      };
    });
  };

  async function fetchPasswordResets() {
    setLoading(true);
    try {
      // Fetch all contact messages
      const res = await fetch(
        `${API_BASE}/api/app/contact-us?MaxResultCount=1000`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      const allMessages = data.items || [];
      
      // Parse and filter for password reset requests
      const passwordResets = parsePasswordResetRequests(allMessages);
      setResetRequests(passwordResets);
    } catch (error) {
      console.error("Error fetching password reset requests:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPasswordResets();
  }, []);

  async function deleteResetRequest(id) {
    if (!window.confirm("Şifre sıfırlama talebi silinsin mi?")) return;
    setLoading(true);
    try {
      const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
      // Delete from the contact-us endpoint since that's where the data is stored
      await fetch(`${API_BASE}/api/app/contact-us/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      fetchPasswordResets();
    } catch (error) {
      console.error("Error deleting reset request:", error);
    }
  }

  const toggleRequestExpansion = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "Bekliyor", class: "status-pending" },
      completed: { text: "Tamamlandı", class: "status-completed" },
      expired: { text: "Süresi Doldu", class: "status-expired" },
    };
    
    const statusInfo = statusMap[status] || { text: status, class: "status-default" };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Function to format the message content for better display
  const formatMessageContent = (message) => {
    // Clean up the message for better readability
    let formattedMessage = message.replace(/Password reset request for user(?:name)?:\s*/i, '');
    formattedMessage = formattedMessage.replace(/^Password Reset Request\s*/i, '');
    
    return formattedMessage || 'Şifre sıfırlama talebi';
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-stats">
          <span className="stat-item">
            Toplam: <strong>{resetRequests.length}</strong>
          </span>
          <span className="stat-item">
            Bekleyen: <strong>{resetRequests.filter(r => r.status === 'pending').length}</strong>
          </span>
          <span className="stat-item">
            Süresi Dolan: <strong>{resetRequests.filter(r => r.status === 'expired').length}</strong>
          </span>
        </div>
        <button className="refresh-btn" onClick={fetchPasswordResets}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>
      
      {resetRequests.length === 0 ? (
        <div className="no-data">
          <p>Şifre sıfırlama talebi bulunamadı.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Kullanıcı Adı</th>
                <th>Talep Detayı</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {resetRequests.map((request) => (
                <tr key={request.id} className={`request-row status-${request.status}`}>
                  <td>
                    <div className="email-cell">
                      {request.email}
                    </div>
                  </td>
                  <td>
                    <div className="username-cell">
                      {request.extractedUsername || request.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="message-content">
                      <div className="message-preview">
                        {expandedRequest === request.id
                          ? formatMessageContent(request.message)
                          : `${formatMessageContent(request.message)?.substring(0, 80)}${
                              formatMessageContent(request.message)?.length > 80 ? "..." : ""
                            }`}
                      </div>
                      {formatMessageContent(request.message)?.length > 80 && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleRequestExpansion(request.id)}
                        >
                          {expandedRequest === request.id ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    <div className="date-cell">
                      {formatDate(request.creationTime)}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => deleteResetRequest(request.id)}
                      className="delete-btn"
                      title="Talebi Sil"
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