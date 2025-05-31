import "../../component-styles/NotificationCard.css";
import { Bell, MessageCircle, UserPlus, Check } from 'lucide-react';

function NotificationCard({ notification, onMarkAsRead }) {
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
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`notification-item ${notification.isRead ? 'read' : ''}`}>
            <div className="notification-header">
                {getIcon()}
                <div className="notification-title-section">
                    <h4>{getTypeText()}</h4>
                    <span className="notification-date">
                        {formatDate(notification.creationTime)}
                    </span>
                </div>
            </div>
            <p>{notification.message}</p>
            <div className="notification-actions">
                {!notification.isRead && (
                    <button 
                        className="mark-read-btn" 
                        onClick={() => onMarkAsRead(notification.id)}
                    >
                        <Check size={16} /> Okundu Olarak İşaretle
                    </button>
                )}
            </div>
        </div>
    );
}

export default NotificationCard;
