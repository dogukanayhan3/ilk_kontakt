import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationCard from './NotificationCard';
import Layout from '../page_layout/Layout';
import '../../component-styles/NotificationsPage.css';

const API_BASE = 'https://localhost:44388';
const NOTIFICATION_ROOT = `${API_BASE}/api/app/notification`;

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `${NOTIFICATION_ROOT}?SkipCount=0&MaxResultCount=100&Sorting=CreationTime desc`,
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

    if (loading) {
        return (
            <Layout>
                <div className="notifications-page">
                    <div className="loading-container">
                        <div className="loading-message">Bildirimler yükleniyor...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="notifications-page">
                    <div className="error-container">
                        <div className="error-message">Hata: {error}</div>
                        <button 
                            className="retry-btn" 
                            onClick={fetchNotifications}
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="notifications-page">
                <div className="notifications-header">
                    <Bell size={24} />
                    <h2>Bildirimler</h2>
                    {notifications.length > 0 && (
                        <span className="notification-count">
                            ({notifications.filter(n => !n.isRead).length} okunmamış)
                        </span>
                    )}
                </div>
                <div className="notifications-container">
                    {notifications.length === 0 ? (
                        <div className="no-notifications">
                            <Bell size={48} />
                            <h3>Henüz bildiriminiz yok</h3>
                            <p>Yeni bildirimler burada görünecek.</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <NotificationCard 
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default NotificationsPage;
