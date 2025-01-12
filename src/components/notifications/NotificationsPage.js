import React, { useState } from 'react';
import { Bell, MessageCircle, UserPlus, Check } from 'lucide-react';
import NotificationCard from './NotificationCard';
import Layout from '../page_layout/Layout';
import '../../component-styles/NotificationsPage.css';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'message',
            title: 'John’dan Yeni Mesaj',
            content: 'John’dan yeni bir mesaj aldınız! Yarın saat 3’teki toplantı hakkında sorular soruyor. Katılımınızı onaylamak için mesajındaki detayları kontrol etmeyi unutmayın.',
            read: true
        },
        {
            id: '2',
            type: 'connection',
            title: 'Alice’den Bağlantı İsteği',
            content: 'Alice size bir bağlantı isteği gönderdi. Sizinle ağ kurmak ve olası bir projede iş birliği yapmak istiyor.',
            read: false
        },
        {
            id: '3',
            type: 'profile-update',
            title: 'Profil Güncellemesi Başarılı',
            content: 'Profiliniz başarıyla güncellendi. Tüm değişiklikler kaydedildi ve profiliniz artık son başarılarınıza daha uygun hale getirildi.',
            read: true
        }
    ]);

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const handleSubmitFeedback = (id) => {
        // Placeholder for feedback submission logic
        console.log(`Feedback submitted for notification ${id}`);
    };

    return (
        <Layout>
            <div className="notifications-page">
                <div className="notifications-header">
                    <Bell size={24} />
                    <h2>Bildirimler</h2>
                </div>
                <div className="notifications-container">
                    {notifications.map(notification => (
                    <NotificationCard 
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onSubmitFeedback={handleSubmitFeedback}
                    />
                    ))}
                </div>
            </div>
        </Layout>
    );
}

export default NotificationsPage;