import React, { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, UserPlus, Check } from 'lucide-react';
import '../../component-styles/NotificationModal.css';

const API_BASE = 'https://localhost:44388';
const NOTIFICATION_ROOT = `${API_BASE}/api/app/notification`;

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function NotificationItem({ notification, onMarkAsRead, onSubmitFeedback }) {
    const getIcon = () => {
        switch (notification.type) {
            case 0: // Message
                return <MessageCircle className="notification-icon message" />;
            case 1: // Connection
                return <UserPlus className="notification-icon connection" />;
            case 2: // ProfileUpdate
                return <Bell className="notification-icon update" />;
            default:
                return <Bell className="notification-icon update" />;
        }
    };

    const getTypeText = () => {
        switch (notification.type) {
            case 0:
                return 'Mesaj';
            case 1:
                return 'Bağlantı';
            case 2:
                return 'Profil Güncellemesi';
            default:
                return 'Bildirim';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Az önce';
        } else if (diffInHours < 24) {
            return `${diffInHours} saat önce`;
        } else {
            return date.toLocaleDateString('tr-TR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className={`notification-modal-item ${notification.isRead ? 'read' : ''}`}>
            <div className="notification-modal-header">
                {getIcon()}
                <div className="notification-modal-content">
                    <div className="notification-modal-title">
                        <span className="notification-type">{getTypeText()}</span>
                        <span className="notification-time">
                            {formatDate(notification.creationTime)}
                        </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                </div>
                {!notification.isRead && (
                    <button 
                        className="mark-read-btn-small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        title="Okundu olarak işaretle"
                    >
                        <Check size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}

function NotificationModal({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    async function fetchNotifications() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `${NOTIFICATION_ROOT}?SkipCount=0&MaxResultCount=50&Sorting=CreationTime desc`,
                { 
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Bildirimler yüklenirken hata oluştu');
            }
            
            const data = await response.json();
            setNotifications(data.items || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkAsRead(id) {
        try {
            // Get XSRF token
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('İstek doğrulanamadı (XSRF token eksik).');
                return;
            }

            const response = await fetch(`${NOTIFICATION_ROOT}/${id}/mark-as-read`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Bildirim okundu olarak işaretlenirken hata oluştu');
            }

            // Update local state
            setNotifications(notifications.map(notification => 
                notification.id === id 
                    ? { ...notification, isRead: true } 
                    : notification
            ));
        } catch (e) {
            setError(e.message);
        }
    }

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        for (const notification of unreadNotifications) {
            await handleMarkAsRead(notification.id);
        }
    };

    const handleSubmitFeedback = (id) => {
        console.log(`Feedback submitted for notification ${id}`);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div className="notification-modal-overlay" onClick={onClose}>
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-modal-header-section">
                    <div className="notification-modal-title-section">
                        <Bell size={20} />
                        <h3>Bildirimler</h3>
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                        )}
                    </div>
                    <div className="notification-modal-actions">
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read-btn"
                                onClick={handleMarkAllAsRead}
                            >
                                Tümünü Okundu İşaretle
                            </button>
                        )}
                        <button className="close-modal-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="notification-modal-body">
                    {loading ? (
                        <div className="notification-modal-loading">
                            <div className="loading-spinner"></div>
                            <span>Bildirimler yükleniyor...</span>
                        </div>
                    ) : error ? (
                        <div className="notification-modal-error">
                            <span>Hata: {error}</span>
                            <button onClick={fetchNotifications}>Tekrar Dene</button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-modal-empty">
                            <Bell size={48} />
                            <h4>Henüz bildiriminiz yok</h4>
                            <p>Yeni bildirimler burada görünecek.</p>
                        </div>
                    ) : (
                        <div className="notification-modal-list">
                            {notifications.map(notification => (
                                <NotificationItem 
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onSubmitFeedback={handleSubmitFeedback}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationModal;
