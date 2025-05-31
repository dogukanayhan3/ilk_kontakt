import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationModal from './NotificationModal';
import '../../component-styles/NotificationButton.css';

const API_BASE = 'https://localhost:44388';
const NOTIFICATION_ROOT = `${API_BASE}/api/app/notification`;

function NotificationButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchUnreadCount() {
        try {
            const response = await fetch(
                `${NOTIFICATION_ROOT}?SkipCount=0&MaxResultCount=100`,
                { 
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                const unread = (data.items || []).filter(n => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (e) {
            console.error('Failed to fetch unread count:', e);
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false);
        // Refresh unread count when modal closes
        fetchUnreadCount();
    };

    return (
        <>
            <button 
                className="notification-button"
                onClick={() => setIsModalOpen(true)}
                title="Bildirimler"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-button-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            <NotificationModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
            />
        </>
    );
}

export default NotificationButton;
